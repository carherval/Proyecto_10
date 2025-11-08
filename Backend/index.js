const PORT = 3000

const express = require('express')
const meetings = express()
const { eventRouter } = require('./src/api/routes/event')
const { userRouter } = require('./src/api/routes/user')
const { getError } = require('./src/utils/error')
const { validation } = require('./src/utils/validation')
const { connectToDataBase } = require('./src/config/db')
const { connectToCloudinary } = require('./src/config/cloudinary')

meetings.use(express.json())
// Interpreta las solicitudes HTTP a través del "req.body" de las rutas
meetings.use(express.urlencoded({ extended: false }))
// Se suprimen "logs" innecesarios
require('dotenv').config({ quiet: true })
// Permite al "backend" aceptar solicitudes del "frontend" cuando son dominios diferentes
meetings.use(
  require('cors')({
    origin: process.env.FRONT_URL,
    methods: ['GET', 'DELETE', 'POST', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

meetings.use('/event', eventRouter)
meetings.use('/user', userRouter)

// Gestión de ruta no encontrada
meetings.use((req, res, next) =>
  next(
    getError(
      `Ruta no encontrada${validation.LINE_BREAK}Comprueba la URL y sus parámetros`,
      404
    )
  )
)

// Gestión de errores
meetings.use((error, req, res, next) => {
  console.log(
    `Error ${error.status}: ${error.message.replaceAll(
      validation.LINE_BREAK,
      validation.CONSOLE_LINE_BREAK
    )}`
  )

  return res.status(error.status).json({ msg: error.message })
})

meetings.listen(PORT, async () => {
  console.log(`Servidor express ejecutándose`)

  await connectToDataBase()
  connectToCloudinary()
})
