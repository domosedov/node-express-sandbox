const path = require('path')
const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')
const { credentials } = require('./config')
const flashMiddleware = require('./lib/middleware/flash')
const morgan = require('morgan')
const fs = require('fs')
const cluster = require('cluster')
const handlers = require('./lib/handlers.js')
require('./db')

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION\n', err.stack)
  // do any cleanup you need to do here...close
  // database connections, etc.
  process.exit(1)
})

// initial App
const app = express()

app.use((req, res, next) => {
  if (cluster.isWorker) { console.log(`Worker ${cluster.worker.id} received request`) }
  next()
})

// Morgan logger
switch (app.get('env')) {
  case 'development':
    app.use(morgan('dev'))
    break
  case 'production': {
    const stream = fs.createWriteStream(path.resolve(__dirname, 'access.log'), {
      flags: 'a'
    })
    app.use(morgan('combined', { stream }))
    break
  }
}

// handlebars
app.engine('.hbs', expressHandlebars({
  defaultLayout: 'main.hbs',
  extname: '.hbs'
}))
app.set('view engine', '.hbs')

// cookies and session
app.use(cookieParser(credentials.cookieSecret))
app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: credentials.cookieSecret
}))

// public folder
app.use(express.static(path.join(__dirname, 'public')))

// body parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// flash middleware
app.use(flashMiddleware)

// Routes
app.get('/fail', (req, res) => {
  throw new Error('Nope!')
})
app.get('/epic-fail', (req, res) => {
  process.nextTick(() => { throw new Error('Kaboom!') })
})

app.get('/', handlers.home)
app.get('/about', handlers.about)
app.get('/vacations', handlers.listVacations)
app.post('/test-post', (req, res) => {
  // eslint-disable-next-line no-useless-escape
  const VALID_EMAIL_REGEX = new RegExp('^[a-zA-Z0-9.!#$%&\'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$')
  const email = req.body.email

  if (!VALID_EMAIL_REGEX.test(email)) {
    req.session.flash = {
      message: 'You pidor, INPUT VALID EMAIL!!!'
    }
    res.redirect(303, '/')
  }

  const { body } = req
  res.json(body)
})

app.get('/cookie', (req, res) => {
  res.cookie('hello', 'world')
  res.cookie('signed_monster', 'nom nom', { signed: true })
  req.session.userName = 'Anonymous'
  req.session.color = 'blue'
  // const userName = req.session.userName
  // const colorScheme = req.session.colorScheme || 'dark'
  // const { cookies, signedCookies } = req
  res.json(req.session)
})

app.get('/headers', (req, res) => {
  res.type('text/plain')
  const headers = Object.entries(req.headers)
    .map(([key, value]) => `${key}: ${value}`)
  res.send(headers.join('\n'))
})

app.get('/json', (req, res) => {
  res.type('text/plain')
  res.send(JSON.stringify({ hello: 1 }))
})

// handle 404 error
app.use(handlers.notFound)
// handle 500 error
app.use(handlers.serverError)

// start server
function startServer (port) {
  app.listen(port, function () {
    console.log(`Express started in ${app.get('env')} ` +
      `mode on http://localhost:${port}` +
      '; press Ctrl-C to terminate.')
  })
}

if (require.main === module) {
  // application run directly; start app server
  startServer(process.env.PORT || 3000)
} else {
  // application imported as a module via "require": export
  // function to create server
  module.exports = startServer
}
