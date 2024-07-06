import axios from 'axios'
import fs from 'fs'

//TODO: Comments from Graph API

let cfg = {
  liveVideoID: null,
  accessToken:
    process.env.ACCESS_TOKEN ||
    'EAAQi1tOQCP4BOwbZCvW1ZBAOOgxunGq9KkdG6YHvA43xqCL0frZATO0gWznSHfkQnhFqpyLurZCfNBPQXGpCZBqI1MeGHIBbruL7L4mEUffQNhQze0rifPYkwfa2k1mZCuacVdQZBIn4qNuMDnZCoVGriuR8HoviK3TXO2rVSmHxdvJVxjPSOGl6vWOWoUZAkVI2VJon83r5TB8SjZAqpZCafIH10pbFbclDDbynOfjsfpoZAb7Tyr8lBSqSJu3c8dYOXwWuZAfvZAVgZDZD',
}

async function getLiveVideoID() {
  const url = `https://graph.facebook.com/v19.0/me/live_videos`
  const params = {
    fields: 'status,permalink_url',
    access_token: cfg.accessToken,
  }

  const response = await axios.get(url, { params })
  let liveVideo = response.data.data[0]

  if (liveVideo.status === 'LIVE') {
    let video_url = liveVideo.permalink_url.split('/')
    cfg.liveVideoID = video_url[video_url.length - 1]
  }

  return cfg.liveVideoID
}

// getLiveVideoID()

async function getCommentAPI() {
  let url = `https://graph.facebook.com/v19.0/${cfg.liveVideoID}/comments`
  let params = {
    access_token: cfg.accessToken,
  }
  try {
    let response = await axios.get(url, { params })
    // console.log(response.data)
    return response.data.data
  } catch (err) {
    console.log('Failed to get comments from graph api --->', err)
  }
}

//TODO: ฟังก์ชันอ่านเฉพาะ comment ใหม่
/*
  วนลูป newComment ใหม่ที่ได้มา แล้วตรวจสอบ newComment ว่ามี oldComment หรือไม่
  id oldComment ไม่ตรงกับ id ของ newComment เท่ากับ newComment ใหม่
  หากทำงานเสร็จสิ้น ส่ง newComment ใหม่
*/
async function latestComment(oldComment, newComment) {
  return new Promise((resolve) => {
    newComment.forEach((comment) => {
      if (oldComment.find((cm) => cm.id != comment.id)) {
        writeFileCSV(comment)
        // this is a new comment
        console.log(comment)
      }
    })
    resolve(newComment)
  })
}

//TODO: บันทึกไฟล์ .csv ลูกค้าที่สั่งซื้อสินค้าตามรหัส code
/*
  ตรวจสอบ comment ที่ขึ้นต้นด้วย "รหัสสินค้า" ที่กำหนดไว้ หากตรงกันจริง
  จะทำการเขียนข้อมูลลงในไฟล์ CSV ในรูปแบบของตาราง rows, columns
  และใช้ fs.appendFileSync() โดยเขียนข้อมูลเข้าไปแทรกในข้อมูลที่มีอยู่แล้วในไฟล์
*/
let code = 'A'
const fileCSV = 'customer.csv'

function writeFileCSV(comment) {
  try {
    let message = String(comment.message).toLowerCase()
    if (message.substring(0, code.length) == code.toLowerCase()) {
      let row =
        comment.from.id +
        ',' +
        comment.from.name +
        ',' +
        comment.message +
        ',' +
        comment.created_time +
        '\n'
      fs.appendFileSync(fileCSV, row, 'utf8')
    }
  } catch (e) {
    console.log('Write file error --->', e)
  }
}

//TODO: Main Function
export async function getComment() {
  let firstLoad = true
  let commentList = []

  setInterval(async () => {
    let newComment = await getCommentAPI()
    if (firstLoad) {
      console.log('Initial comments', newComment)
      commentList = newComment

      fs.writeFileSync(fileCSV, '\ufeffComment_ID,Name,Code,Date\n', 'utf8')
      commentList.forEach((comment) => {
        writeFileCSV(comment)
      })

      firstLoad = false
    } else {
      commentList = await latestComment(commentList, newComment)
    }
  }, 10000)
}

// getComment()
