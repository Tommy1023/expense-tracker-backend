const router = require('express').Router()
const passport = require('passport')


router.get('/login/failed', (req, res) => {
  res.status(401).json({ success: false, messages: "failure" })
})
router.get('/login/success', (req, res) => {
  delete req.user.password
  if (req.user) {
    return res.status(200).json({
      success: true,
      messages: "success",
      user: req.user
    })
  }
})

router.get('/logout', (req, res, next) => {
  if (req.user) {
    req.logout((err) => {
      if (err) return next(err)
    })
    res.status(200).json({ status: 'success', messages: 'Logout success!' })
  }
})

router.get('/line', passport.authenticate('line', { scope: ['profile', 'openid', 'email'] }))

router.get('/line/callback',
  passport.authenticate('line', { failureRedirect: `${process.env.CLIENT_URL}/expense-tracker/user/login` }), (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/expense-tracker`)
  })

module.exports = router