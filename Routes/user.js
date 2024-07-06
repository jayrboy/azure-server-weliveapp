import express from 'express'
import { getAll, updateRole } from '../Controllers/user-controller.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

// http://localhost:8000/api/users

router.get('/users', auth, getAll)

router.post('/user/change-role', auth, updateRole)

export default router
