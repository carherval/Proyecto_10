const EVENT_COLLECTION_NAME = 'event'

const mongoose = require('mongoose')
const { USER_COLLECTION_NAME } = require('./user')
const { validation } = require('../../utils/validation')

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, validation.MANDATORY_MSG],
      unique: [true, `title: ${validation.UNIQUE_MSG}`]
    },
    poster: {
      type: String,
      trim: true,
      default: ''
    },
    date: {
      type: String,
      trim: true,
      required: [true, validation.MANDATORY_MSG],
      validate: [
        {
          validator: validation.isFormattedDate,
          message: validation.DATE_FORMAT_MSG
        },
        {
          validator: validation.isValidDateYear,
          message: validation.INVALID_YEAR_MSG
        },
        {
          validator: validation.isValidDate,
          message: validation.INVALID_DATE_MSG
        }
      ]
    },
    time: {
      type: String,
      trim: true,
      required: [true, validation.MANDATORY_MSG],
      validate: [
        {
          validator: validation.isFormattedTime,
          message: validation.TIME_FORMAT_MSG
        },
        {
          validator: validation.isValidTime,
          message: validation.INVALID_TIME_MSG
        }
      ]
    },
    headquarters: {
      type: String,
      trim: true,
      required: [true, validation.MANDATORY_MSG]
    },
    description: {
      type: String,
      trim: true,
      required: [true, validation.MANDATORY_MSG]
    },
    // Usuarios en calidad de asistentes al evento
    users: {
      ref: USER_COLLECTION_NAME,
      type: [mongoose.Types.ObjectId],
      trim: true,
      validate: {
        validator: validation.usersExist,
        message: validation.USER_DOES_NOT_EXIST_MSG
      },
      default: []
    },
    author: {
      ref: USER_COLLECTION_NAME,
      type: mongoose.Types.ObjectId
    }
  },
  {
    timestamps: true
  }
)

eventSchema.index(
  { poster: 1 },
  {
    unique: true,
    partialFilterExpression: {
      // La restricción sólo salta cuando el campo no está vacío y está repetido
      $and: [{ poster: { $type: 'string' } }, { poster: { $gt: '' } }]
    }
  }
)

eventSchema.pre('validate', function (next) {
  if (this.title != null) {
    this.title = validation.normalizeString(this.title)
  }

  if (this.headquarters != null) {
    this.headquarters = validation.normalizeString(this.headquarters)
  }

  if (this.description != null) {
    this.description = validation.normalizeString(this.description)
  }

  return next()
})

eventSchema.post('validate', function () {
  if (validation.isNotEmptyArray(this.users)) {
    this.users = validation.removeDuplicates(this.users)
  }
})

// Modelo, esquema y colección de los eventos
// Si no se especifica, por defecto, la colección es el plural del modelo
const Event = mongoose.model(
  EVENT_COLLECTION_NAME,
  eventSchema,
  EVENT_COLLECTION_NAME
)

module.exports = { Event }
