const app = require('./app')
const port = process.env.PORT 
const http = require('http')
const socketio = require('socket.io')
const { generateMessage, generateLocationMessage } = require('./utils/messages')

const server = http.createServer(app)
const io = socketio(server) 

io.on('connection', (socket) => {
    console.log('new webSocket connection')

    socket.emit('message', generateMessage('Biendenid@ al chat de TuInmueble'))
    socket.broadcast.emit('message', generateMessage('Un nuevo usuario se a unido a la sala de chat'))

    socket.on('sendMessage', (message, callback) => {
        io.emit('message', generateMessage(message))
        callback('Enviado!')
    })

    socket.on('sendLocation', (location, callback) => {
        io.emit('locationMessage', generateLocationMessage(`http://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback()
    })


    socket.on('disconnect', () => {
        io.emit('message', generateMessage('Un usuario ha salido de la sala de chat'))
    })
  
})

server.listen(port, () => {
    console.log('Server is up on port ' + port)
})
