import jwt from 'jsonwebtoken'

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // "Bearer <token>" split to ["Bearer", "token"]

    if (!token) {
      return res.status(401).send({ message: 'No Token' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded.user
    next()
  } catch (error) {
    res.status(400).send({ message: 'Token Invalid!' })
  }
}
