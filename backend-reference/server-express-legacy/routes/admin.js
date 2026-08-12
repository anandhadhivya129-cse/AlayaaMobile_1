import express from 'express'
import { authenticateToken, requireRole } from '../middleware/auth.js'
import { admins, brokers, users, properties, inquiries } from '../data/db.js'

const router = express.Router()

router.use(authenticateToken, requireRole('admin'))

router.get('/stats', (req, res) => {
  return res.json({
    totalUsers: users.length,
    totalBrokers: brokers.length,
    totalProperties: properties.length,
    totalInquiries: inquiries.length,
  })
})

router.get('/brokers', (req, res) => res.json(brokers))
router.get('/users', (req, res) => res.json(users))
router.get('/properties', (req, res) => res.json(properties))
router.get('/inquiries', (req, res) => res.json(inquiries))

router.patch('/brokers/:id/approve', (req, res) => {
  const broker = brokers.find((item) => item.id === req.params.id)
  if (!broker) {
    return res.status(404).json({ message: 'Broker not found' })
  }
  broker.approved = true
  return res.json({ message: 'Broker approved', broker })
})

router.patch('/brokers/:id/reject', (req, res) => {
  const index = brokers.findIndex((item) => item.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ message: 'Broker not found' })
  }
  brokers.splice(index, 1)
  return res.json({ message: 'Broker rejected and removed' })
})

router.delete('/properties/:id', (req, res) => {
  const index = properties.findIndex((item) => item.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ message: 'Property not found' })
  }
  properties.splice(index, 1)
  return res.json({ message: 'Property deleted' })
})

export default router
