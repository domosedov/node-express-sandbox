const fortune = require('./fortune.js')

exports.home = (req, res) => res.render('home')

exports.about = (req, res) => res.render('about', { fortune: fortune.getFortune() })

exports.notFound = (req, res) => res.render('404')

// eslint-disable-next-line handle-callback-err
exports.serverError = (err, req, res, next) => {
  console.error(err.message, err.stack)
  res.render('500', { message: err.message })
}
