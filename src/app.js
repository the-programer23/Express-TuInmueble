const express = require('express')
const hbs = require('hbs')
const path = require('path')
const userRouter = require('./routers/user')
const ownerPropertiesRouter = require('./routers/ownerProperties')
const auth = require('../src/middleware/auth')
require('./db/mongoose')

const app = express()

const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

app.use(express.static(publicDirectoryPath))
app.use(express.json())
app.use(userRouter)
app.use(ownerPropertiesRouter)


app.get('/arrendatario', auth , (req, res) => {
    res.render('arrendatario', {
        currentUser: req.user
    })
})

app.get('/inmobiliaria', auth , (req, res) => {
    res.render('inmobiliaria', {
        currentUser: req.user
    })
})

app.get('/propietario', auth , async (req, res) => {
    res.render('propietario', {
        currentUser: await req.user
    })
})

module.exports = app