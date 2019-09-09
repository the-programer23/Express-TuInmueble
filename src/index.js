const express = require('express')
const hbs = require('hbs')
const path = require('path')
const userRouter = require('./routers/user')
const ownerPropertiesRouter = require('./routers/ownerProperties')
require('./db/mongoose')

const app = express()
const port = process.env.PORT 

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

app.get('/arrendatario', (req, res) => {
    res.render('arrendatario')
})

app.get('/inmobiliaria', (req, res) => {
    res.render('inmobiliaria')
})

app.get('/propietario', (req, res) => {
    res.render('propietario')
})

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})
