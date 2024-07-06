import Product from '../Models/Product.js'
import DailyStock from '../Models/DailyStock.js'

export const create = (req, res) => {
  let form = req.body
  let data = {
    status: form.status || 'New',
    chanel: form.chanel || 'Facebook',
    products: form.products || [],
    price_total: form.price_total || 0,
    date_added: form.date_added
      ? new Date(Date.parse(form.date_added))
      : new Date(),
  }

  // console.log(data)

  DailyStock.create(data)
    .then((docs) => {
      console.log('document saved new daily stock')
      res.send(true)
    })
    .catch((err) => {
      console.log('error saving daily stock:', err)
      res.send(false)
    })
}

export const getAll = (req, res) => {
  DailyStock.find({ status: 'new' })
    .sort({ date_added: -1 }) // เรียงข้อมูลตามวันที่เพิ่มข้อมูลล่าสุดก่อน
    .exec()
    .then((docs) => res.json(docs))
    .catch((err) => {
      console.error('Error reading daily stocks:', err)
      res.status(500).send(false)
    })
}

export const getById = (req, res) => {
  let id = req.params.id
  DailyStock.findById(id)
    .exec()
    .then((docs) => res.json(docs))
}

export const update = (req, res) => {
  const form = req.body
  // console.log(form)

  // อัปเดตข้อมูล DailyStock ตาม ID
  DailyStock.findByIdAndUpdate(form._id, form, { useFindAndModify: false })
    .then((docs) => {
      console.log('daily stock updated')
      res.json(docs)
    })
    .catch((err) => {
      res.json({ error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล DailyStock' })
    })
}

export const remove = (req, res) => {
  const productId = req.params.id
  // console.log(productId)

  DailyStock.updateOne({}, { $pull: { products: { _id: productId } } })
    .exec()
    .then((result) => {
      if (result.nModified > 0) {
        res.send('ลบข้อมูลสินค้าเรียบร้อย')
      } else {
        res.send('ไม่พบสินค้าที่ต้องการลบ')
      }
    })
    .catch((err) => {
      console.log('เกิดข้อผิดพลาดในการลบข้อมูลสินค้า:', err)
      res.send('เกิดข้อผิดพลาดในการลบข้อมูลสินค้า')
    })
}

export const getHistory = (req, res) => {
  DailyStock.find({ status: 'clear' })
    .sort({ date_added: -1 }) // เรียงข้อมูลตามวันที่เพิ่มข้อมูลล่าสุดก่อน
    .exec()
    .then((docs) => res.json(docs))
    .catch((err) => {
      console.error('Error reading daily stocks:', err)
      res.status(500).send(false)
    })
}
