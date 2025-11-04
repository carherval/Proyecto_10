const MIN_YEAR = 2025
const PASSWORD_MIN_LENGTH = 8

const MANDATORY_MSG = 'El campo es obligatorio y no puede estar vacío'
const UNIQUE_MSG = 'El campo no puede estar repetido'
const ALLOWED_VALUES_MSG = 'Valores permitidos'
const DATE_FORMAT_MSG = 'Formato correcto: dd/mm/yyyy'
const TIME_FORMAT_MSG = 'Formato correcto: hh:mm'
const INVALID_YEAR_MSG = `El año debe ser a partir de ${MIN_YEAR}`
const INVALID_DATE_MSG = 'Fecha no válida'
const INVALID_TIME_MSG = 'Hora no válida'
const INVALID_PASSWORD_MSG = `La contraseña tiene que estar formada por letras y números y tener una longitud mínima de ${PASSWORD_MIN_LENGTH}`
const INVALID_EMAIL_MSG = 'Correo electrónico no válido'
const INVALID_ID_MSG = 'Identificador no válido'

const ENDPOINT_ACCESS_ERROR_MSG =
  'Se ha producido un error al acceder al "endpoint"'
const USER_DOES_NOT_EXIST_MSG = 'Alguno de los usuarios no existe'

const LINE_BREAK = '<br /><br />'
const CONSOLE_LINE_BREAK = '\n'

const getLoginMsg = (role = '') =>
  `Debes iniciar sesión${role !== '' ? ` como "${role}"` : ''}`

const getNotAllowedActionMsg = (reasonMsg) =>
  `No tienes permisos para realizar la acción solicitada: ${reasonMsg}`

const getEventNotFoundByIdMsg = (id) =>
  `No se ha encontrado ningún evento con el identificador "${id}"`

const isNotEmptyArray = (array) => array != null && array.length > 0

const isFormattedDate = (date) => /^\d{2}\/\d{2}\/\d{4}$/.test(date)

const isFormattedTime = (time) => /^\d{2}:\d{2}$/.test(time)

const isValidYear = (year) => year >= MIN_YEAR

const isValidDateYear = (date) => {
  const [day, month, year] = date.split('/').map((value) => parseInt(value, 10))

  return isValidYear(year)
}

const isLeapYear = (year) =>
  year % 400 === 0 ? true : year % 100 === 0 ? false : year % 4 === 0

const isValidDate = (date) => {
  const [day, month, year] = date.split('/').map((value) => parseInt(value, 10))

  return month === 2 && (day <= 28 || (day === 29 && isLeapYear(year)))
    ? true
    : day <= 30 && month <= 12 && month !== 2
    ? true
    : day === 31 && [1, 3, 5, 7, 8, 10, 12].includes(month)
    ? true
    : false
}

const isValidTime = (time) => {
  const [hour, minute] = time.split(':').map((value) => parseInt(value, 10))

  return hour <= 23 && minute <= 59
}

const isPassword = (password) =>
  new RegExp(`^[a-zñA-ZÑ\\d]{${PASSWORD_MIN_LENGTH},}$`).test(password)

const isEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

// Devuelve los valores de un objeto en forma de cadena separados por un separador
const getObjectValues = (object, separator = ' - ') =>
  Object.values(object).join(separator)

const getDateAndTimeString = (date, time = '') => {
  const [day, month, year] = date.split('/')
  const [hour, minute] = time !== '' ? time.split(':') : ['', '']

  return `${year}${month}${day}${hour}${minute}`
}

const sortEvents = (event1, event2, field = 'title', order = 'asc') => {
  // Ordena los eventos alfabéticamente por título ignorando tildes, minúsculas y mayúsculas, ascendentemente o descendentemente
  if (field === 'title') {
    return order === 'asc'
      ? event1.title.localeCompare(event2.title, 'en', { sensitivity: 'base' })
      : order === 'desc'
      ? event2.title.localeCompare(event1.title, 'en', { sensitivity: 'base' })
      : 0
  }

  // Ordena los eventos por fecha, ascendentemente o descendentemente
  if (field === 'date') {
    return order === 'asc'
      ? getDateAndTimeString(event1.date, event1.time).localeCompare(
          getDateAndTimeString(event2.date, event2.time)
        )
      : order === 'desc'
      ? getDateAndTimeString(event2.date, event2.time).localeCompare(
          getDateAndTimeString(event1.date, event1.time)
        )
      : 0
  }

  return 0
}

// Ordena los usuarios alfabéticamente por apellidos y nombre ignorando tildes, minúsculas y mayúsculas
const sortUsers = (user1, user2) =>
  `${user1.surnames}, ${user1.name} (${user1.username})`.localeCompare(
    `${user2.surnames}, ${user2.name} (${user2.username})`,
    'en',
    { sensitivity: 'base' }
  )

const usersExist = async (users) => {
  const { User } = require('../api/models/user')

  for (const id of users) {
    if ((await User.findById(id)) == null) {
      return false
    }
  }

  return true
}

// Elimina espacios innecesarios y normaliza signos de puntuación
const normalizeString = (string) =>
  string
    .replace(/[.,:-]/g, '$& ')
    .replace(/\s+/g, ' ')
    .replace(/\s[.,:-]/g, (match) => match.trim())
    .trim()

// Elimina el formato de la expresión regular "/[cadenaBusqueda]/i" (al llamar a "getIgnoreAccentCaseText") y lo pasa a minúsculas
const normalizeSearchString = (searchString) =>
  searchString.toString().slice(1).slice(0, -2).toLowerCase()

// Elimina espacios, tildes y lo pasa a minúsculas
const normalizeUserName = (username) =>
  username
    .replace(/\s/g, '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

// Permite la entrada de datos en un modelo para un campo de tipo array mediante una cadena separada por comas
const normalizeArray = (array) =>
  array
    .toString()
    .split(',')
    .map((elem) => elem.trim())

const removeDuplicates = (array) =>
  Array.from(new Set(array.map((elem) => elem.toString())))

// Devuelve una expresión regular ignorando tildes, minúsculas y mayúsculas
const getIgnoreAccentCaseText = (string) =>
  new RegExp(string.normalize('NFD').replace(/\p{Diacritic}/gu, ''), 'i')

const formatErrorMsg = (msg) =>
  msg.replaceAll("', '", "','").replaceAll(', ', LINE_BREAK)

const validation = {
  MIN_YEAR,
  PASSWORD_MIN_LENGTH,
  MANDATORY_MSG,
  UNIQUE_MSG,
  ALLOWED_VALUES_MSG,
  DATE_FORMAT_MSG,
  TIME_FORMAT_MSG,
  INVALID_YEAR_MSG,
  INVALID_DATE_MSG,
  INVALID_TIME_MSG,
  INVALID_PASSWORD_MSG,
  INVALID_EMAIL_MSG,
  INVALID_ID_MSG,
  ENDPOINT_ACCESS_ERROR_MSG,
  USER_DOES_NOT_EXIST_MSG,
  LINE_BREAK,
  CONSOLE_LINE_BREAK,
  getLoginMsg,
  getNotAllowedActionMsg,
  getEventNotFoundByIdMsg,
  isNotEmptyArray,
  isFormattedDate,
  isFormattedTime,
  isValidYear,
  isValidDateYear,
  isLeapYear,
  isValidDate,
  isValidTime,
  isPassword,
  isEmail,
  getObjectValues,
  getDateAndTimeString,
  sortEvents,
  sortUsers,
  usersExist,
  normalizeString,
  normalizeSearchString,
  normalizeUserName,
  normalizeArray,
  removeDuplicates,
  getIgnoreAccentCaseText,
  formatErrorMsg
}

module.exports = { validation }
