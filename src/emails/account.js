const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name, lastName) => {
    sgMail.send({
        to: email,
        from: 'nfabian.pm@gmail.com',
        subject: 'Gracias por registrate en Tu Inmueble',
        text: `Hola ${name} ${lastName}, bienvenido a la app Tu Inmueble. Hazme saber como te pareció la app.`
    })
}

const cancelationEmail = (email, name, lastName) => {
    sgMail.send({
        to: email,
        from: 'nfabian.pm@gmail.com',
        subject: `Lamentamos que te vayas de Tu Inmueble`,
        text: `Adios, ${name} ${lastName}. Esperamos que regresas a Tu Inmueble`
    })
}

module.exports = {
    sendWelcomeEmail,
    cancelationEmail
}