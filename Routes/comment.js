import express from 'express'
import Order from '../Models/Order.js'

const router = express.Router()

// Example from Chat GPT: Endpoint สำหรับเพิ่มความคิดเห็น

router.post('/comments', async (req, res) => {
  try {
    const { userId, productId, content } = req.body
    const comment = await Comment.create({ userId, productId, content })
    res.status(201).json(comment)
  } catch (error) {
    console.error('Error adding comment:', error)
    res.status(500).json({ message: 'Failed to add comment' })
  }
})

// Endpoint สำหรับดึงความคิดเห็นทั้งหมดสำหรับสินค้าที่กำหนด
router.get('/comments/:productId', async (req, res) => {
  try {
    const productId = req.params.productId
    const comments = await Comment.find({ productId })
    res.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    res.status(500).json({ message: 'Failed to fetch comments' })
  }
})

export default router
