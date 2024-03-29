const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
const corsOptions = {
  origin: 'https://medical-pager-app2.vercel.app/', // Replace with the actual origin of your React app
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

const authRoutes = require('./routes/auth.js')

const PORT = process.env.PORT || 5000

require('dotenv').config()

const path = require('path')

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID
const twilioClient = require('twilio')(accountSid, authToken)

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.send('Hello, World!')
})

app.post('/', (req, res) => {
  const { message, user: sender, type, members } = req.body

  if (type === 'message.new') {
    members
      .filter((member) => member.user_id !== sender.id)
      .forEach(({ user }) => {
        if (!user.online) {
          twilioClient.messages
            .create({
              body: `You have a new message from ${message.user.fullName} - ${message.text}`,
              messagingServiceSid: messagingServiceSid,
              to: user.phoneNumber,
            })
            .then(() => console.log('Message sent!'))
            .catch((err) => console.log(err))
        }
      })

    return res.status(200).send('Message sent!')
  }
  return res.status(200).send('Not a new message request')
})

app.use('/auth', authRoutes)

app.get('/', (req, res) => {
  app.use(express.static(path.resolve(__dirname, 'client', 'build')))
  res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
