import express from 'express'

const router = express.Router()

router.get('/customer', (req, res) => {})
router.get('/customer/read/:id', (req, res) => {})

export default router

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       properties:
 *         idFb:
 *           type: string
 *           example: "66238c86a0f9_06e2e03612"
 *         name:
 *           type: string
 *           example: "Customer FB"
 *         email:
 *           type: string
 *           example: "example@test.com"
 *         picture:
 *           type: array
 *         date_added:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00Z"
 */
