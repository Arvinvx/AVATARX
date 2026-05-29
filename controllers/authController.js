import validator from 'validator'
import { getDBConnection } from '../db/db.js'
import bcrypt from 'bcryptjs'


export async function registerUser(req,res){
  let { email, username, password } = req.body

  if (!email || !username || !password) {
    return res.status(400).json({error : 'All fields are required.'})
  }

  username = username.trim()
  password = password.trim()
  email = email.trim()

    if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' })
    }


    try{
        const db = await getDBConnection()
        const existing = await db.get(`SELECT id FROM users WHERE username = ?  OR email = ? `,[username,email])

        if (existing){
          return res.status(400).json("Email or username is already in use")
        }

        const hashed = await bcrypt.hash(password,10)
        const result = await db.run(`INSERT INTO users (email, username, password) VALUES 
        (?,?,?)`,[email, username, hashed])
        console.log(result)

        req.session.userId = result.lastID

        res.status(201).json({message: 'User registered'})

    }catch(err){
        res.status(500).json({error: err.message})
    }
}

export async function loginUser(req,res){
  let { email, password } = req.body

  if (!email || !password ) {
    return res.status(400).json({error : 'All field are required'})
  }

  email = email.trim()

  try {
    const db = await getDBConnection()
    const user = await db.get('SELECT * FROM users WHERE email = ?',[email])

    if (!user){
      return res.status(401).json({error : " Invalid credentials " })
    }

    const isValid = await bcrypt.compare(password , user.password)
    if (!isValid){
      return res.status(401).json({error : 'Invalid credentials'})
    }
    
    req.session.userId = user.id
    res.json({ message: 'Logged in' })
    
  }catch(err){
    res.status(500).json({error: err})
  }
}

export async function me(req,res){
   if (!req.session || !req.session.userId) {
    return res.json(null);
  }

  const db = await getDBConnection();

  try{
    const user = await db.get(`
      SELECT email, username FROM users WHERE id = ? `,[req.session.userId]
    );

    res.json(user) 

  }catch(err){
    console.error('Database error in me():', err);
  }
  
}