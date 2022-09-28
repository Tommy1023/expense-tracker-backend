const express = require('express')
const cors = require('cors')
const passport = require('passport')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const app = express()
const PORT = process.env.PORT
const api = require('./routers/index')

const corsOptions = {
  origin: [
    'http://localhost:3001',
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions))
app.use(express.urlencoded({ extended: true })) 
app.use(express.json()) 
app.use(passport.initialize())
app.use('/api', api)

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`)
})