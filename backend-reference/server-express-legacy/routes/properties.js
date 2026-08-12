import express from 'express'
import { authenticateToken, requireRole } from '../middleware/auth.js'
import { properties, propertyImages, createId, getAccount } from '../data/db.js'

const router = express.Router()

const enhanceProperty = (property) => ({
  ...property,
  images: property.imageIds.map((id) => propertyImages.find((img) => img.id === id)?.url).filter(Boolean),
})

router.get('/', (req, res) => {
  const { city, propertyType, query } = req.query
  const result = properties.filter((property) => {
    const matchesCity = city ? property.city.toLowerCase() === city.toLowerCase() : true
    const matchesType = propertyType ? property.propertyType.toLowerCase() === propertyType.toLowerCase() : true
    const matchesQuery = query ? `${property.title} ${property.location}`.toLowerCase().includes(query.toLowerCase()) : true
    return matchesCity && matchesType && matchesQuery
  })
  return res.json(result.map(enhanceProperty))
})

router.get('/:id', (req, res) => {
  const property = properties.find((item) => item.id === req.params.id)
  if (!property) {
    return res.status(404).json({ message: 'Property not found' })
  }
  return res.json(enhanceProperty(property))
})

router.post('/', authenticateToken, requireRole('broker', 'admin'), (req, res) => {
  const { title, city, location, description, price, propertyType, listingType, images } = req.body
  if (!title || !city || !location || !price || !propertyType) {
    return res.status(400).json({ message: 'Missing required property fields' })
  }

  const newProperty = {
    id: createId('property'),
    title,
    city,
    location,
    description: description || '',
    price,
    propertyType,
    listingType: listingType || 'Buy',
    ownerId: req.user.id,
    ownerRole: req.user.role,
    imageIds: Array.isArray(images) && images.length ? images.map((url) => createId('img')) : [],
    status: 'Active',
    createdAt: new Date().toISOString(),
  }

  if (Array.isArray(images)) {
    newProperty.imageIds = images.map((url) => {
      const imageId = createId('img')
      propertyImages.push({ id: imageId, propertyId: newProperty.id, url })
      return imageId
    })
  }

  properties.push(newProperty)
  return res.status(201).json(enhanceProperty(newProperty))
})

router.patch('/:id', authenticateToken, requireRole('broker', 'admin'), (req, res) => {
  const property = properties.find((item) => item.id === req.params.id)
  if (!property) {
    return res.status(404).json({ message: 'Property not found' })
  }

  if (req.user.role === 'broker' && property.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Not allowed to edit this listing' })
  }

  const updates = ['title', 'city', 'location', 'description', 'price', 'propertyType', 'listingType', 'status']
  updates.forEach((field) => {
    if (req.body[field] !== undefined) {
      property[field] = req.body[field]
    }
  })

  return res.json(enhanceProperty(property))
})

router.delete('/:id', authenticateToken, requireRole('broker', 'admin'), (req, res) => {
  const index = properties.findIndex((item) => item.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ message: 'Property not found' })
  }

  const property = properties[index]
  if (req.user.role === 'broker' && property.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Not allowed to delete this listing' })
  }

  properties.splice(index, 1)
  return res.json({ message: 'Property deleted' })
})

export default router
