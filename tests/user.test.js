const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOne, userOneId, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

test('should sign up a new user', async () => {
    const response = await request(app)
    .post('/users')
    .send({
        name: 'Nestor',
        lastName: 'Sanchez',
        citizenCardId: 91208520,
        email: 'nfabian.pm1@gmail.com',
        phoneNumber: 3153845554,
        password: 'myPassword123!'
    })
    .expect(201)
    //Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Nestor',
            email: 'nfabian.pm1@gmail.com'
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('myPassword123!')
})

test('should login an existing user', async () => {
   const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password 
    }).expect(200)
    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
    
})

test('should not login an existing user', async () => {
    await request(app).post('/users/login').send({
        email: 'nfabian.pm3@gmail.com',
        password: 'wrongPassword123'
    }).expect(400)
})

test('should get profile for user', async () => {
    await request(app)
    .get('/users/miperfil')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('should not get profile for unauthenticated user', async () => {
    await request(app)
    .get('/users/miperfil')
    .send()
    .expect(401)
})

test('should delete account for user', async () => {
    await request(app)
    .delete('/users/yo')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('should not delete account for unauthenticated user', async () => {
    await request(app)
    .delete('/users/yo')
    .send()
    .expect(401)
})

test('should upload avatar image', async () => {
    await request(app)
    .post('/users/yo/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200)
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('should update valid user fields', async () => {
    await request(app)
    .patch('/users/yo')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        name: 'Jess'
    })
    .expect(200)
    const user = await User.findById(userOneId)
    expect(user.name).toEqual('Jess')
})

test('should not update invalid user fields', async () => {
    await request(app)
    .patch('/users/yo')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        location: 'Boston'
    })
    .expect(400)
})