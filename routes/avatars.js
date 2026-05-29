import { getAvatars , saveAvatar} from '../controllers/avatarsController.js'
import express from 'express'

export const avatarsRouter = express.Router()

avatarsRouter.post('/getavatar', getAvatars)
avatarsRouter.post('/saveavatar', saveAvatar)
