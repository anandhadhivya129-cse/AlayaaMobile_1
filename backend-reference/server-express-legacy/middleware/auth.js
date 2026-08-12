import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'alayaa-super-secret'

export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' })
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' })
  }
  next()
}
