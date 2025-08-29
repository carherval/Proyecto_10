const jwt = require('jsonwebtoken')
// Se suprimen "logs" innecesarios
require('dotenv').config({ quiet: true })

// Devuelve un token generado mediante la clave secreta
const getJwtToken = (id, userName) =>
  jwt.sign({ id, userName }, process.env.SECRET_KEY, {
    expiresIn: '15m'
  })

// Devuelve un token decodificado validándolo mediante la clave secreta
const getDecodedToken = (token) => jwt.verify(token, process.env.SECRET_KEY)

module.exports = { getJwtToken, getDecodedToken }
