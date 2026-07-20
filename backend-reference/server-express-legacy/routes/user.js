import express from 'express'
import { authenticateToken, requireRole } from '../middleware/auth.js'
import { properties, inquiries, favorites, users } from '../data/db.js'

const router = express.Router()

router.use(authenticateToken, requireRole('user'))

router.get('/browse', (req, res) => res.json(properties))
router.get('/favorites', (req, res) => res.json(favorites.filter((item) => item.userId === req.user.id)))
router.get('/inquiries', (req, res) => res.json(inquiries.filter((item) => item.userId === req.user.id)))

router.get('/profile', (req, res) => {
  const user = users.find(u => u.id === req.user.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  const { passwordHash, resetToken, resetTokenExpiry, ...safe } = user
  return res.json(safe)
})

router.put('/profile', (req, res) => {
  const user = users.find(u => u.id === req.user.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  const { fullName, phone, city, bio, profilePicture } = req.body
  if (fullName) user.fullName = fullName.trim()
  if (phone !== undefined) user.phone = phone.trim()
  if (city !== undefined) user.city = city
  if (bio !== undefined) user.bio = bio
  if (profilePicture !== undefined) user.profilePicture = profilePicture
  const { passwordHash, resetToken, resetTokenExpiry, ...safe } = user
  return res.json({ message: 'Profile updated', user: safe })
})

router.put('/notifications', (req, res) => {
  const user = users.find(u => u.id === req.user.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  user.notificationPreferences = req.body
  return res.json({ message: 'Notification preferences saved' })
})

router.delete('/account', (req, res) => {
  const idx = users.findIndex(u => u.id === req.user.id)
  if (idx === -1) return res.status(404).json({ message: 'User not found' })
  users.splice(idx, 1)
  return res.json({ message: 'Account deleted' })
})

export default router
