const express = require('express')
const User = require('../models/user')
const sharp = require('sharp')
const auth = require('../middleware/auth')
const multer = require('multer')
const cookieParser = require('cookie-parser')
const hbs = require('hbs')
const jwt = require('jsonwebtoken')
const { sendWelcomeEmail, cancelationEmail } = require('../emails/account')
const router = express.Router()
const path = require('path')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')
const app = express()

app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

// const bodyParser = require('body-parser')


router.use(express.urlencoded({ extended: true }))
router.use(cookieParser())

router.get('/', async (req, res) => {

    try{
        const token = req.cookies['auth_token']
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token})
        res.render('index', {
            currentUser: user
        })
    }catch {
        res.render('index')
    }
  
})


router.get('/users/miperfil', auth , async (req, res) => {
    // res.send(req.user)
    res.render('userProfile', {
        currentUser: req.user
    })
})

router.get('/users/chat', auth , (req, res) => {
    res.render('chat', {
        currentUser: req.user
    })
})

router.get('/register', (req, res) => {
    res.render('register') 
})

router.post('/register', async (req, res) => {

    const user = new User(req.body)
      
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name, user.lastName)
        const token = await user.generateAuthToken()
        res.cookie('auth_token', token)
        // res.sendFile(path.resolve(__dirname, '../../templates/', 'views', 'successfulRegister.hbs'))
        // res.status(201).send({ user, token})
        res.render('successfulRegister')
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/users/login', (req, res) => {
    res.render('login')
})

router.post('/users/login', async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.cookie('auth_token', token)
        // res.sendFile(path.resolve(__dirname, '../../templates/', 'views', 'index.hbs'))
        // res.send({ user, token })
        res.redirect('/')
        
    }catch(e) {
        res.status(400).send()
    }
})

router.get('/users/logout', auth , async (req, res) => {
    
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        
        await req.user.save()

        res.redirect('/')
    }catch(e){
        res.status(500).send()
    }
})

router.get('/users/logoutAll', auth, async (req, res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.redirect('/')
    }catch(e){
        res.status(500).send()
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)/)){
            cb(new Error('Por favor, sube una imagen con extensión jpg, jpeg o png'))
        }

        cb(undefined, true)
    }
})

router.post('/users/yo/avatar', auth , upload.single('avatar') , async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/yo/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try{
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)

    }catch(e) {
        res.status(404).send()
    }
})

router.patch('/users/yo', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'lastName', 'citizenCardId', 'email', 'phoneNumber', 'alternativePhoneNumber', 'password']
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if(!isValidOperation) {
        return res.status(400).send({Error: "Actualiación de datos invalida"})
    }

    try{
        updates.forEach((update) => req.user[update] = req.body[update] )
        await req.user.save()

        res.send(req.user)
    }catch(e) {
        res.status(400).send(e)
    }

})

router.delete('/users/yo', auth, async (req, res) => {
    try{
        await req.user.remove()
        cancelationEmail(req.user.email, req.user.name, req.user.lastName)
        res.send(req.user)
    }catch(e) {
        res.status(500).send()
    }
})



module.exports = router