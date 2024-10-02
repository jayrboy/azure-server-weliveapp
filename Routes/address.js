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

router.get('/province/amphure/:id', (req, res) => {
  let id = req.params.id

  Amphure.find({ province_id: id })
    .exec()
    .then((docs) => res.status(200).json(docs))
    .catch((error) => res.status(500).json({ message: error }))
})

router.get('/district/amphure/:id', (req, res) => {
  let id = req.params.id

  District.find({ amphure_id: id })
    .exec()
    .then((docs) => res.status(200).json(docs))
    .catch((error) => res.status(500).json({ message: error }))
})

router.get('/geography', (req, res) => {
  Geography.find({})
    .exec()
    .then((docs) => res.json(docs))
})

export default router
