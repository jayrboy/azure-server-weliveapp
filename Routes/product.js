import express from 'express'
import {
  create,
  getAll,
  getById,
  update,
  remove,
  search,
} from '../Controllers/product-controller.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

/*  
 http://localhost:8000/api/product
 https://vercel-server-weliveapp.vercel.app/api/product
*/

/**
 * @swagger
 * /api/product:
 *    post:
 *      tags: [Product]
 *      security:
 *        - bearerAuth: []
 *      summary: Add a new product to the stock
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Product'
 *        required: true
 *      responses:
 *        201:
 *          description: Create
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Product'
 *        400:
 *          description: Bad request
 *        401:
 *          description: Unauthorized
 */
router.post('/product', auth, create)

/**
 * @swagger
 * /api/product:
 *    get:
 *      tags: [Product]
 *      security:
 *        - bearerAuth: []
 *      summary: Get All Products
 *      responses:
 *        200:
 *          description: Success
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/Product'
 *        401:
 *          description: Unauthorized
 *        404:
 *          description: Not found
 */
router.get('/product', auth, getAll)

/**
 * @swagger
 * /api/product/read/{id}:
 *    get:
 *      tags: [Product]
 *      summary: Get Product By ID
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
 *                $ref: '#/components/schemas/Product'
 *        401:
 *          description: Unauthorized
 *        404:
 *          description: Not found
 */
router.get('/product/read/:id', auth, getById)

/**
 * @swagger
 * /api/product:
 *    put:
 *      tags: [Product]
 *      security:
 *        - bearerAuth: []
 *      summary: Update Product
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Product'
 *      responses:
 *        200:
 *          description: Success
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Product'
 *        400:
 *          description: Bed request
 *        401:
 *          description: Unauthorized
 */
router.put('/product', auth, update)

/**
 * @swagger
 * /api/product/{id}:
 *    delete:
 *      tags: [Product]
 *      security:
 *        - bearerAuth: []
 *      summary: Delete Product By ID
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          description: ID of the product to delete
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Success
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Product'
 *        401:
 *          description: Unauthorized
 *        404:
 *          description: Not found
 */
//TODO: สำหรับลบใน product ตอน create daily stock
router.delete('/product/delete', auth, remove)

/**
 * @swagger
 * /api/product/search:
 *    get:
 *      tags: [Product]
 *      security:
 *        - bearerAuth: []
 *      summary: Search Product by name or code
 *      parameters:
 *        - in: query
 *          name: q
 *          type: string
 *          required: false
 *          default: swag
 *          description: The query string for searching products by code or name.
 *        - in: query
 *          name: page
 *          type: integer
 *          description: The page of products to return.
 *      responses:
 *        200:
 *          description: Success
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Product'
 *        401:
 *          description: Unauthorized
 *        404:
 *          description: Not found
 *        500:
 *          description: Internal server error
 */
router.get('/product/search', auth, search)

export default router

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - code
 *         - name
 *         - price
 *         - cost
 *         - stock_quantity
 *         - date_added
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id
 *           example: "66238c86a0f9c66406e2e036"
 *         code:
 *           type: string
 *           example: "A2"
 *         name:
 *           type: string
 *           example: "test"
 *         price:
 *           type: number
 *           example: 100.0
 *         cost:
 *           type: number
 *           example: 80.0
 *         stock_quantity:
 *           type: number
 *           format: int32
 *           example: 50
 *         limit:
 *           type: number
 *           example: 5
 *         cf:
 *           type: number
 *           example: 1.0
 *         paid:
 *           type: number
 *           example: 50.0
 *         remaining_cf:
 *           type: number
 *           example: 0.5
 *         remaining:
 *           type: number
 *           example: 50.0
 *         date_added:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00Z"
 */
