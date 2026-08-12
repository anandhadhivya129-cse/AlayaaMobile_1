import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { authenticateToken } from '../middleware/auth.js'
import { users, brokers, admins, findAccountByEmail, getAccount, createId } from '../data/db.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'alayaa-super-secret'
const TOKEN_EXPIRY = '1d'

const publicProfile = (account) => ({
  id: account.id,
  role: account.role,
  fullName: account.fullName,
  email: account.email,
  phone: account.phone,
  profilePicture: account.profilePicture || '',
  createdAt: account.createdAt,
  approved: account.role === 'broker' ? account.approved : true,
})

const signToken = (account) => jwt.sign({ id: account.id, role: account.role, email: account.email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })

router.post('/login', async (req, res) => {
  const { email, password, role } = req.body
  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, password and role are required' })
  }

  const account = findAccountByEmail(email)
  if (!account || account.role !== role) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const validPassword = await bcrypt.compare(password, account.passwordHash)
  if (!validPassword) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  if (account.role === 'broker' && !account.approved) {
    return res.status(403).json({ message: 'Broker account is pending approval' })
  }

  const token = signToken(account)
  return res.json({ token, user: publicProfile(account) })
})

router.post('/register', async (req, res) => {
  const { fullName, email, phone, password, role, profilePicture, company, bio } = req.body
  if (!fullName || !email || !phone || !password || !role) {
    return res.status(400).json({ message: 'Missing registration fields' })
  }

  if (findAccountByEmail(email)) {
    return res.status(409).json({ message: 'Email already exists' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const base = {
    id: createId(role),
    role,
    fullName,
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    passwordHash,
    profilePicture: profilePicture || '',
    createdAt: new Date().toISOString(),
    resetToken: null,
    resetTokenExpiry: null,
  }

  if (role === 'admin') {
    admins.push(base)
  } else if (role === 'broker') {
    brokers.push({ ...base, approved: false, company: company || '', bio: bio || '' })
  } else {
    users.push(base)
  }

  const account = role === 'broker' ? brokers.find((item) => item.email === base.email) : role === 'admin' ? admins.find((item) => item.email === base.email) : users.find((item) => item.email === base.email)
  const token = signToken(account)
  return res.status(201).json({ token, user: publicProfile(account) })
})

router.post('/forgot-password', (req, res) => {
  const { email } = req.body
  if (!email) {
    return res.status(400).json({ message: 'Email is required' })
  }

  const account = findAccountByEmail(email)
  if (!account) {
    return res.status(200).json({ message: 'If the email is registered, a reset link has been sent.' })
  }

  account.resetToken = createId('reset')
  account.resetTokenExpiry = Date.now() + 1000 * 60 * 30

  return res.json({ message: 'Password reset token generated', resetToken: account.resetToken })
})

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and new password are required' })
  }

  const account = [...users, ...brokers, ...admins].find((item) => item.resetToken === token)
  if (!account || account.resetTokenExpiry < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired reset token' })
  }

  account.passwordHash = await bcrypt.hash(password, 10)
  account.resetToken = null
  account.resetTokenExpiry = null

  return res.json({ message: 'Password updated successfully' })
})

router.get('/me', authenticateToken, (req, res) => {
  const account = getAccount(req.user.role, req.user.id)
  if (!account) {
    return res.status(404).json({ message: 'Profile not found' })
  }
  return res.json(publicProfile(account))
})

export default router
