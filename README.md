# AVATARX

AI avatar generator. Describe your avatar in text, OpenAI refines the prompt, HuggingFace generates the image.

## Stack

- **Backend** — Node.js, Express, SQLite
- **Auth** — express-session with bcrypt
- **AI** — OpenAI (prompt refinement) + HuggingFace FLUX.1-schnell (image generation)
- **Frontend** — Vanilla JS, HTML/CSS

## Setup

1. Install dependencies
```bash
npm install
```

2. Create a `.env` file
```
AI_KEY=your_openai_key
AI_URL=your_openai_base_url
AI_MODEL=your_model
HF_TOKEN=your_huggingface_token
```

3. Run the server
```bash
node server.js
```

4. Open `http://localhost:3000`

## Features

- Register / Login with session-based auth
- Describe your avatar → AI refines the prompt → HuggingFace generates the image
- Save avatars to your profile
- Gallery of all your generated avatars
