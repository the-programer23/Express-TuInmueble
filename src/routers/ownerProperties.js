const express = require('express')
const Property = require('../models/property')
const auth = require('../middleware/auth')
const router = express.Router()

const hbs = require('hbs')
const path = require('path')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')
const app = express()

app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)


router.get('/inmuebles', auth, async (req, res) => {
   
    const match = {}
    const sort = {}

    if(req.query.realStateType === 'casa'){
        match.realStateType = 'casa'
    } else if(req.query.realStateType === 'cabaña'){
        match.realStateType = 'cabaña'
    }else if(req.query.realStateType === 'apartamento'){
        match.realStateType = 'apartamento'
    }else if(req.query.realStateType === 'apartaestudio'){
        match.realStateType = 'apartaestudio'
    }else if(req.query.realStateType === 'local'){
        match.realStateType = 'local'
    }else if(req.query.realStateType === 'deposito'){
        match.realStateType = 'deposito'
    }
    console.log(req.query.sortBy)

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        console.log(parts)

        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
        console.log(sort)
    }

    try {
        await req.user.populate({
            path:'properties',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        // res.send(req.user.properties)
        res.render('inmuebles', {
            currentUser: req.user
        })
    } catch (e) {
        res.status(500).send(e)
    }

})

router.get('/propietario/inmuebles', auth, async (req, res) => {

    try {
        await req.user.populate('properties').execPopulate()
        
        res.render('ownerProperties', {
             ownerProperties: await req.user.properties[0],
             currentUser: await req.user
            
        })
      
    } catch (e) {
        res.status(500).send(e)
    }

})

router.get('/propietario/inmuebles/:id', auth, async (req, res) => {
    const _id = req.params.id
    try{
       const property = await Property.findOne({_id, owner: req.user._id})
       if(!property){
           return res.status(404).send()
       }
        res.send(property)
    }catch(e) {
        res.status(500).send()
    }
})

router.get('/propietario/agregarInmueble', auth, (req, res) => {
    res.render('addProperty', {
        currentUser: req.user
    })
})

router.post('/propietario/agregarInmueble', auth, async (req, res) => {
    
    const propertyData = new Property({
        ...req.body,
        owner: req.user._id
    })

    try {
        await propertyData.save()
        res.status(201).render('ownerProperties')

    } catch (e) {
        res.status(400).send(e)
    }

})

router.patch('/propietario/immuebles/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['realStateType', 'address', 'city', 'country', 'rentCost']
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if(!isValidOperation){
        return res.status(400).send({error: "Actualiación de datos invalida"})
    }

    try{
        
        const property = await Property.findOne({_id: req.params.id, owner: req.user._id})

        if(!property){
            return res.status(404).send()
        }
        updates.forEach((update) => {
            property[update] = req.body[update]
        })
        await property.save()
        res.send(property)

    }catch(e){
        res.status(400).send(e)
    }

})

router.delete('/propietario/inmuebles/:id', auth, async (req, res) => {
    try{
        const property = await Property.findOneAndDelete({ _id:req.params.id, owner:req.user._id})
        if(!property){
            return res.status(404).send()
        }
        res.send(property)
    }catch(e){
        res.status(500).send()
    }
})

module.exports = router