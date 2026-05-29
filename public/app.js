// ─── CONFIG ───────────────────────────────────────────────
const API_BASE = 'http://localhost:3000'

// ─── STATE ────────────────────────────────────────────────
let currentUser = null
let currentImageUrl = null
let currentRefinedPrompt = null

// ─── INIT ─────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  checkAuth()
})

async function checkAuth() {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include'
    })
    if (res.ok) {
      const user = await res.json()
      if (user) {
        currentUser = user
        showApp()
        loadGallery()
      } else {
        showAuth()
      }
    } else {
      showAuth()
    }
  } catch {
    showAuth()
  }
}

// ─── AUTH ─────────────────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((t, i) => {
    t.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'))
  })
  document.getElementById('login-form').classList.toggle('active', tab === 'login')
  document.getElementById('register-form').classList.toggle('active', tab === 'register')
}

async function login() {
  const email = document.getElementById('login-email').value.trim()
  const password = document.getElementById('login-password').value
  const errEl = document.getElementById('login-error')
  const btn = document.querySelector('#login-form .btn-primary')

  if (!email || !password) return showAuthError(errEl, 'Fill in all fields.')

  btn.disabled = true
  btn.textContent = 'LOGGING IN...'

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')

    const meRes = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
    currentUser = await meRes.json()
    showApp()
    loadGallery()
  } catch (err) {
    showAuthError(errEl, err.message)
  } finally {
    btn.disabled = false
    btn.textContent = 'LOGIN →'
  }
}

async function register() {
  const username = document.getElementById('reg-username').value.trim()
  const email = document.getElementById('reg-email').value.trim()
  const password = document.getElementById('reg-password').value
  const errEl = document.getElementById('reg-error')
  const btn = document.querySelector('#register-form .btn-primary')

  if (!username || !email || !password) return showAuthError(errEl, 'Fill in all fields.')

  btn.disabled = true
  btn.textContent = 'CREATING...'

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, email, password })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Registration failed')

    const meRes = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
    currentUser = await meRes.json()
    showApp()
    loadGallery()
  } catch (err) {
    showAuthError(errEl, err.message)
  } finally {
    btn.disabled = false
    btn.textContent = 'CREATE ACCOUNT →'
  }
}

function logout() {
  currentUser = null
  showAuth()
}

// ─── GENERATE ─────────────────────────────────────────────
async function generate() {
  const description = document.getElementById('description').value.trim()
  if (!description) return showToast('Write a description first.', true)

  const btn = document.getElementById('generate-btn')
  btn.disabled = true

  try {
    // Step 1: Refine prompt with OpenAI
    setStep(1)
    setStatus('Refining prompt with OpenAI...', true)
    showLoading('Refining prompt...')

    const refineRes = await fetch(`${API_BASE}/generate/refine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ description })
    })
    const { refinedPrompt } = await refineRes.json()
    currentRefinedPrompt = refinedPrompt

    document.getElementById('refined-prompt-text').textContent = refinedPrompt
    document.getElementById('prompt-preview').style.display = 'block'

    // Step 2: Generate image with HuggingFace
    setStep(2)
    setStatus('Generating image with HuggingFace...', true)
    setLoadingText('Generating avatar...')

    const generateRes = await fetch(`${API_BASE}/generate/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ prompt: refinedPrompt })
    })
    const { imageUrl } = await generateRes.json()
    currentImageUrl = imageUrl

    // Step 3: Done
    setStep(3)
    setStatus('Avatar ready.', false)
    hideLoading()
    showResult(imageUrl, refinedPrompt)

  } catch (err) {
    hideLoading()
    setStatus('Something went wrong.', false)
    showToast(err.message || 'Generation failed.', true)
    resetSteps()
  } finally {
    btn.disabled = false
    btn.textContent = 'GENERATE AVATAR →'
  }
}

async function saveAvatar() {
  if (!currentImageUrl) return
  try {
    const res = await fetch(`${API_BASE}/avatar/saveavatar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        imageUrl: currentImageUrl,
        prompt: currentRefinedPrompt
      })
    })
    if (!res.ok) throw new Error('Save failed')
    showToast('Avatar saved to profile.')
    loadGallery()
  } catch {
    showToast('Failed to save.', true)
  }
}

// ─── GALLERY ──────────────────────────────────────────────
async function loadGallery() {
  try {
    const res = await fetch(`${API_BASE}/avatar/getavatar`, {
      method: 'POST',
      credentials: 'include'
    })
    const { avatars } = await res.json()
    renderGallery(avatars)
  } catch {
    // gallery stays empty
  }
}

function renderGallery(avatars) {
  const grid = document.getElementById('gallery-grid')
  const count = document.getElementById('gallery-count')
  count.textContent = `${avatars.length} generated`

  if (!avatars.length) {
    grid.innerHTML = '<div class="gallery-empty">No avatars yet. Generate your first one.</div>'
    return
  }

  grid.innerHTML = avatars.map(av => `
    <div class="gallery-item">
      <img src="${av.image_url}" alt="Avatar" loading="lazy" />
      <div class="gallery-item-overlay">
        <p>${av.prompt?.slice(0, 60)}...</p>
      </div>
    </div>
  `).join('')
}

// ─── UI HELPERS ───────────────────────────────────────────
function showApp() {
  document.getElementById('auth-page').classList.remove('active')
  document.getElementById('app-page').classList.add('active')
  document.getElementById('navbar').style.display = 'flex'
  document.getElementById('nav-username').textContent = currentUser?.username || ''
}

function showAuth() {
  document.getElementById('auth-page').classList.add('active')
  document.getElementById('app-page').classList.remove('active')
  document.getElementById('navbar').style.display = 'none'
}

function showAuthError(el, msg) {
  el.textContent = msg
  el.style.display = 'block'
  setTimeout(() => el.style.display = 'none', 3000)
}

function showLoading(text) {
  document.getElementById('loading-overlay').classList.add('visible')
  document.getElementById('loading-text').textContent = text
  document.getElementById('image-placeholder').style.display = 'none'
  document.getElementById('generated-image').style.display = 'none'
}

function hideLoading() {
  document.getElementById('loading-overlay').classList.remove('visible')
}

function setLoadingText(text) {
  document.getElementById('loading-text').textContent = text
}

function showResult(url, prompt) {
  const img = document.getElementById('generated-image')
  img.src = url
  img.style.display = 'block'
  const meta = document.getElementById('result-meta')
  meta.classList.add('visible')
  document.getElementById('result-prompt-display').textContent = `Prompt: ${prompt?.slice(0, 100)}...`
}

function setStep(n) {
  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById(`step-${i}`)
    if (i < n) el.className = 'step done'
    else if (i === n) el.className = 'step active'
    else el.className = 'step'
  }
}

function resetSteps() {
  for (let i = 1; i <= 3; i++) {
    document.getElementById(`step-${i}`).className = 'step'
  }
}

function setStatus(text, loading) {
  const el = document.getElementById('status-text')
  el.textContent = text
  el.className = loading ? 'status-text loading' : 'status-text'
}

function showToast(msg, error = false) {
  const toast = document.getElementById('toast')
  toast.textContent = msg
  toast.className = `toast visible${error ? ' error' : ''}`
  setTimeout(() => toast.className = 'toast', 3000)
}

// Enter key on inputs
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('auth-page').classList.contains('active')) {
    const activeForm = document.querySelector('.auth-form.active')
    if (activeForm.id === 'login-form') login()
    else register()
  }
})
