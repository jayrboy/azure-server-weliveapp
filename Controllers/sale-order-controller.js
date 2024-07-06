import { validationResult } from 'express-validator'
import Order from '../Models/Order.js'
import Customer from '../Models/Customer.js'
import Product from '../Models/Product.js'

export const create = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    let existingCustomer = await Customer.findOne({ idFb: req.body.idFb })
    if (!existingCustomer) {
      let customer = {
        idFb: req.body.idFb || '',
        name: req.body.name || '',
        email: req.body.email || '',
        picture_profile: req.body.picture_profile || '',
      }
      await Customer.create(customer)
    }

    let form = req.body
    let data = {
      idFb: form.idFb || '',
      name: form.name || '',
      email: form.email || '',
      picture_profile: form.picture_profile || [],
      orders: form.orders || [],
      picture_payment: form.picture_payment || '',
      address: form.address || '',
      sub_district: form.sub_district || '',
      sub_area: form.sub_area || '',
      district: form.district || '',
      postcode: form.postcode || 0,
      tel: form.tel || 0,
      complete: form.complete || false,
      sended: form.sended || false,
      express: form.express || '',
      date_added: form.date_added
        ? new Date(Date.parse(form.date_added))
        : new Date(),
    }

    let existingOrder = await Order.findOne({ idFb: data.idFb })

    if (existingOrder) {
      await Order.findOneAndUpdate(
        { idFb: existingOrder.idFb },
        { $push: { orders: existingOrder.orders[0] } },
        { useFindAndModify: false }
      )

      existingOrder = await Order.findById(existingOrder._id)

      res.status(200).send(existingOrder)
    } else {
      const newOrder = await Order.create(data)

      res.status(200).send(newOrder)
    }
  } catch (error) {
    console.error('Error processing request: ', error)
    res
      .status(500)
      .send({ message: 'Internal Server Error', error: error.message })
  }
}

export const getAll = (req, res) => {
  // Order.find({ complete: false }) // กรองข้อมูลเฉพาะที่ complete เป็น false
  Order.find({}) // กรองข้อมูลเฉพาะที่ complete เป็น false
    .sort({ date_added: -1 }) // เรียงข้อมูลตามวันที่เพิ่มข้อมูลล่าสุดก่อน
    .exec()
    .then((docs) => {
      res.json(docs)
    })
    .catch((err) => {
      console.error('Error reading sale orders:', err)
      res.status(500).send(false)
    })
}

export const setOrderComplete = (req, res) => {
  console.log('data for changing status complete')
  const { id } = req.params

  Order.findById(id)
    .exec()
    .then((order) => {
      if (!order) {
        return res.status(404).json({ error: 'Order not found' })
      }

      // Toggle the complete status
      order.complete = !order.complete
      if (order.complete == false) {
        order.sended = false
      }

      console.log('REQ Body Come : ', req.body.orders)
      // Update the product stock quantity
      const updateProductStock = async () => {
        for (let item of req.body.orders) {
          const product = await Product.findById(item.order_id).exec()
          console.log('Get Product By Id REQ Body', product)
          if (product) {
            product.stock_quantity += order.complete
              ? -item.quantity
              : item.quantity
            await product.save()
          }
        }
      }

      // Save the updated order and update product stock
      order
        .save()
        .then(async (updatedOrder) => {
          await updateProductStock()
          res.json(updatedOrder)
        })
        .catch((error) => res.status(500).json({ error: error.message }))
    })
    .catch((error) => res.status(500).json({ error: error.message }))
}

export const setOrderSended = (req, res) => {
  // console.log('data for changing status Sended', req);
  const { id } = req.params

  Order.findById(id)
    .exec()
    .then((order) => {
      if (!order) {
        return res.status(404).json({ error: 'Order not found' })
      }

      // Toggle the sended status
      order.sended = !order.sended
      if (order.sended == false) {
        order.express = 'ไม่ได้ระบุรหัสขนส่ง'
      } else {
        // Update express if provided
        if (req.body.express) {
          order.express = req.body.express
        }
      }

      // Save the updated order
      order
        .save()
        .then((updatedOrder) => res.json(updatedOrder))
        .catch((error) => res.status(500).json({ error: error.message }))
    })
    .catch((error) => res.status(500).json({ error: error.message }))
}

export const getOrderForReport = async (req, res) => {
  console.log('data for create report')
  const { id, date, month, year } = req.params // Receive id, date, month, and year from request parameters

  try {
    const docs = await Order.find({
      'orders._id': id,
      complete: true,
    }).exec()

    if (docs.length === 0) {
      return res.status(404).json({ error: 'No orders found' })
    }

    let dailySales = 0
    let monthlySales = 0
    let yearlySales = 0
    let totalQuantity = 0
    let totalPrice = 0
    let productName = ''
    const dailySalesData = Array(30).fill(0) // Array to hold sales data for the past 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      console.log(year + '-' + month + '-' + date)
      const Localdate = new Date(year + '-' + month + '-' + date)
      Localdate.setDate(Localdate.getDate() - i)
      return Localdate
    })
    let cost = 0

    await Product.findById(id)
      .exec()
      .then((docs) => {
        if (!docs) {
          return res.status(404).json({ error: 'Product not found' })
        }
        cost = docs.cost

        productName = docs.name
      })
      .catch((error) => res.status(500).json({ error: error.message }))

    docs.forEach((doc) => {
      doc.orders.forEach((order) => {
        if (order._id === id) {
          productName = order.name
          const orderDate = new Date(doc.date_added)
          const orderYear = orderDate.getFullYear()
          const orderMonth = orderDate.getMonth() + 1 // Months are 0-indexed
          const orderDay = orderDate.getDate()

          totalQuantity += order.quantity
          totalPrice += order.quantity * order.price

          // Calculate sales for the past 30 days
          last30Days.forEach((date, index) => {
            if (
              orderDate.getFullYear() === date.getFullYear() &&
              orderDate.getMonth() === date.getMonth() &&
              orderDate.getDate() === date.getDate()
            ) {
              dailySalesData[index] += order.quantity * order.price
            }
          })

          if (orderYear === parseInt(year)) {
            yearlySales += order.quantity * order.price
            if (orderMonth === parseInt(month)) {
              monthlySales += order.quantity * order.price
              if (orderDay === parseInt(date)) {
                dailySales += order.quantity * order.price
              }
            }
          }
        }
      })
    })
    let profit = totalPrice - cost * totalQuantity

    res.json({
      profit,
      productName,
      totalQuantity,
      totalPrice,
      dailySales,
      monthlySales,
      yearlySales,
      dailySalesData: dailySalesData.reverse(), // Reverse the data to start from the oldest date
      last30Days: last30Days
        .map((date) => date.toISOString().split('T')[0])
        .reverse(), // Send the dates as well
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getById = (req, res) => {
  let id = req.params.id
  Order.findById(id)
    .exec()
    .then((docs) => res.json(docs))
}

export const update = async (req, res) => {
  console.log(req.body)
  try {
    let form = req.body

    if (req.file) {
      form.picture_payment = req.file.filename
    }

    // console.log(form) // ตรวจสอบข้อมูลที่ได้รับจาก form-data

    // อัปเดตข้อมูล products ภายใน Order
    let updatedOrder = await Order.findByIdAndUpdate(form._id, form, {
      useFindAndModify: false,
    })

    console.log('Document updated sale order')
    res.json(updatedOrder)
  } catch (err) {
    console.error('Error updating order: ', err)
    res.status(400).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล Order' })
  }
}

export const remove = (req, res) => {
  let _id = req.body._id

  Order.findOneAndDelete(_id, { useFindAndModify: false })
    .exec()
    .then(() => {
      Order.find()
        .exec()
        .then((docs) => res.json(docs))
    })
    .catch((err) => res.json({ message: err.message }))
}

export const paid = async (req, res) => {
  try {
    let form = req.body
    // console.log(form) // ตรวจสอบข้อมูลที่ได้รับจาก form-data

    // อัปเดตข้อมูล products ภายใน Order
    Order.findByIdAndUpdate(
      form._id,
      { complete: form.complete },
      {
        useFindAndModify: false,
      }
    )
      .exec()
      .then(() => {
        //หลังการอัปเดต ก็อ่านข้อมูลอีกครั้ง แล้วส่งไปแสดงผลที่ฝั่งโลคอลแทนข้อมูลเดิม
        Order.findById(form._id)
          .exec()
          .then((docs) => {
            console.log(`Order: ${docs.name} has been completed.`)
            res.json(docs)
          })
      })
  } catch (err) {
    console.error('Error updating order: ', err.message)
    res.status(400).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล Order' })
  }
}
