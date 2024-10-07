import express from 'express'
import {
  getAll,
  getById,
  updateRole,
  createBankAccount,
  updateBankAccount,
  getBankAccount,
} from '../Controllers/user-controller.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

// http://localhost:8000/api/users

router.get('/users', auth, getAll)

router.get('/user/:id', getById)

router.post('/user/change-role', auth, updateRole)

router.post('/user/bank-account', auth, createBankAccount)

router.get('/user/bank-account/:id', getBankAccount)

router.put('/user/bank-account', auth, updateBankAccount)

export default router
