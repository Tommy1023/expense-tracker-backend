const express = require('express')
const session = require('express-session')
const cors = require('cors')
const passport = require('passport')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const app = express()
const PORT = process.env.PORT || "8080"
const api = require('./routers/index')

const corsOptions = {
  origin: process.env.CLIENT_URL,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // One week
  }
}))
app.use(passport.initialize())
app.use(passport.session())

app.use('/api', api)

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`)
})