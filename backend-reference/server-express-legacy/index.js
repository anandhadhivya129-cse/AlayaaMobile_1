import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import propertiesRoutes from './routes/properties.js'
import adminRoutes from './routes/admin.js'
import brokerRoutes from './routes/broker.js'
import userRoutes from './routes/user.js'

const app = express()
app.use(cors({
  origin: /^http:\/\/localhost:\d+$/,
  credentials: true
}))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/properties', propertiesRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/broker', brokerRoutes)
app.use('/api/user', userRoutes)

app.get('/api/status', (req, res) => res.json({ status: 'ok', version: '1.0.0' }))

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`Real estate API listening on port ${port}`)
})
