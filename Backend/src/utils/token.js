// Minutos
const EXPIRATION_TIME = 15

const jwt = require('jsonwebtoken')
// Se suprimen "logs" innecesarios
require('dotenv').config({ quiet: true })

// Devuelve un token generado mediante la clave secreta
const getJwtToken = (id, username) =>
  jwt.sign({ id, username }, process.env.SECRET_KEY, {
    expiresIn: `${EXPIRATION_TIME}m`
  })

// Devuelve un token decodificado validándolo mediante la clave secreta
const getDecodedToken = (token) => jwt.verify(token, process.env.SECRET_KEY)

module.exports = { getJwtToken, getDecodedToken }
