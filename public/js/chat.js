const socket = io()
//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')


const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-message-template').innerHTML

socket.on('message', (message) => {
    
    Mustache.tags = ["[[", "]]"];

    Mustache.parse(messageTemplate)
    var rendered = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });

    $messages.insertAdjacentHTML('beforeend' , rendered)

})

socket.on('locationMessage', (generateLocationMessage) => {
    Mustache.tags = ["[[","]]"]

    Mustache.parse(locationTemplate)
    var rendered = Mustache.render(locationTemplate, {
        url: generateLocationMessage.url,
        createdAt: moment(generateLocationMessage.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', rendered)
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (message) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        console.log('El mensaje fue enviado!' + ' ' + message)
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocalización no es compatible con su navegador')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log('Ubicación compartida!')
            $sendLocationButton.removeAttribute('disabled')
        })
    })

})

