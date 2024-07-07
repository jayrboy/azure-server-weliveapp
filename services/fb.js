import 'dotenv/config'
import crypto from 'crypto'

const APP_ID = process.env.APP_ID
const APP_SECRET = process.env.APP_SECRET

const FACEBOOK_GRAPH_API = 'https://graph.facebook.com/v20.0'

//? https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived/?locale=th_TH
export const getUserLongLivedAccessToken = async (token) => {
  const response = await fetch(
    `${FACEBOOK_GRAPH_API}/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${token}`
  )
  const data = await response.json()

  if (response.ok) {
    return data.access_token
  }

  throw new Error('User access token failed')
}

//? https://developers.facebook.com/docs/facebook-login/guides/access-tokens/ (token การเข้าถึง App)
//TODO: (1) สร้างคำขอไปยัง API ของ Facebook ในนามของแอป ที่ไม่ใช่ในนามของผู้ใช้
/* หลังได้รับ response ซึ่งจะสามารถใช้ เพื่อปรับแต่ง parameters ของแอป
    - สร้าง และจัดการผู้ใช้ขั้นทดสอบ
    - หรือ อ่านข้อมูลเชิงลึกของแอป */
export const getAppAccessToken = async () => {
  const response = await fetch(
    `https://graph.facebook.com/oauth/access_token?client_id=${APP_ID}&client_secret=${APP_SECRET}&grant_type=client_credentials`
  )
  const data = await response.json()

  if (!response.ok) {
    throw new Error('App access token failed')
  }

  return data.access_token //422988337380571|Wwmtig1WYSo0Ij9wkoxD9MB0kVc
}

//? https://developers.facebook.com/docs/graph-api/reference/v20.0/debug_token
//TODO: (2) แก้ไขจุดบกพร่องของปัญหาที่เกิดกับชุด token การเข้าถึงจำนวนมากได้
/* ฟังก์ชันส่งข้อมูลคืน Meta เกี่ยวกับ token การเข้าถึงที่กำหนดรวมถึงข้อมูล เช่น
    - ผู้ใช้ที่ออก token ให้ (ฟังก์ชันนี้นั่นเอง),
    - สถานะการใช้งานของ token,
    - เวลาหมดอายุของ token และสิทธิ์การอนุญาตที่แอปมีให้สำหรับผู้ใช้ */
export const debugToken = async (appAccessToken, token) => {
  const response = await fetch(
    `${FACEBOOK_GRAPH_API}/debug_token?input_token=${token}&access_token=${appAccessToken}`
  )
  const data = await response.json()

  return data.data.scopes
}
/*
ข้อมูลสิทธิ์การอนุญาตที่แอปมีให้สำหรับผู้ใช้ (ส่ง token ไปให้ Meta ตรวจสอบการแก้ไขจุดบกพร่องและข้อผิดพลาด)
GET: https://graph.facebook.com/v20.0/debug_token?input_token=${USER_ACCESS_TOKEN}&access_token=${APP_ACCESS_TOKEN}

return data.data.scopes
[
  'user_videos',
  'email',
  'publish_video',
  'pages_show_list',
  'pages_read_engagement',
  'public_profile'
]
*/

//? https://developers.facebook.com/docs/facebook-login/guides/access-tokens (token การเข้าถึง Pages)
//TODO: (3)
/* หลังได้รับการอนุมัติ การเข้าถึงผู้ใช้แล้ว ถึงจะสามารถนำมาใช้เพื่อรับ token การเข้าถึงเพจผ่าน Graph API
    - อ่าน เขียน 
    - และปรับแต่งข้อมูลของเพจ Facebook */
export const getPagesBasedOnToken = async (userToken) => {
  const response = await fetch(
    `${FACEBOOK_GRAPH_API}/me/accounts?access_token=${userToken}`
  )

  const data = await response.json()

  if (response.ok) {
    return data.data
  }

  throw new Error('Something went bad')
}
/*
ข้อมูลเพจของผู้ใช้
GET: https://graph.facebook.com/v20.0/me/accounts?access_token=${USER_ACCESS_TOKEN}

return data.data
[
    {
        "access_token": "EAAGAtKWXZCNsBO8iIiKAmTq3TtwyfzZBNWvMOxs7wLDfywmUNCAh3HjRMH5T9ZCI9ZBLAO8Dfbv8cdgL1bFg79ex4ndU7MwI9wUlkFlrLmxF1ZAxXunZCb1Tq9atd6fdahu6fVZBE1TNEPfDiEo2RW0cSLoHRu5zZCuKo3mxVpsiD1KrxYhkOVQLNcMvFg8McZBvqNXZA4aMZAQzLWXvnE7DrShkyIaxZASCWYvhFgZDZD",
        "category": "ร้านขายของชำ",
        "category_list": [
            {
                "id": "150108431712141",
                "name": "ร้านขายของชำ"
            }
        ],
        "name": "ค้าขาย ร่ำรวย",
        "id": "349127668282384",
        "tasks": [
            "ADVERTISE",
            "ANALYZE",
            "CREATE_CONTENT",
            "MESSAGING",
            "MODERATE",
            "MANAGE"
        ]
    }
]
*/

//? https://developers.facebook.com/docs/facebook-login/guides/access-tokens (token การเข้าถึง Pages)
//TODO: (3)
export const postPageOnToken = async (pageId, message, userToken) => {
  const response = await fetch(
    `${FACEBOOK_GRAPH_API}/${pageId}/feed?message=${message}&access_token=${userToken}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' } }
  )

  const data = await response.json()

  if (response.ok) {
    return data.id
  }

  throw new Error('Post page failed')
}

//? https://developers.facebook.com/docs/live-video-api/ (API วิดีโอถ่ายทอดสด)
// ฟังก์ชัน เปิด Live Video โดยที่ /me คือ ID สำหรับ User หรือ Page
export const openLiveVideo = async (me, title, description, accessToken) => {
  try {
    const response = await fetch(
      `${FACEBOOK_GRAPH_API}/${me}/live_videos?status=LIVE_NOW&title=${title}&description=${description}&access_token=${accessToken}`,
      {
        method: 'POST',
      }
    )

    const data = await response.json()

    if (response.ok) {
      return data
    } else {
      throw data.error
    }
  } catch (error) {
    throw error
  }
}

// ฟังก์ชันสำหรับสร้าง appsecret_proof
export function generateAppSecretProof(userAccessToken) {
  const hmac = crypto.createHmac('sha256', APP_SECRET)
  hmac.update(userAccessToken)
  return hmac.digest('hex')
}
