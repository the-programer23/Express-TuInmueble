const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user')
const Property = require('../../src/models/property')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'Fabian',
    lastName: 'Pinzon',
    citizenCardId: '1098671381', 
    email: 'nfabian.pm@gmail.com',
    phoneNumber: 3167171908,
    password: '052312fab',
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
} 

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    name: 'Zoila',
    lastName: 'Mejia',
    citizenCardId: '63325725', 
    email: 'rosapatricia333@hotmail.com',
    phoneNumber: 6463531,
    password: 'zoilapassword!',
    tokens: [{
        token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }]
} 

const propertyOne = {
    _id: new mongoose.Types.ObjectId(),
    realStateType: 'apartamento1',
    address: 'Test Address1',
    city: 'Test City1',
    country: 'Test Country1',
    rentCost: 1000000,
    owner: userOne._id
}

const propertyTwo = {
    _id: new mongoose.Types.ObjectId(),
    realStateType: 'apartamento2',
    address: 'Test Address2',
    city: 'Test City2',
    country: 'Test Country2',
    rentCost: 1000000,
    owner: userOne._id
}

const propertyThree = {
    _id: new mongoose.Types.ObjectId(),
    realStateType: 'apartamento3',
    address: 'Test Address3',
    city: 'Test City3',
    country: 'Test Country3',
    rentCost: 1000000,
    owner: userTwo._id
}

const setupDatabase = async () => {
    await User.deleteMany()
    await Property.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Property(propertyOne).save()
    await new Property(propertyTwo).save()
    await new Property(propertyThree).save()
    
}

module.exports = {
    userOneId,
    userOne,
    userTwo,
    userTwoId,
    propertyOne,
    setupDatabase
}