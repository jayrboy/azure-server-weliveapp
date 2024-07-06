import express from 'express'
import DailyStock from '../Models/DailyStock.js'
import {
  create,
  getAll,
  getById,
  update,
  remove,
  getHistory,
} from '../Controllers/dailly-stock-controller.js'

const router = express.Router()

/**
 * @swagger
 * /api/daily/create:
 *    post:
 *      tags: [DailyStock]
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        201:
 *          description: Create
 *        400:
 *          description: Bad request
 *        404:
 *          description: Not found
 *        401:
 *          description: Unauthorized
 */
router.post('/daily/create', create)

/**
 * @swagger
 * /api/daily/read:
 *    get:
 *      tags: [DailyStock]
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          description: Success
 *        401:
 *          description: Unauthorized
 *        404:
 *          description: Not found
 *        500:
 *          description: Internal server error
 */
router.get('/daily/read', getAll)

/**
 * @swagger
 * /api/daily/read/{id}:
 *    get:
 *      tags: [DailyStock]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          description: ID of the Daily Stock to get
 *          schema:
 *            type: String
 *      responses:
 *        200:
 *          description: Success
 *        401:
 *          description: Unauthorized
 *        404:
 *          description: Not found
 *        500:
 *          description: Internal server error
 */
router.get('/daily/read/:id', getById)

router.get('/daily/read/:id/product/:idproduct', async (req, res) => {
  // console.log(req.params)
  const dailyStockId = req.params.id
  const productId = req.params.idproduct
  try {
    const dailyStock = await DailyStock.findOne({
      _id: dailyStockId,
      'products._id': productId,
    })
    const product = dailyStock.products.find((p) => p._id == productId)

    res.json(product)
  } catch (error) {
    console.log('Error retrieving product:', error)
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า' })
  }
})

router.get('/daily/new-status', (req, res) => {
  DailyStock.findOne({ status: 'new' }) // ค้นหาเอกสารที่มี status เป็น 'new'
    .sort({ date_added: -1 }) // เรียงลำดับตามวันที่เพิ่มข้อมูลในลำดับล่าสุดก่อน
    .exec()
    .then((doc) => res.json(doc))
    .catch((err) => {
      console.error('Error reading latest daily stocks:', err)
      res.status(500).send(false)
    })
})

/**
 * @swagger
 * /api/daily/update:
 *    post:
 *      tags: [DailyStock]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                _id:
 *                  type: string
 *                status:
 *                  type: string
 *                chanel:
 *                  type: string
 *                products:
 *                  type: array
 *                price_total:
 *                  type: number
 *                date_added:
 *                  type: string
 *      responses:
 *        200:
 *          description: Document updated
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/DailyStock'
 *        400:
 *          description: Bad request
 *        401:
 *          description: Unauthorized
 *        500:
 *          description: Internal server error
 */
router.put('/daily/update', update)

router.post('/daily/update/total', (req, res) => {
  const { id, total } = req.body

  DailyStock.findByIdAndUpdate(id, { price_total: total }, { new: true })
    .then((docs) => {
      // console.log(docs)
      res.json(docs)
    })
    .catch((err) => {
      console.error('Error updating DailyStock:')
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' })
    })
})

/**
 * @swagger
 * /api/daily/delete/product/{id}:
 *    delete:
 *      tags: [DailyStock]
 *      security:
 *        - bearerAuth: []
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
 *        401:
 *          description: Not found
 *        404:
 *          description: Not found
 *        500:
 *          description: Internal server error
 */
router.delete('/daily/delete/product/:id', remove)

router.post('/daily/change-role', (req, res) => {
  // console.log(req.body)
  const id = req.body.id
  const newStatus = req.body.status

  DailyStock.findByIdAndUpdate(
    id,
    { status: newStatus },
    { useFindAndModify: false }
  )
    .exec()
    .then((docs) => {
      // console.log(docs)
      if (!docs) {
        res.send('อัปเดตไม่สำเร็จ')
      } else {
        res.send('อัปเดตสำเร็จ')
      }
    })
    .catch((err) => res.send('เกิดข้อผิดพลาด ไม่สามารถแก้ไขได้'))
})

router.get('/daily/history', getHistory)

export default router
