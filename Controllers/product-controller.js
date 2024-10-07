import Product from '../Models/Product.js'
import ExcelJS from 'exceljs'
import fs from 'fs'
import ProductHistory from '../Models/ProductHistory.js'

export const getAll = (req, res) => {
  Product.find({ isDelete: false })
    .exec()
    .then((docs) => res.status(200).json(docs))
}

export const getById = (req, res) => {
  let id = req.params.id

  Product.findById(id)
    .exec()
    .then((doc) => res.json(doc))
    .catch((err) => res.status(404).send('Product not found'))
}

export const create = (req, res) => {
  let form = req.body
  let data = {
    code: form.code || '',
    name: form.name || '',
    price: form.price || 0,
    stock_quantity: form.stock_quantity || 0,
    cost: form.cost || 0,
    limit: form.limit || 0,
    cf: form.cf || 0,
    paid: form.paid || 0,
    remaining_cf: form.stock_quantity || 0,
    remaining: form.stock_quantity || 0,
    isDelete: false,
    date_added: new Date(Date.parse(form.date_added)) || new Date(),
  }
  // console.log(data)

  Product.create(data)
    .then((docs) => {
      console.log('Document saved')
      res.status(201).send(true)
    })
    .catch((err) => {
      console.log(err.message)
      res.status(400).send(false)
    })
}

export const update = (req, res) => {
  console.log(req.body)
  let form = req.body

  // คำนวณยอดคงเหลือใหม่
  let newRemaining = form.stock_quantity // สามารถปรับคำนวณตามต้องการ เช่น หักค่าที่จ่ายไปแล้ว
  let newRemainingCf = newRemaining - form.paid // คำนวณยอดคงเหลือที่จ่ายแล้ว

  let data = {
    code: form.code,
    name: form.name,
    price: form.price,
    stock_quantity: form.stock_quantity,
    cost: form.cost,
    limit: form.limit,
    remaining: newRemaining,
    remaining_cf: newRemainingCf,
    date_added: form.date_added,
  }

  // console.log(data)

  let dataHistory = {
    product_id: form._id,
    product_name: form.name,
    updateBy: form.updateBy,
    price_old: form.price_old,
    price_new: form.price,
    stock_quantity_old: form.stock_quantity_old,
    stock_quantity_new: form.stock_quantity,
    remarks: form.remarks || '',
  }

  Product.findByIdAndUpdate(form._id, data, { useFindAndModify: false })
    .exec()
    .then(() => {
      //หลังการอัปเดต ก็อ่านข้อมูลอีกครั้ง แล้วส่งไปแสดงผลที่ฝั่งโลคอลแทนข้อมูลเดิม
      console.log('Document updated')
      Product.find()
        .exec()
        .then((docs) => {
          ProductHistory.create(dataHistory).then(() => {
            console.log('History created')
            res.json(docs)
          })
        })
    })
    .catch((err) => res.json({ message: err.message }))
}

export const remove = (req, res) => {
  let form = req.body
  // console.log(form)
  let data = {
    isDelete: true,
  }

  Product.findByIdAndUpdate(form._id, data, { useFindAndModify: false })
    .exec()
    .then(() => {
      // เมื่อลบข้อมูลสำเร็จ ทำการค้นหาข้อมูลสินค้าทั้งหมดใหม่
      Product.find({ isDelete: false })
        .exec()
        .then((docs) => res.json(docs))
    })
    .catch((err) => res.status(500).json({ message: err }))
}

export const search = async (req, res) => {
  try {
    let q = req.query.q || ''

    // กำหนด pattern ด้วย RegExp
    let pattern = new RegExp(q, 'ig')

    // ค้นหาจากฟิลด์ name และ remaining
    // let conditions = {
    //   $or: [{ name: { $regex: pattern } }, { code: { $regex: pattern } }],
    // }

    let conditions = {
      $and: [
        { isDelete: false },
        { $or: [{ name: { $regex: pattern } }, { code: { $regex: pattern } }] },
      ],
    }

    let options = {
      page: req.query.page || 1, // เพจปัจจุบัน
      limit: 5, // แสดงผลหน้าละ 5 รายการ
    }

    const result = await Product.paginate(conditions, options)
    res.send(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const exportExcel = async (req, res) => {
  try {
    const products = await Product.find({}).lean() // ใช้ lean() เพื่อให้ได้ Object ธรรมดา

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Products')

    // เพิ่ม header
    worksheet.columns = [
      { header: 'ID', key: '_id', width: 30 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Price', key: 'price', width: 30 },
      { header: 'Quantity', key: 'stock_quantiy', width: 30 },
    ]

    // เพิ่มข้อมูลลงใน worksheet
    products.forEach((p) => {
      worksheet.addRow(p)
    })

    // ส่งไฟล์ Excel กลับไปยังผู้ใช้
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx')
    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    res.status(500).send({ error: 'Error fetching products' })
  }
}

export const importExcel = (req, res) => {
  // console.log(req.body)
  let jsonData = req.body

  // แปลง date_added ให้เป็น Date object
  jsonData = jsonData.map((item) => ({
    ...item,
    date_added: new Date(item.date_added) || new Date(),
    limit: 0,
    cf: 0,
    paid: 0,
    remaining: item.stock_quantity,
    remaining_cf: item.stock_quantity,
    isDelete: false,
  }))

  // บันทึกข้อมูลผู้ใช้ลง MongoDB
  Product.insertMany(jsonData)
    .then((docs) => {
      console.log('docs inserted')
      res.status(200).json(docs)
    })
    .catch((err) => {
      console.error('Error inserting data:', err)
      res.status(500).send(false)
    })
}

export const getProductsHistory = (req, res) => {
  // res.send('Product History')
  ProductHistory.find({})
    .exec()
    .then((docs) => res.status(200).json(docs))
    .catch((error) => res.status(500).json({ message: error.message }))
}
