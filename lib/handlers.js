const fortune = require('./fortune.js')
const pathUtils = require('path')
const { promisify } = require('util')
const fs = require('fs')
const db = require('../db')

const dataDir = pathUtils.resolve(__dirname, '..', 'data')
const vacationPhotosDir = pathUtils.join(dataDir, 'vacation-photos')

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir)
if (!fs.existsSync(vacationPhotosDir)) fs.mkdirSync(vacationPhotosDir)

function saveContestEntry (contestName, email, year, month, photoPath) {
  // TODO later
}

const mkdir = promisify(fs.mkdir)
const rename = promisify(fs.rename)

const api = {}
api.vacationPhotoContest = async (req, res, fields, files) => {
  const photo = files.photo[0]
  const dir = vacationPhotosDir + '/' + Date.now()
  const path = dir + '/' + photo.originalFileName
  await mkdir(dir)
  await rename(photo.path, path)
  saveContestEntry(
    'vacation-photo',
    fields.email,
    req.params.year,
    req.params.month,
    path
  )
  res.send({ result: 'success' })
}

exports.api = api

exports.listVacations = async (req, res) => {
  // const vacations = await db.getVacations({ available: true })
  const vacations = await db.getVacations({ })
  const context = {
    vacations: vacations.map((vacation) => ({
      sku: vacation.sku,
      name: vacation.name,
      description: vacation.description,
      price: '$' + vacation.price.toFixed(2),
      inSeason: vacation.inSeason
    }))
  }
  res.render('vacations', context)
}

exports.home = (req, res) => res.render('home')

exports.about = (req, res) => res.render('about', { fortune: fortune.getFortune() })

exports.notFound = (req, res) => res.render('404')

// eslint-disable-next-line handle-callback-err
exports.serverError = (err, req, res, next) => {
  console.error(err.message, err.stack)
  res.render('500', { message: err.message })
}
