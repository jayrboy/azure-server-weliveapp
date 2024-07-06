import express from 'express'
import ExpressModel from '../Models/ExpressModel.js'

const router = express.Router()

router.post('/ex/create', (req, res) => {
  let form = req.body
  let data = {
    exname: form.exname || '',
    fprice: form.fprice || 0,
    sprice: form.sprice || '',
    maxprice: form.maxprice || 0,
    whenfprice: form.whenfprice || 0,
    selectex: form.selectex || 1,
    selectcod: form.selectcod || 1,
    date_start: new Date(Date.parse(form.date_start)) || new Date(),
  }

  ExpressModel.create(data)
    .then((docs) => {
      console.log('Document saved')
      res.send(true)
    })
    .catch((err) => {
      console.log(err.message).send(false)
    })
})

router.get('/ex/read', (req, res) => {
  ExpressModel.find()
    .exec()
    .then((docs) => {
      res.json(docs)
    })
})

router.post('/ex/update', (req, res) => {
  let form = req.body
  let data = {
    exname: form.exname || '',
    fprice: form.fprice || 0,
    sprice: form.sprice || '',
    maxprice: form.maxprice || 0,
    whenfprice: form.whenfprice || 0,
    date_start: new Date(Date.parse(form.date_start)) || new Date(),
  }

  ExpressModel.findByIdAndUpdate(form._id, data, { useFindAndModify: false })
    .exec()
    .then(() => {
      //หลังการอัปเดต ก็อ่านข้อมูลอีกครั้ง แล้วส่งไปแสดงผลที่ฝั่งโลคอลแทนข้อมูลเดิม
      ExpressModel.find()
        .exec()
        .then((docs) => res.json(docs))
    })
    .catch((err) => res.json({ message: err }))
})

router.post('/ex/delete', (req, res) => {
  let _id = req.body._id

  ExpressModel.findOneAndDelete(_id, { useFindAndModify: false })
    .exec()
    .then(() => {
      ExpressModel.find()
        .exec()
        .then((docs) => res.json(docs))
    })
    .catch((err) => res.json({ message: err.message }))
})

router.get('/ex/search', (req, res) => {
  let q = req.query.q || ''

  //กรณีนี้ให้กำหนด pattern ด้วย RegExp แทนการใช้ / /
  let pattern = new RegExp(q, 'ig')

  //จะค้นหาจากฟิลด์ name
  let conditions = {
    $or: [{ exname: { $regex: pattern } }, { detail: { $regex: pattern } }],
  }

  let options = {
    page: req.query.page || 1, //เพจปัจจุบัน
    limit: 3, //แสดงผลหน้าละ 2 รายการ (ข้อมูลมีน้อย)
  }

  ExpressModel.paginate(conditions, options, (err, result) => {
    res.json(result)
  })
})

export default router
