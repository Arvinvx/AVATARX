import express from 'express'
import session from 'express-session'
import { authRouter } from './routes/auth.js'
import { generateRouter } from './routes/generate.js'
import { avatarsRouter } from './routes/avatars.js'

const app = express();
const PORT = 3000


app.use(express.static('public'))
app.use(express.json({ limit: '10mb' }))

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true }
}))


app.use('/auth',authRouter)
app.use('/generate',generateRouter)
app.use('/avatar',avatarsRouter)


app.listen(PORT,() => {
    console.log(`server is running ${PORT}`)
})  