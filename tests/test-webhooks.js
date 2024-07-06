import 'dotenv/config'
import express from 'express'
import xhub from 'express-x-hub'

const router = express.Router()

// Define a message verify token (custom)
const WEBHOOKS_VERIFY_TOKEN = 'message001'
let received_updates = []

//! Meta เปิด Mode: Live Preview สำหรับ Test
/*-------------- https://ngrok-free.app/webhooks --------------*/

router.use(xhub({ algorithm: 'sha256', secret: process.env.APP_SECRET }))

router.get('/', (req, res) => {
  res
    .status(200)
    .send('<pre>' + JSON.stringify(received_updates, null, 2) + '</pre>')
})

// //TODO: Webhooks Test
// /* ---------------------- GET-Webhooks-TEST ------------------- */
router.get('/test', (req, res) => {
  // Parse the query params
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

// //TODO: Webhooks Test
// /* ---------------------- POST-Webhooks-TEST -------------------- */
router.post('/test', async (req, res) => {
  // Facebook will be sending an object called
  let form = req.body

  if (!req.isXHubValid) {
    console.log('Warning request header X-Hub-Signature not present or invalid')
    res.sendStatus(401)
    return
  }

  if (!req.body.entry) {
    console.log('INVALID_POST_DATA_RECEIVED')
    return res.status(500)
  }

  if (form.object) {
    let events = form.entry[0]
    received_updates.unshift(events)
  } else {
    res.sendStatus(404) // if event is not from a "page" subscription
  }
  res.sendStatus(200)
})

export default router
