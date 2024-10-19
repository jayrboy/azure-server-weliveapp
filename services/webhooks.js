import 'dotenv/config'
import express from 'express'
import axios from 'axios'
import Order from '../Models/Order.js'
import Customer from '../Models/Customer.js'

const router = express.Router()

// Define a message verify token (custom)
const WEBHOOKS_VERIFY_TOKEN = process.env.WEBHOOKS_VERIFY_TOKEN || 'message001'
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN
let received_updates = []

router.get('/', (req, res) => {
  res
    .status(200)
    .send('<pre>' + JSON.stringify(received_updates, null, 2) + '</pre>')
})

//! Meta เปิด Mode: Live Preview สำหรับ Test

// GET: /api/webhooks/chatbot
router.get('/chatbot', (req, res) => {
  let mode = req.query['hub.mode']
  let verifyToken = req.query['hub.verify_token']
  let challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && verifyToken === WEBHOOKS_VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED')
    res.status(200).send(challenge)
  } else {
    // Return with '403 Forbidden' if verify tokens do not match
    console.log('403 Forbidden')
    res.sendStatus(403)
  }
})

// POST: /api/webhooks/chatbot
router.post('/chatbot', (req, res) => {
  let form = req.body

  if (form.object === 'page') {
    form.entry.forEach((entry) => {
      // Get the body of the webhook event
      let webhook_event = entry.messaging[0]
      received_updates.unshift(webhook_event)

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id
      console.log('PSID: ', sender_psid)

      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message)
      } else if (webhook_event.postback) {
        handlePostBack(sender_psid, webhook_event.postback)
      }
    })
    res.status(200).send('EVENT_RECEIVED')
  } else {
    res.sendStatus(404) // if event is not from a "page" subscription
  }
})

// POST: /api/webhooks/chatbot
router.post('/chatbot/live', (req, res) => {
  let { psidFb, orderID } = req.body

  sendMessageInFacebookLive(psidFb, orderID)
    .then(() => res.status(200).send('Sent Success'))
    .catch((error) => res.status(500).send('Chatbot Error :'))
})

//TODO: Handle Message Events
async function handleMessage(sender_psid, received_message) {
  let response

  try {
    // ดึงชื่อผู้ใช้จาก PSID
    const userProfile = await getUserProfileName(sender_psid)

    let userData = {
      psidFb: userProfile.id || '',
      picture_profile: userProfile.picture || [],
    }

    // ค้นหาลูกค้าที่มีอยู่แล้ว
    let existingCustomer = await Customer.findOne({
      nameFb: userProfile.name,
    }).exec()

    if (!existingCustomer) {
      let customer = {
        idFb: '', // คุณอาจจะต้องการเพิ่มการจัดการ ID ของลูกค้า
        nameFb: userProfile.name || '',
        name: '',
        email: '',
        picture_profile: userProfile.picture || '',
        psidFb: userProfile.id || '',
      }
      Customer.create(customer) // สร้างลูกค้าใหม่
    } else {
      existingCustomer = await Customer.findByIdAndUpdate(
        existingCustomer._id,
        userData,
        { useFindAndModify: false }
      )
    }

    // ค้นหาออเดอร์ของผู้ใช้ใน MongoDB
    const order = await Order.findOneAndUpdate(
      { nameFb: userProfile.name, isPayment: false }, // ค้นหาเอกสารที่มี nameFb ตรงตามที่กำหนด
      userData, // อัปเดตข้อมูลที่ต้องการ
      { sort: { createdAt: -1 }, new: true } // เรียงลำดับตาม createdAt และคืนค่าเอกสารใหม่
    )
      .select('-picture_payment')
      .exec()

    // กรณีที่ผู้ใช้ส่งข้อความปกติ
    if (received_message.text) {
      if (order) {
        response = {
          text: `สวัสดีคุณ ${userProfile.name} คุณมีคำสั่งซื้อ. หากต้องการรายละเอียดเพิ่มเติมกรุณาเข้าลิงก์: https://weliveapp.netlify.app/order/${order._id}`,
        }
      } else {
        response = {
          text: `ไม่พบคำสั่งซื้อสำหรับคุณ ${userProfile.name} รอติดตามการถ่ายทอดสดขายสินค้าและสั่งสินค้าอีกครั้ง`,
        }
      }
    }
    // กรณีที่ผู้ใช้ส่งรูปภาพ
    else if (received_message.attachments) {
      // Get the URL of the message attachment
      let attachment_url = received_message.attachments[0].payload.url

      if (order) {
        // Respond with a generic template showing the order URL and asking for confirmation
        response = {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'generic',
              elements: [
                {
                  title: `คุณ ${userProfile.name} มีคำสั่งซื้อ`,
                  subtitle: `คลิกลิงก์เพื่อตรวจสอบคำสั่งซื้อเพิ่มเติม`,
                  image_url: attachment_url, // รูปภาพที่ผู้ใช้ส่งมา
                  buttons: [
                    {
                      type: 'web_url',
                      url: `https://weliveapp.netlify.app/order/${order._id}`,
                      title: 'ยืนยันออเดอร์',
                    },
                    {
                      type: 'postback',
                      title: 'ใช่! นี่คือสินค้าที่ต้องการ',
                      payload: 'yes',
                    },
                    {
                      type: 'postback',
                      title: 'ไม่! สินค้านี้ไม่ถูกต้อง',
                      payload: 'no',
                    },
                  ],
                },
              ],
            },
          },
        }
      } else {
        response = {
          text: `ไม่พบคำสั่งซื้อในระบบสำหรับชื่อ "${userProfile.name}".`,
        }
      }
    }
  } catch (error) {
    console.error('Error handling message:', error) // เพิ่มการ log ข้อผิดพลาด
    response = {
      text: 'ขออภัย เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อของคุณ กรุณาลองใหม่อีกครั้ง',
    }
  }

  // ส่งข้อความ response กลับไปยังผู้ใช้
  await callSendAPI(sender_psid, response) // ใช้ await เพื่อรอการส่ง API สำเร็จ
}

// Handle "messaging_postback" Events
function handlePostBack(sender_psid, received_postback) {
  let response

  // Get the payload for the postback
  let payload = received_postback.payload

  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = {
      text: 'คำสั่งซื้อของคุณได้รับการยืนยันแล้ว เราจะดำเนินการโดยเร็วที่สุด',
    }
  } else if (payload === 'no') {
    response = {
      text: 'คำสั่งซื้อของคุณถูกยกเลิกแล้ว แจ้งให้เราทราบหากคุณต้องการความช่วยเหลือใด ๆ',
    }
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response)
}

// ส่งข้อความไปยัง Messenger API
async function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    recipient: {
      id: sender_psid,
    },
    message: response,
  }

  // Send the HTTP request to the Messenger Platform
  try {
    await axios.post(
      'https://graph.facebook.com/v19.0/me/messages',
      request_body,
      {
        params: {
          access_token: PAGE_ACCESS_TOKEN,
        },
      }
    )
    console.log('Message sent!')
  } catch (error) {
    console.log('Unable to send message')
  }
}

// ดึงข้อมูลผู้ใช้จาก Graph API
async function getUserProfileName(psid) {
  try {
    let response = await axios.get(
      `https://graph.facebook.com/${psid}?fields=id,name,picture&access_token=${PAGE_ACCESS_TOKEN}`
    )
    return response.data
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw new Error('Unable to fetch user profile')
  }
}

export const sendExpressMessage = async (psid, orderID) => {
  let response = {
    recipient: { id: psid },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [
            {
              title: 'สินค้าได้ถูกจัดส่งแล้ว',
              subtitle: `คลิกลิงก์เพื่อตรวจสอบและติดตามเลขพัสดุ`,
              image_url:
                'https://weliveapp.netlify.app/assets/logo-lw_6-qUb.png',
              buttons: [
                {
                  type: 'web_url',
                  url: `https://weliveapp.netlify.app/order/${orderID}`,
                  title: 'ดูรายละเอียดคำสั่งซื้อ',
                },
              ],
            },
          ],
        },
      },
    },
  }

  return axios.post(
    `https://graph.facebook.com/v21.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    response
  )
  // return res.data.recipient_id
}

export const sendMessageInFacebookLive = async (psid, orderID) => {
  try {
    // ค้นหาออเดอร์จากฐานข้อมูลโดยใช้ orderID
    const order = await Order.findById(orderID)
      .select('-picture_payment')
      .exec()

    if (!order) {
      throw new Error('Order not found')
    }

    const { orders, name, tel, address } = order

    if (orders.length === 0) {
      throw new Error('No orders found')
    }

    // สมมติค่าจัดส่ง
    const shippingCost = 50

    // คำนวณยอดรวมราคาสินค้าทั้งหมด
    const totalPrice = orders.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )

    // คำนวณตำแหน่งของรายการสินค้าล่าสุด
    const lastIndex = orders.length - 1
    const lastItem = orders[lastIndex]

    // ใช้ toLocaleString() เพื่อจัดรูปแบบตัวเลขให้มี comma
    const formattedPrice = (lastItem.price * lastItem.quantity).toLocaleString()
    const formattedShippingCost = shippingCost.toLocaleString()
    const formattedTotalPrice = (totalPrice + shippingCost).toLocaleString()

    // เตรียม subtitle สำหรับรายการสินค้าล่าสุด
    const subtitle = `[${lastItem.name} x${lastItem.quantity}] = ${formattedPrice} บาท\nค่าจัดส่ง: ${formattedShippingCost} บาท\nยอดรวม: ${formattedTotalPrice} บาท`

    // สร้าง response สำหรับรายการสินค้าล่าสุด
    let response = {
      recipient: { id: psid },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'coupon',
            title: `ออเดอร์จาก Live สด`,
            subtitle, // ใช้ subtitle ของสินค้าล่าสุด
            coupon_url: `https://weliveapp.netlify.app/order/${order._id}`,
            coupon_url_button_title: 'ยืนยันออเดอร์',
            coupon_pre_message: 'ยืนยันการสั่งซื้อของคุณด้านล่าง!',
            image_url: 'https://weliveapp.netlify.app/assets/logo-lw_6-qUb.png',
            payload: 'รายละเอียดออเดอร์',
          },
        },
      },
    }

    console.log('Sending message for the latest order item')

    // ส่งข้อความไปยังผู้ใช้ผ่าน Messenger API
    await axios
      .post(
        `https://graph.facebook.com/v21.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
        response
      )
      .then(() => console.log('Message sent successfully'))
  } catch (error) {
    console.error('Error sending message:', error.message)
  }
}

export const ccOrderByComment = (psid, orderID) => {
  let response = {
    recipient: { id: psid },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [
            {
              title: 'คุณได้ยกเลิกออเดอร์แล้ว',
              subtitle: `คุณสามารถคอมเมนต์สั่งซื้อสินค้าใหม่อีกครั้งในไลฟ์สดได้ หากต้องการดูรายละเอียดเพิ่มเติมคลิกที่นี่`,
              image_url:
                'https://weliveapp.netlify.app/assets/logo-lw_6-qUb.png',
              buttons: [
                {
                  type: 'web_url',
                  url: `https://weliveapp.netlify.app/order/${orderID}`,
                  title: 'ดูรายละเอียดคำสั่งซื้อ',
                },
              ],
            },
          ],
        },
      },
    },
  }

  return axios.post(
    `https://graph.facebook.com/v21.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    response
  )
}

export default router
