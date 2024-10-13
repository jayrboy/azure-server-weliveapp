import express from 'express'
import {
  createLiveVideo,
  getAll,
  getById,
  updateComments,
  updateKeyword,
} from '../Controllers/live-video-controller.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

//? http://localhost:8000/api/live-video

router.post('/live-video/create', createLiveVideo)

router.get('/live-video/read', getAll)

router.get('/live-video/read/:id', getById)

router.put('/live-video/update/comments', updateComments)

router.put('/live-video/update/keyword', updateKeyword)

export default router
