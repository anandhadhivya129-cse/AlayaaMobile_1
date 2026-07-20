import express from 'express'
import { authenticateToken, requireRole } from '../middleware/auth.js'
import { properties, inquiries, favorites } from '../data/db.js'

const router = express.Router()

router.use(authenticateToken, requireRole('broker'))

router.get('/listings', (req, res) => {
  const ownListings = properties.filter((property) => property.ownerId === req.user.id)
  return res.json(ownListings)
})

router.get('/inquiries', (req, res) => {
  const brokerInquiries = inquiries.filter((item) => item.brokerId === req.user.id)
  return res.json(brokerInquiries)
})

router.get('/leads', (req, res) => {
  const savedLeads = favorites.filter((item) => item.userId === req.user.id)
  return res.json(savedLeads)
})

router.get('/profile', (req, res) => {
  return res.json({ message: 'Broker profile management available' })
})

export default router
