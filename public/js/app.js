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


app.get('/', (req, res) => {
    Mustache.tags = ["[[", "]]"];
    Mustache.render({
        currentUser: req.user
    });
    res.render('index')
})