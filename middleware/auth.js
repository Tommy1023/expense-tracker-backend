const passport = require('../config/passport')

const loginAuthenticated = (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) return res.status(400).json(info)
    next()
  })(req, res, next)
}

const authenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next()
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) return res.status(401).json({ status: 'error', message: 'Unauthorized!' })
    next()
  })(req, res, next)
}

const authenticatedAdmin = (req, res, next) => {
  if (req.user.isAdmin) return next()
  return res.status(403).json({ status: 'error', message: 'permission denied!' })
}

module.exports = {
  loginAuthenticated,
  authenticated,
  authenticatedAdmin
}