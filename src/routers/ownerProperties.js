const express = require('express')
const Property = require('../models/property')
const auth = require('../middleware/auth')
const router = express.Router()

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
        res.send(req.user.properties)
    } catch (e) {
        res.status(500).send(e)
    }

})

router.get('/propietario/inmuebles', auth, async (req, res) => {

    try {
        await req.user.populate('properties').execPopulate()
        res.send(req.user.properties)
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


router.post('/propietario/inmueble', auth, async (req, res) => {
    
    const propertyData = new Property({
        ...req.body,
        owner: req.user._id
    })

    try {
        await propertyData.save()
        res.status(201).send(propertyData)

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