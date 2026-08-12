import bcrypt from 'bcryptjs'

const hashPassword = (password) => bcrypt.hashSync(password, 10)

export const users = [
  {
    id: 'user-1',
    role: 'user',
    fullName: 'Rahul Kumar',
    email: 'user@alayaa.in',
    phone: '+91 98765 43210',
    passwordHash: hashPassword('user123'),
    profilePicture: '',
    createdAt: '2026-01-12T08:30:00.000Z',
    resetToken: null,
    resetTokenExpiry: null,
  },
]

export const brokers = [
  {
    id: 'broker-1',
    role: 'broker',
    fullName: 'Priya Nair',
    email: 'broker@alayaa.in',
    phone: '+91 91234 56789',
    passwordHash: hashPassword('broker123'),
    profilePicture: '',
    createdAt: '2026-02-08T10:00:00.000Z',
    approved: true,
    company: 'ALAYAA Realty',
    bio: 'Tamil Nadu property expert for premium residential and commercial listings.',
    resetToken: null,
    resetTokenExpiry: null,
  },
]

export const admins = [
  {
    id: 'admin-1',
    role: 'admin',
    fullName: 'Ananya Sharma',
    email: 'admin@alayaa.in',
    phone: '+91 99876 54321',
    passwordHash: hashPassword('admin123'),
    profilePicture: '',
    createdAt: '2026-01-01T09:00:00.000Z',
    resetToken: null,
    resetTokenExpiry: null,
  },
]

export const propertyImages = [
  { id: 'img-1', propertyId: 'property-1', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000&auto=format&fit=crop' },
  { id: 'img-2', propertyId: 'property-2', url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1000&auto=format&fit=crop' },
  { id: 'img-3', propertyId: 'property-3', url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000&auto=format&fit=crop' },
]

export const properties = [
  {
    id: 'property-1',
    title: 'Adyar Bay Residences',
    city: 'Chennai',
    location: 'Adyar, Chennai',
    description: 'Premium 3BHK apartments with ocean views and intelligent community amenities.',
    price: 'Rs 2.35 Cr',
    propertyType: 'Apartment',
    listingType: 'Buy',
    ownerId: 'broker-1',
    ownerRole: 'broker',
    imageIds: ['img-1'],
    status: 'Active',
    createdAt: '2026-03-10T08:30:00.000Z',
  },
  {
    id: 'property-2',
    title: 'Race Course Garden Villa',
    city: 'Coimbatore',
    location: 'Race Course, Coimbatore',
    description: 'Luxury villa with private garden, solar power, and 24/7 security.',
    price: 'Rs 3.1 Cr',
    propertyType: 'Villa',
    listingType: 'Buy',
    ownerId: 'broker-1',
    ownerRole: 'broker',
    imageIds: ['img-2'],
    status: 'Active',
    createdAt: '2026-04-05T11:00:00.000Z',
  },
  {
    id: 'property-3',
    title: 'Anna Nagar Urban Nest',
    city: 'Madurai',
    location: 'Anna Nagar, Madurai',
    description: 'Well-appointed 2BHK apartment in a connected neighborhood with walkable amenities.',
    price: 'Rs 82 L',
    propertyType: 'Apartment',
    listingType: 'Rent',
    ownerId: 'broker-1',
    ownerRole: 'broker',
    imageIds: ['img-3'],
    status: 'Active',
    createdAt: '2026-05-02T14:20:00.000Z',
  },
]

export const inquiries = [
  {
    id: 'inquiry-1',
    propertyId: 'property-1',
    userId: 'user-1',
    brokerId: 'broker-1',
    message: 'I am interested in this property. Can I schedule a site visit next week?',
    createdAt: '2026-05-18T12:00:00.000Z',
    status: 'Open',
  },
]

export const favorites = [
  {
    id: 'favorite-1',
    userId: 'user-1',
    propertyId: 'property-2',
    createdAt: '2026-05-20T16:45:00.000Z',
  },
]

export const findAccountByEmail = (email) => {
  const normalized = email.trim().toLowerCase()
  return users.find((item) => item.email === normalized) || brokers.find((item) => item.email === normalized) || admins.find((item) => item.email === normalized)
}

export const getAccount = (role, id) => {
  if (role === 'admin') return admins.find((admin) => admin.id === id)
  if (role === 'broker') return brokers.find((broker) => broker.id === id)
  return users.find((user) => user.id === id)
}

export const createId = (prefix) => `${prefix}-${crypto.randomUUID()}`
