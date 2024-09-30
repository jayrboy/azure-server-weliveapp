import express from 'express'
import {
  getAll,
  updateRole,
  createBankAccount,
  updateUser,
} from '../Controllers/user-controller.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

// http://localhost:8000/api/users

router.get('/users', auth, getAll)

router.post('/user/change-role', auth, updateRole)

router.post('/user/bank-account/:id', auth, createBankAccount)

router.put('/user', updateUser)

export default router
