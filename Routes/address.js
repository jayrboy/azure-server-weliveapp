import express from 'express'

import Province from '../Models/Province.js'
import Amphure from '../Models/Amphure.js'
import District from '../Models/District.js'
import Geography from '../Models/Geography.js'

const router = express.Router()

// http://localhost:8000/api/users

router.get('/province', (req, res) => {
  Province.find({})
    .exec()
    .then((docs) => res.json(docs))
})

router.get('/amphure', (req, res) => {
  Amphure.find({})
    .exec()
    .then((docs) => res.json(docs))
})

router.get('/district', (req, res) => {
  District.find({})
    .exec()
    .then((docs) => res.json(docs))
})

router.get('/geography', (req, res) => {
  Geography.find({})
    .exec()
    .then((docs) => res.json(docs))
})

export default router
