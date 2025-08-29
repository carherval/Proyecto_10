const connectToCloudinary = () => {
  // Se suprimen "logs" innecesarios
  require('dotenv').config({ quiet: true })

  try {
    console.log('Conectándose con "Cloudinary"...')

    require('cloudinary').v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    })

    console.log('Conexión con "Cloudinary" realizada correctamente')
  } catch (error) {
    const { validation } = require('../utils/validation')

    console.log(
      `Se ha producido un error al conectar con "Cloudinary":${validation.CONSOLE_LINE_BREAK}${error.message}`
    )
  }
}

module.exports = { connectToCloudinary }
