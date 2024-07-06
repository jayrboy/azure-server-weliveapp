import express from 'express'
import {
  generateToken,
  register,
  login,
  getCookies,
} from '../Controllers/auth-controller.js'
import { checkUser } from '../Controllers/user-controller.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

// http://localhost:8000/api

/**
 * @swagger
 * components:
 *   schemas:
 *     Authorization:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id
 *           example: "66238c86a0f9c66406e2e036"
 *         code:
 *           type: string
 *           example: "admin"
 *         name:
 *           type: string
 *           example: "1234"
 *       example:
 *         _id: "66238c86a0f9c66406e2e036"
 *         username: "admin"
 *         password: "1234"
 */

/**
 * @swagger
 * /api/token:
 *  post:
 *      tags: [Authorization]
 *      summary: "Generates Token"
 *      responses:
 *          200:
 *              description: "Success"
 */
router.post('/token', generateToken)

/**
 * @swagger
 * /api/register:
 *  post:
 *      tags: [Authorization]
 *      summary: "Register"
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          username:
 *                              type: string
 *                              default: "user"
 *                          password:
 *                              type: string
 *                              default: "1234"
 *              example:
 *                  username: "user"
 *                  password: "1234"
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: "Register Success"
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                      example:
 *                          "username": "string"
 *                          "password": "string"
 *          400:
 *              description: "Bad request"
 *          404:
 *              description: "Not found"
 *          500:
 *              description: "Interval server error"
 */
router.post('/register', register)

/**
 * @swagger
 * /api/login:
 *  post:
 *      tags:
 *          - Authorization
 *      summary: "Login"
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          username:
 *                              type: string
 *                              default: "admin"
 *                          password:
 *                              type: string
 *                              default: "1234"
 *              example:
 *                  username: "admin"
 *                  password: "1234"
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: "Login Success"
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                      example:
 *                          "token": "string"
 *          400:
 *              description: "Bad request"
 *          404:
 *              description: "Not found"
 *          500:
 *              description: "Interval server error"
 */
router.post('/login', login)

// router.post('/login-facebook', loginFB)

router.get('/cookie/get', getCookies)

router.post('/current-user', auth, checkUser)

router.post('/current-admin', auth, checkUser)

export default router
