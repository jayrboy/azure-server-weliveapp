import { validationResult } from 'express-validator'
import Order from '../Models/Order.js'
import Customer from '../Models/Customer.js'
import Product from '../Models/Product.js'
import DailyStock from '../Models/DailyStock.js'

import { sendExpressMessage } from '../services/webhooks.js'

import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'
import { createCanvas } from 'canvas'
import bwipjs from 'bwip-js'

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// สร้าง __filename และ __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Download / Printer PDF ขนาด "A6"
export const downloadPDF = async (req, res) => {
  const id = req.params.id

  try {
    // ค้นหาออเดอร์จากฐานข้อมูล
    const order = await Order.findById(id).exec()
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // สร้างเอกสาร PDF ขนาด A6
    const doc = new PDFDocument({ size: 'A6', margin: 18 })

    // กำหนด headers เพื่อดาวน์โหลดไฟล์ PDF
    res.setHeader('Content-Disposition', `attachment; filename=order-${id}.pdf`)
    res.setHeader('Content-Type', 'application/pdf')

    // ส่ง PDF กลับไปยังฝั่งไคลเอนต์
    doc.pipe(res)

    // กำหนดฟอนต์สำหรับใบเสร็จ
    const fontPath = path.join(__dirname, '../fonts/THSarabunNew.ttf')
    doc.font(fontPath)

    // ส่วนหัว
    doc.fontSize(20).text('ใบเสร็จรับเงิน', { align: 'start' })
    doc.moveDown()

    // สร้างบาร์โค้ด
    bwipjs.toBuffer(
      {
        bcid: 'code128', // Barcode type
        text: order._id.toString(), // ข้อความที่ต้องการแสดงในบาร์โค้ด
        scale: 3, // ปรับขนาด
        height: 10, // ความสูงของบาร์โค้ด
        includetext: true, // รวมข้อความด้านล่างบาร์โค้ด
        textxalign: 'center', // จัดตำแหน่งข้อความให้ตรงกลาง
      },
      (err, png) => {
        if (err) {
          console.error(err)
          return res.status(500).json({ message: 'Error generating barcode' })
        }
        doc.image(png, 95, doc.y - 60, { width: 200, align: 'center' }) // แสดงบาร์โค้ดใน PDF

        // ข้อมูลร้านค้า
        doc.fontSize(12).text('ร้านค้า: WE Live App', { align: 'center' })
        doc.text(order.address, { align: 'center' })
        doc.text(order.email, { align: 'center' })
        doc.text(
          `วันที่: ${new Date(order.createdAt).toLocaleDateString('th-TH')}`,
          { align: 'center' }
        )
        doc.text(`หมายเลขออเดอร์: ${order._id}`, { align: 'center' })

        // สร้าง QR Code
        const qrCodeData = `https://weliveapp.netlify.app/order/${id}`
        QRCode.toDataURL(qrCodeData)
          .then((qrCodeImage) => {
            doc.image(qrCodeImage, 100, doc.y + 180, { width: 100 }) // แสดง QR Code ใน PDF
            doc.moveDown()

            // รายละเอียดลูกค้า
            doc.text('ผู้รับสินค้า:', { underline: true })
            doc.text(`ชื่อ: ${order.name}`)
            doc.text(`ที่อยู่: ${order.address}`)
            doc.moveDown()

            // รายการสินค้า
            doc.text('รายการสินค้า:', { underline: true })
            order.orders.forEach((product) => {
              doc.text(
                `${product.name} - จำนวน: ${
                  product.quantity
                } ราคา: ${product.price
                  .toFixed(2)
                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')} บาท`
              )
            })

            // สรุปยอดรวม
            doc.text(
              '-------------------------------------------------------------------------------------------------'
            )
            let grandTotal = order.orders.reduce(
              (sum, product) => sum + product.price * product.quantity,
              0
            )
            grandTotal += 50 // ค่าขนส่ง
            doc.text('ค่าขนส่ง 50.00', { align: 'right' })
            doc.text(
              `ยอดรวม: ${grandTotal
                .toFixed(2)
                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}`,
              { align: 'right' }
            )
            doc.text('ขอบคุณที่ใช้บริการ!', { align: 'right' })

            doc.end() // สิ้นสุดการสร้าง PDF
          })
          .catch((err) => {
            console.error(err)
            res.status(500).json({ message: 'Error generating QR Code' })
          })
      }
    )
  } catch (err) {
    console.error(err) // Log error to console
    res.status(500).json({ message: err.message })
  }
}
export const printPDF = async (req, res) => {
  const id = req.params.id

  try {
    // ค้นหาออเดอร์จากฐานข้อมูล
    const order = await Order.findById(id).exec()
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // สร้างเอกสาร PDF ขนาด A6
    const doc = new PDFDocument({ size: 'A6', margin: 18 })

    // กำหนด headers เพื่อเปิด PDF ในเบราว์เซอร์ (แทนที่จะดาวน์โหลด)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline') // เปลี่ยนจาก 'attachment' เป็น 'inline'

    // ส่ง PDF กลับไปยังฝั่งไคลเอนต์
    doc.pipe(res)

    // กำหนดฟอนต์สำหรับใบเสร็จ
    const fontPath = path.join(__dirname, '../fonts/THSarabunNew.ttf')
    doc.font(fontPath)

    // ส่วนหัว
    doc.fontSize(20).text('ใบเสร็จรับเงิน', { align: 'start' })
    doc.moveDown()

    // สร้างบาร์โค้ดด้วย bwip-js
    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: 'code128', // Barcode type
      text: order._id.toString(), // ข้อความที่ต้องการแสดงในบาร์โค้ด
      scale: 3, // ปรับขนาด
      height: 10, // ความสูงของบาร์โค้ด
      includetext: true, // รวมข้อความด้านล่างบาร์โค้ด
      textxalign: 'center', // จัดตำแหน่งข้อความให้ตรงกลาง
    })

    doc.image(barcodeBuffer, 95, doc.y - 60, { width: 200, align: 'center' }) // แสดงบาร์โค้ดใน PDF

    // ข้อมูลร้านค้า
    doc.fontSize(12).text('ร้านค้า: WE Live App', { align: 'center' })
    doc.text(order.address, { align: 'center' })
    doc.text(order.email, { align: 'center' })
    doc.text(
      'วันที่: ' + new Date(order.createdAt).toLocaleDateString('th-TH'),
      { align: 'center' }
    )
    doc.text(`หมายเลขออเดอร์: ${order._id}`, { align: 'center' })

    // สร้าง QR Code
    const qrCodeData = `https://weliveapp.netlify.app/order/${id}`
    const qrCodeImage = await QRCode.toDataURL(qrCodeData) // สร้าง QR Code เป็น Data URL
    doc.image(qrCodeImage, 100, doc.y + 180, { width: 100 }) // แสดง QR Code ใน PDF
    doc.moveDown()

    // รายละเอียดลูกค้า
    doc.text('ผู้รับสินค้า:', { underline: true })
    doc.text(`ชื่อ: ${order.name}`)
    doc.text(`ที่อยู่: ${order.address}`)
    doc.moveDown()

    // รายการสินค้า
    doc.text('รายการสินค้า:', { underline: true })
    order.orders.forEach((product) => {
      doc.text(
        `${product.name} - จำนวน: ${product.quantity} ราคา: ${product.price
          .toFixed(2)
          .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')} บาท`
      )
    })

    // สรุปยอดรวม
    doc.text(
      '-------------------------------------------------------------------------------------------------'
    )
    let grandTotal = order.orders.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0
    )
    grandTotal += 50 // ค่าขนส่ง
    doc.text('ค่าขนส่ง ฿ 50.00', { align: 'right' })
    doc.text(
      `ยอดรวม: ฿ ${grandTotal
        .toFixed(2)
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}`,
      { align: 'right' }
    )
    doc.text('ขอบคุณที่ใช้บริการ!', { align: 'right' })

    doc.end() // สิ้นสุดการสร้าง PDF
  } catch (err) {
    console.error(err) // Log error to console
    res.status(500).json({ message: err.message })
  }
}

//TODO: สร้างออเดอร์อัตโนมัติจาก GetComment.jsx ส่งข้อมูลมาให้
export const create = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    let form = req.body
    // console.log(form)

    let existingCustomer = await Customer.findOne({ idFb: form.idFb }).exec()

    if (!existingCustomer) {
      let customer = {
        idFb: form.idFb || '',
        nameFb: form.nameFb || '',
        name: form.name || '',
        email: form.email || '',
        picture_profile: form.picture_profile || '',
      }
      Customer.create(customer)
    }

    // console.log('Customer Existed :', existingCustomer) // null

    let data = {
      idFb: form.idFb || '',
      nameFb: form.nameFb || '',
      name: form.name || '',
      orders: form.orders || [],
      vendorId: form.vendorId || '668a6523db79f886466bce46', // ID ผู้ขายสินค้ารายการนั้นๆ
      email: '',
      picture_profile: [],
      picture_payment: '',
      address: '',
      province: '',
      amphure: '',
      district: '',
      postcode: '',
      tel: '',
      express: '',
      isPayment: false,
      complete: false,
      sended: false,
      isDelete: false,
      updateBy: '',
      date_added: new Date(),
    }

    // console.log('Save Data :', data)

    let existingOrder = await Order.findOne({ idFb: form.idFb }).exec()

    // console.log('Order Existed :', existingOrder) // null

    if (!existingOrder) {
      Order.create(data).then((doc) => res.status(200).json(doc))
    } else {
      Order.findOneAndUpdate(
        { idFb: form.idFb },
        { $push: { orders: data.orders[0] } },
        { useFindAndModify: false }
      ).then(() => {
        Order.findById(existingOrder._id).then((doc) =>
          res.status(200).json(doc)
        )
      })
    }
  } catch (error) {
    // console.error('Error processing request :', error)
    res.status(500).json({ message: '500 Internal Server Error' })
  }
}

export const getAll = (req, res) => {
  // Order.find({ complete: false }) // กรองข้อมูลเฉพาะที่ complete เป็น false
  Order.find({}) // กรองข้อมูลเฉพาะที่ complete เป็น false
    .sort({ date_added: 1 }) // -1 เรียงข้อมูลตามวันที่เพิ่มข้อมูลล่าสุดก่อน, 1 เรียงข้อมูลจากวันที่เก่าสุดไปล่าสุด
    .exec()
    .then((docs) => {
      res.json(docs)
    })
    .catch((err) => {
      console.error('Error reading sale orders:', err)
      res.status(500).send(false)
    })
}

export const getById = (req, res) => {
  let id = req.params.id
  Order.findById(id)
    .exec()
    .then((docs) => res.json(docs))
}

// Update Order V1 "multiple/form-data"
export const update = async (req, res) => {
  // console.log(req.body)
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

//! ลบข้อมูลถาวร
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

//! ปฏิเสธออเดอร์ { isDelete: true } : ปฏิเสธ/หมดเวลา
export const reject = (req, res) => {
  let form = req.body
  let data = {
    isDelete: true,
    updateBy: form.updateBy,
  }

  Order.findByIdAndUpdate(form._id, data, { useFindAndModify: false })
    .exec()
    .then(() => {
      Order.findById(form._id)
        .exec()
        .then((docs) => res.status(200).json(docs))
    })
    .catch((err) => res.status(500).send(false))
}

// อัปเดตข้อมูลออเดอร์ลูกค้าที่สั่งซื้อ Order V2 "application/json" { isPayment: true }
export const payment = (req, res) => {
  let form = req.body
  let data = {
    name: form.name || '',
    address: form.address || '',
    province: form.province || '',
    amphure: form.amphure || '',
    district: form.district || '',
    postcode: form.postcode || '',
    tel: form.tel || '',
    picture_payment: form.picture_payment || '',
    isPayment: form.isPayment || true,
  }

  // บันทึกเป็นไฟล์
  // const base64Data = picture_payment.replace(/^data:image\/\w+;base64,/, '')
  // const buffer = Buffer.from(base64Data, 'base64')
  // fs.writeFile(`./uploads/payment_${_id}.png`, buffer, (err) => {
  //   if (err) {
  //     return res.status(500).send('Error saving image')
  //   }
  // })

  Order.findByIdAndUpdate(form._id, data, { useFindAndModify: false })
    .exec()
    .then(() => {
      Order.findById(form._id)
        .exec()
        .then((docs) => res.status(200).json(docs))
    })
    .catch((err) => res.status(404).json({ message: err.message }))
}

//TODO: ยืนยันการชำระเงิน { complete: true } --------> " ตัดสต็อก "
export const setOrderComplete = (req, res) => {
  console.log('Endpoint for changing a status completed')
  const { id } = req.params
  let productsInOrder = req.body.orders
  let data = {
    complete: true,
    updateBy: req.body.updateBy,
  }

  // อัปเดตสถานะออเดอร์เป็น complete
  Order.findByIdAndUpdate(id, data, { useFindAndModify: false })
    .exec()
    .then(() => {
      console.log('REQ Body Come : ', productsInOrder)

      // ใช้ Promise.all เพื่อรอให้คำสั่ง async ทุกคำสั่งเสร็จสมบูรณ์
      productsInOrder.map((productInOrder) =>
        Product.findById(productInOrder.id)
          .exec()
          .then((p) => {
            if (!p) new Error(`Product with id ${productInOrder.id} not found`)

            // ตัดสต็อกสินค้า และเพิ่ม paid ตามจำนวนสินค้าในออเดอร์
            const quantityOrdered = productInOrder.quantity // ใช้ quantity ของสินค้าในออเดอร์
            p.paid += quantityOrdered
            p.cf += quantityOrdered
            p.remaining_cf -= quantityOrdered
            p.remaining -= quantityOrdered

            // บันทึกการเปลี่ยนแปลง
            p.save()
          })
      )
    })
    .then(() => {
      // อัปเดตสต็อกใน DailyStock
      return Promise.all(
        productsInOrder.map((productInOrder) =>
          DailyStock.findOneAndUpdate(
            { 'products._id': productInOrder.id, status: 'new' },
            {
              $inc: {
                'products.$.paid': productInOrder.quantity,
                'products.$.remaining': -productInOrder.quantity,
              },
            },
            { new: true }
          )
            .exec()
            .then((doc) => {
              if (!doc)
                throw new Error(
                  `Daily stock with product id ${productInOrder.id} not found`
                )
            })
        )
      )
    })
    .then((doc) => {
      res.status(200).json({
        message: 'Order completed and stock updated successfully',
        doc,
      })
    })
    .catch((error) => res.status(500).json({ message: error }))
}

//TODO: ยืนยัน การส่งสินค้า { sended: true } : "ส่งสินค้าแล้ว"
export const setOrderSended = async (req, res) => {
  try {
    console.log('Endpoint for changing status Sended :', req.params.id)
    const { id } = req.params

    let order = await Order.findById(id)
      .exec()
      .catch((err) => res.status(404).json({ message: 'Order not fount' }))

    // Toggle the sended status
    order.sended = !order.sended

    if (order.sended === false) {
      order.express = ''
    } else {
      // Update express if provided
      if (req.body.express) {
        order.express = req.body.express

        // ส่งแชทบอท Messenger ให้ลูกค้าหลัง จากการเปลี่ยนสถานะ { "sended": true }
        sendExpressMessage(order.psidFb, order._id)
          .then((res) => {
            console.log('Message sent successfully :', res.data.recipient_id)
          })
          .catch((err) => {
            console.error('Error sending message:', err)
          })
      }
    }

    // Save the updated order
    await order.save()

    Order.findById(id)
      .exec()
      .then((doc) => res.status(200).json(doc))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// แสดงรายงานกราฟแต่ละรายการสินค้า * สินค้าที่ตัดสต็อกเรียบร้อย * สินค้าในออเดอร์ที่ยืนยันการชำระเงินเรียบร้อยแล้ว *
export const getOrderForReport = async (req, res) => {
  console.log('Endpoint for create report')
  const { id, date, month, year } = req.params // Receive id, date, month, and year from request parameters

  try {
    // ค้นหาเอกสารที่เกี่ยวข้องกับ order
    const docs = await Order.find({
      complete: { $in: true },
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

    // คำนวณวันที่ย้อนหลัง 30 วัน
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const Localdate = new Date(`${year}-${month}-${date}`)
      Localdate.setDate(Localdate.getDate() - i)
      return Localdate
    })

    // ค้นหาข้อมูลสินค้า
    const product = await Product.findById(id).exec()
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    let cost = product.cost
    productName = product.name

    // ประมวลผลข้อมูล orders
    docs.forEach((doc) => {
      doc.orders.forEach((order) => {
        if (order.id === id) {
          const orderDate = new Date(doc.date_added)

          const orderYear = orderDate.getFullYear()
          const orderMonth = orderDate.getMonth() + 1 // Months are 0-indexed
          const orderDay = orderDate.getDate()

          totalQuantity += order.quantity
          totalPrice += order.quantity * order.price

          // คำนวณยอดขายย้อนหลัง 30 วัน
          last30Days.forEach((date, index) => {
            if (
              orderDate.getFullYear() === date.getFullYear() &&
              orderDate.getMonth() === date.getMonth() &&
              orderDate.getDate() === date.getDate()
            ) {
              dailySalesData[index] += order.quantity * order.price
            }
          })

          // คำนวณยอดขายรายวัน รายเดือน และรายปี
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

    // คำนวณกำไร
    let profit = totalPrice - cost * totalQuantity

    // ส่งข้อมูลกลับไปยัง client
    res.status(200).json({
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
        .reverse(), // ส่งข้อมูลวันที่กลับไป
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const ccOrder = (req, res) => {
  // console.log(req.body)
  let form = req.body
  let data = {
    isPayment: false,
    isDelete: true,
  }

  Order.findOneAndUpdate({ idFb: form.idFb }, data, { useFindAndModify: false })
    .exec()
    .then(() => {
      Order.findOne({ idFb: form.idFb })
        .exec()
        .then((docs) => res.status(200).json(docs))
    })
    .catch((error) => res.status(500).json({ message: error }))
}

export const ccOrderV2 = (req, res) => {
  // console.log(req.body)
  let form = req.body

  Order.findOneAndDelete({ idFb: form.idFb })
    .exec()
    .then(() => {
      Customer.findOneAndDelete({ idFb: form.idFb })
        .exec()
        .then(() => res.status(200).send(true))
    })
    .catch((error) => res.status(500).json({ message: error }))
}
