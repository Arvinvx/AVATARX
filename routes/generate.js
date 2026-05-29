import { refine, image} from '../controllers/generateController.js'
import express from 'express'

export const generateRouter = express.Router()

generateRouter.post('/refine', refine)
generateRouter.post('/image', image)
