const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    realStateType: {
        type: String,
        required: true,
        lowercase: true
    },
    address: {
        type: String,
        required: true
    }, 
    neighborhoodName: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true  
    },
    country: {
        type: String,
        required: true

    },
    rentCost: {
        type: Number,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
    
}, {
    timestamps: true
})

const Property = mongoose.model('Property', propertySchema)





module.exports = Property