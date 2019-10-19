const request = require('supertest')
const app = require('../src/app')
const Property = require('../src/models/property')

const { userOne, userOneId, userTwo, userTwoId, propertyOne, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

test('should create a property for user', async () => {
    const response = await request(app)
    .post('/propietario/inmueble')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        realStateType: 'apartamento',
        address: 'Test Address',
        city: 'Test City',
        country: 'Test Country',
        rentCost: 100000
        
    })
    .expect(201)
    const property = await Property.findById(response.body._id)
    expect(property).not.toBeNull()
})

test('should fetch user properties', async () => {
    const response = await request(app)
    .get('/propietario/inmuebles')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
    expect(response.body.length).toEqual(2)
    
})

test('should not delete other user properties', async () => {
     await request(app)
    .delete('/propietario/inmuebles/' + propertyOne._id)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404)
    const property = await Property.findById(propertyOne._id)
    expect(property).not.toBeNull()
})