import express from 'express'
import { body } from 'express-validator'
import {
  create,
  getAll,
  getById,
  update,
  remove,
  paid,
  getOrderForReport,
  setOrderComplete,
  setOrderSended,
} from '../Controllers/sale-order-controller.js'
import { auth } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

/*  
 http://localhost:8000/api/sale-order
 https://vercel-server-weliveapp.vercel.app/api/sale-order
*/

/**
 * @swagger
 * /api/sale-order:
 *    post:
 *      tags: [Sale Order]
 *      security:
 *        - bearerAuth: []
 *      summary: Add a new Sale Order to the stock
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/SaleOrder'
 *        required: true
 *      responses:
 *        201:
 *          description: Create
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/SaleOrder'
 *        400:
 *          description: Bad request
 *        401:
 *          description: Unauthorized
 */
router.post(
  '/sale-order',
  body('idFb').notEmpty().withMessage('ID Facebook is required'),
  create
)

/**
 * @swagger
 * /api/sale-order:
 *    get:
 *      tags: [Sale Order]
 *      summary: Get All Sale Orders
 *      responses:
 *        200:
 *          description: Success
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/SaleOrder'
 *        401:
 *          description: Unauthorized
 *        404:
 *          description: Not found
 */
router.get('/sale-order', getAll)

/**
 * @swagger
 * /api/sale-order/read/{id}:
 *    get:
 *      tags: [Sale Order]
 *      summary: Get Sale Order By ID
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Success
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/SaleOrder'
 *        401:
 *          description: Unauthorized
 *        404:
 *          description: Not found
 */
router.get('/sale-order/read/:id', getById)

/**
 * @swagger
 * /api/sale-order:
 *    put:
 *      tags: [Sale Order]
 *      summary: Update Sale Order
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/SaleOrder'
 *      responses:
 *        200:
 *          description: Success
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/SaleOrder'
 *        400:
 *          description: Bed request
 *        401:
 *          description: Unauthorized
 */
router.put('/sale-order', upload.single('picture_payment'), update)

/**
 * @swagger
 * /api/sale-order/{id}:
 *    delete:
 *      tags: [Sale Order]
 *      summary: Delete Sale Order By ID
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          description: ID of the Sale Order to delete
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Success
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/SaleOrder'
 *        401:
 *          description: Unauthorized
 *        404:
 *          description: Not found
 */
router.delete('/sale-order/:id', auth, remove)

/**
 * @swagger
 * /api/sale-order/complete/{id}:
 *   put:
 *     tags:
 *       - Sale Order
 *     summary: Toggle the "complete" status of an order
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The order ID
 *     responses:
 *       200:
 *         description: The updated order object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 idFb:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 picture_profile:
 *                   type: array
 *                   items:
 *                     type: string
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       product_id:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *                 picture_payment:
 *                   type: string
 *                 address:
 *                   type: string
 *                 sub_district:
 *                   type: string
 *                 sub_area:
 *                   type: string
 *                 district:
 *                   type: string
 *                 postcode:
 *                   type: integer
 *                 tel:
 *                   type: integer
 *                 complete:
 *                   type: boolean
 *                 sended:
 *                   type: boolean
 *                 date_added:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.put('/sale-order/complete/:id', setOrderComplete)

/**
 * @swagger
 * /api/sale-order/sended/{id}:
 *   put:
 *     tags:
 *       - Sale Order
 *     summary: Toggle the "sended" status of an order
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The order ID
 *     responses:
 *       200:
 *         description: The updated order object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 idFb:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 picture_profile:
 *                   type: array
 *                   items:
 *                     type: string
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       product_id:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *                 picture_payment:
 *                   type: string
 *                 address:
 *                   type: string
 *                 sub_district:
 *                   type: string
 *                 sub_area:
 *                   type: string
 *                 district:
 *                   type: string
 *                 postcode:
 *                   type: integer
 *                 tel:
 *                   type: integer
 *                 complete:
 *                   type: boolean
 *                 sended:
 *                   type: boolean
 *                 date_added:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.put('/sale-order/sended/:id', setOrderSended)

/**
 * @swagger
 * /api/sale-order/getorderforreport/{id}/{date}/{month}/{year}:
 *    get:
 *      tags: [Sale Order]
 *      security:
 *        - bearerAuth: []
 *      summary: Retrieve orders for report
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          description: ID of the sale order
 *          schema:
 *            type: string
 *        - name: date
 *          in: path
 *          required: true
 *          description: Day of the date
 *          schema:
 *            type: string
 *        - name: month
 *          in: path
 *          required: true
 *          description: Month of the date
 *          schema:
 *            type: string
 *        - name: year
 *          in: path
 *          required: true
 *          description: Year of the date
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Success
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  dailySales:
 *                    type: number
 *                  monthlySales:
 *                    type: number
 *                  yearlySales:
 *                    type: number
 *        400:
 *          description: Bad request
 *        401:
 *          description: Unauthorized
 *        404:
 *          description: Not found
 */
router.get(
  '/sale-order/getorderforreport/:id/:date/:month/:year',
  getOrderForReport
)
/**
 * @swagger
 * /api/sale-order/getorderforreport/{id}/{date}/{month}/{year}:
 *    get:
 *      tags: [Sale Order]
 *      security:
 *        - bearerAuth: []
 *      summary: Retrieve orders for report
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          description: ID of the sale order
 *          schema:
 *            type: string
 *        - name: date
 *          in: path
 *          required: true
 *          description: Day of the date
 *          schema:
 *            type: string
 *        - name: month
 *          in: path
 *          required: true
 *          description: Month of the date
 *          schema:
 *            type: string
 *        - name: year
 *          in: path
 *          required: true
 *          description: Year of the date
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Success
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  productName:
 *                    type: string
 *                  totalQuantity:
 *                    type: number
 *                  totalPrice:
 *                    type: number
 *                  dailySales:
 *                    type: number
 *                  monthlySales:
 *                    type: number
 *                  yearlySales:
 *                    type: number
 *                  dailySalesData:
 *                    type: array
 *                    items:
 *                      type: number
 *                  last30Days:
 *                    type: array
 *                    items:
 *                      type: string
 *        400:
 *          description: Bad request
 *        401:
 *          description: Unauthorized
 *        404:
 *          description: Not found
 *        500:
 *          description: Internal server error
 */
router.get(
  '/sale-order/getorderforreport/:id/:date/:month/:year',
  getOrderForReport
)

export default router

/**
 * @swagger
 * components:
 *   schemas:
 *     SaleOrder:
 *       type: object
 *       properties:
 *         idFb:
 *           type: string
 *           example: "24610349765279316"
 *         name:
 *           type: string
 *           example: "Jay Jakkrit"
 *         email:
 *           type: string
 *           example: "example@fb.com"
 *         picture_profile:
 *           type: array
 *         orders:
 *           type: array
 *           items:
 *            $ref: '#/components/schemas/Order'
 *         picture_payment:
 *           type: array
 *         address:
 *           type: string
 *         sub_district:
 *           type: string
 *         sub_area:
 *           type: string
 *         district:
 *           type: string
 *         postcode:
 *           type: number
 *         tel:
 *           type: number
 *         complete:
 *           type: boolean
 *           example: false
 *         date_added:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00Z"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "66238c86a0f9c66406e2e036"
 *         name:
 *           type: string
 *           example: "รองเท้าสุดเท่"
 *         quantity:
 *           type: number
 *           example: 3
 *         price:
 *           type: number
 *           example: 1000
 */
