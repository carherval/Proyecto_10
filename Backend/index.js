const PORT = 3000

const meetings = require('express')()
const { eventRouter } = require('./src/api/routes/event')
const { userRouter } = require('./src/api/routes/user')
const { validation } = require('./src/utils/validation')
const { connectToDataBase } = require('./src/config/db')
const { connectToCloudinary } = require('./src/config/cloudinary')

// Permite al "backend" aceptar solicitudes del "frontend" cuando son dominios diferentes
meetings.use(require('cors')())

meetings.use('/event', eventRouter)
meetings.use('/user', userRouter)

// Gestión de ruta no encontrada
meetings.use((req, res, next) => {
  const error = new Error(
    `Ruta no encontrada${validation.LINE_BREAK}Comprueba la URL y sus parámetros`
  )

  error.status = 404

  next(error)
})

// Gestión de errores
meetings.use((error, req, res, next) => {
  console.log(
    `Error ${error.status}: ${error.message.replaceAll(
      validation.LINE_BREAK,
      validation.CONSOLE_LINE_BREAK
    )}`
  )

  return res.status(error.status).send(error.message)
})

meetings.listen(PORT, async () => {
  console.log(`Servidor express ejecutándose en "http://localhost:${PORT}"`)

  await connectToDataBase()
  connectToCloudinary()
})
