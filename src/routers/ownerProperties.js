const express = require('express')
const Property = require('../models/property')
const auth = require('../middleware/auth')
const fs = require('fs')
const router = express.Router()
const url = require('url')
const hbs = require('hbs')
const path = require('path')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')
const app = express()

app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

const replaceTemplate = (temp, property) => {
    let output = temp.replace(/{%ADDRESS%}/g, property.address);
    output = output.replace(/{%RENTCOST%}/g, property.rentCost);
    output = output.replace(/{%ID%}/g, property._id)
    output = output.replace(/{%NEIGHBORHOOD%}/g, property.neighborhoodName);
    output = output.replace(/{%REALSTATETYPE%}/g, property.realStateType);

    return output
}

const tempProperties = fs.readFileSync('./templates/views/inmuebles.hbs', 'utf-8');
const tempPropertyCards = fs.readFileSync('./templates/views/propertyCards.hbs', 'utf-8');

router.get('/inmuebles', auth, async (req, res) => {
   
    // const match = {}
    // const sort = {}
    
    
    // if(req.query.realStateType === 'casa'){
    //     match.realStateType = 'casa'
    // } else if(req.query.realStateType === 'cabaña'){
    //     match.realStateType = 'cabaña'
    // }else if(req.query.realStateType === 'apartamento'){
    //     match.realStateType = 'apartamento'
    // }else if(req.query.realStateType === 'apartaestudio'){
    //     match.realStateType = 'apartaestudio'
    // }else if(req.query.realStateType === 'local'){
    //     match.realStateType = 'local'
    // }else if(req.query.realStateType === 'deposito'){
    //     match.realStateType = 'deposito'
    // }
    

    // if(req.query.sortBy){
    //     const parts = req.query.sortBy.split(':')
    //     sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
        
    // }

    // try {
    //     await req.user.populate({
    //         path:'properties',
    //         match,
    //         options: {
    //             limit: parseInt(req.query.limit),
    //             skip: parseInt(req.query.skip),
    //             sort
    //         }   
    //     }).execPopulate()
        
        const propertiesObj =  await Property.find({})
        const propertyCards = propertiesObj.map(el => replaceTemplate(tempPropertyCards, el)).join('')
        const output = tempProperties.replace('{%PROPERTY_CARDS%}', propertyCards)
        res.writeHead(200, { 'Content-type': 'text/html'});
        res.end(output, {
            currentUser: req.user
        })
})

     
router.get('/inmuebles/ver', auth, async (req, res) => {

    const propertiesObj =  await Property.find({})
    const { query, pathname } = url.parse(req.url, true)
    console.log(propertiesObj)
    // const property = propertiesObj[]

})

router.get('/propietario/inmuebles', auth, async (req, res) => {

    try {
        await req.user.populate('properties').execPopulate()
        const realStateTypeLower = await req.user.properties[0].realStateType
        const upper = realStateTypeLower.replace(/^\w/, c => c.toUpperCase());
    
        res.render('ownerProperties', {
             ownerProperties: await req.user.properties[0],
             realStateType: upper,
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
        res.redirect('/propietario/inmuebles')

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