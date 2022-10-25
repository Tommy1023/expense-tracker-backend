const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const JWTStrategy = require('passport-jwt').Strategy
const ExtractJWT = require('passport-jwt').ExtractJwt
const LineStrategy = require('passport-line').Strategy
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const { User, Record, RecordedProduct, Location } = require('../models')

passport.use(new LocalStrategy({ usernameField: 'email', passReqToCallback: true }, (req, email, password, cb) => {
  User.findOne({
    where: { email },
    include: [
      { model: Record, order: [['date', 'DESC']], include: [Location, RecordedProduct] }
    ]
  })
    .then(user => {
      if (!user) return cb(null, false, { status: 'error', message: 'email錯誤或尚未註冊!' })
      bcrypt.compare(password, user.password).then(result => {
        if (!result) return cb(null, false, { status: 'error', message: 'email或密碼錯誤!' })
        req.user = user
        return cb(null, user)
      })
    })
}))

const jwtOptions = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  passReqToCallback: true
}

passport.use(new JWTStrategy(jwtOptions, (req, jwtPayload, cb) => {
  User.findByPk(jwtPayload.id, {
    include: [
      { model: Record, order: [['date', 'DESC']], include: [Location, RecordedProduct] }
    ]
  })
    .then(user => {
      req.user = user
      cb(null, user)
    })
    .catch(err => cb(err))
}))

passport.use(new LineStrategy({
  channelID: process.env.LINE_CHANNEL_ID,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  callbackURL: process.env.LINE_CALLBACK,
},
  async (accessToken, refreshToken, openid, profile, cb) => {
    try {
      const { name, email } = jwt.decode(openid.id_token)
      const userByLineId = await User.findOne({ where: { lineId: profile.id } })
      if (userByLineId) return cb(null, userByLineId)
      const userByEmail = await User.findOne({ where: { email } })
      if (userByEmail) return cb('Your Email has been registered', false)
      const hash = await bcrypt.hash(Math.random().toString(36).slice(-8), 10)
      const newUser = await User.create({
        name,
        email,
        password: hash,
        lineId: profile.id
      })
      if (newUser) return cb(null, newUser)
      cb('Create user fail', false)
    } catch (err) {
      cb(err, false)
    }
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user.lineId)
})
passport.deserializeUser((lineId, cb) => {
  User.findOne({
    where: { lineId },
    include: [
      {
        model: Record,
        order: [['date', 'DESC']],
        include: [Location, RecordedProduct]
      }
    ]
  })
    .then(user => cb(null, user.toJSON()))
    .catch(err => cb(err, null))
})

module.exports = passport