import express from 'express'
import jwt from 'jsonwebtoken'

import {
  generateAppSecretProof,
  getUserLongLivedAccessToken,
  getAppAccessToken,
  debugToken,
  getPagesBasedOnToken,
  postPageOnToken,
  openLiveVideo,
} from '../services/fb.js'

import User from '../Models/User.js'

// http://localhost:8000/api/fb-sdk
//

const router = express.Router()

/**
 * @swagger
 * /api/fb-sdk:
 *   post:
 *     tags: [Facebook SDK]
 *     summary: Handle Facebook login and fetch user data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: Facebook user ID
 *               name:
 *                 type: string
 *                 description: User's name
 *               picture:
 *                 type: object
 *                 properties:
 *                   data:
 *                     type: object
 *                     properties:
 *                       url:
 *                         type: string
 *                         description: URL of the user's profile picture
 *               email:
 *                 type: string
 *                 description: User's email
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 payload:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       description: User object
 *                     scopes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of user scopes
 */
router.post('/fb-sdk', async (req, res) => {
  let form = req.body
  let userData = {
    username: req.body.id,
    name: req.body.name,
    picture: req.body.picture,
    email: req.body.email,
  }

  const userAccessToken = await getUserLongLivedAccessToken(req.query.token)
  const appAccessToken = await getAppAccessToken()

  // Generate appsecret_proof
  const appSecretProof = generateAppSecretProof(userAccessToken)
  console.log('App Secret Proof:', appSecretProof)

  const scopes = await debugToken(appAccessToken, userAccessToken)
  const pages = await getPagesBasedOnToken(userAccessToken)

  let user = await User.findOneAndUpdate(
    { username: form.id },
    { $set: { ...userData, userAccessToken, pages } },
    { new: true, useFindAndModify: false, upsert: true }
  )

  let payload = {
    user,
    scopes,
  }

  jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '1d' },
    (err, token) => {
      if (err) throw err
      res.json({ token, payload })
    }
  )
});


/**
 * @swagger
 * /api/fb-page-post:
 *   post:
 *     tags: [Facebook SDK]
 *     summary: โพสต์ข้อความไปยัง Facebook Page
 *     description: โพสต์ข้อความไปยัง Facebook Page โดยใช้ pageId, message และ accessToken
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pageId:
 *                 type: string
 *                 description: Facebook Page ID
 *                 example: '123456789012345'
 *               message:
 *                 type: string
 *                 description: ข้อความที่ต้องการโพสต์
 *                 example: 'Hello, this is a test post!'
 *               accessToken:
 *                 type: string
 *                 description: Facebook access token
 *                 example: 'your-access-token'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Facebook post ID
 *                   example: '349127668282384_122111581298360332'
 */
router.post('/fb-page-post', async (req, res) => {
  let { pageId, message, accessToken } = req.body
  const postId = await postPageOnToken(pageId, message, accessToken)

  res.status(200).json(postId) // "349127668282384_122111581298360332"
})

/**
 * @swagger
 * /api/fb-live-video:
 *   post:
 *     tags: [Facebook SDK]
 *     summary: Start a live video on Facebook
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pageId:
 *                 type: string
 *                 description: The ID of the Facebook page
 *                 example: "123456789012345"
 *               title:
 *                 type: string
 *                 description: The title of the live video
 *                 example: "My Live Video"
 *               description:
 *                 type: string
 *                 description: The description of the live video
 *                 example: "This is a live video description."
 *               accessToken:
 *                 type: string
 *                 description: The access token for the Facebook page
 *                 example: "EAAGm0PX4ZCpsBAMZCZC4uLZAi6ZCZAaZBZCNtZAvZAmEHYxZAeZBCZB0ZAyZCBZAXzFZCFmZD"
 *     responses:
 *       200:
 *         description: The response from the Facebook API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The ID of the live video
 *                   example: "349127668282384_122111581298360332"
 *       400:
 *         description: Bad Request - Permissions error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Permissions error"
 *                     type:
 *                       type: string
 *                       example: "OAuthException"
 *                     code:
 *                       type: integer
 *                       example: 200
 *                     error_subcode:
 *                       type: integer
 *                       example: 1363120
 *                     is_transient:
 *                       type: boolean
 *                       example: false
 *                     error_user_title:
 *                       type: string
 *                       example: "คุณไม่มีสิทธิ์เริ่มถ่ายทอดสด"
 *                     error_user_msg:
 *                       type: string
 *                       example: "โปรไฟล์ของคุณต้องมีอายุอย่างน้อย 60 วันจึงจะสามารถเริ่มถ่ายทอดสดบน Facebook ได้ เรียนรู้เพิ่มเติมที่ https://www.facebook.com/business/help/216491699144904"
 *                     fbtrace_id:
 *                       type: string
 *                       example: "A385w0SaV9K6SrflkwHfGFI"
 */
router.post('/fb-live-video', async (req, res) => {
  let { pageId, title, description, accessToken } = req.body

  try {
    const response = await openLiveVideo(
      pageId,
      title,
      description,
      accessToken
    )
    res.status(200).json(response)
  } catch (error) {
    // res.status(400).json(error)
    res.status(400).json(false)
  }
})

export default router

/**
 * @swagger
 * components:
 *   schemas:
 *     FacebookSDK:
 *       type: string
 *       properties:
 *         token:
 *           type: string
 *           description: user access token
 *           example: "EAAGAtKWXZCNsBO2Uh4xNdZBapFDKpbVvygaujozMw7qBuzukg4c56LzEANaQhZBIRU6KTWShdLPjzqzgbruVf3FZBrV5tqSxSzBD540U1DDZBPMdxU0ZBlEj8L1CIB5IZAhMfJZAhjGbCv690L7XdQ7A9ZCDKUYAAitLR4q3HmNZCOgJDvvgCAXqZAfAArZAORVNtSSwqAaUvI92JFWN9zAO9oAPvPte5c8ZD"
 */
