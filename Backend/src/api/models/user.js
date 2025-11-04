const USER_COLLECTION_NAME = 'user'

const mongoose = require('mongoose')
const { validation } = require('../../utils/validation')

const ROLES = { user: 'user', admin: 'admin', superadmin: 'superadmin' }
const { superadmin, ...ALLOWED_ROLES } = ROLES

const userSchema = new mongoose.Schema(
  {
    surnames: {
      type: String,
      trim: true,
      required: [true, validation.MANDATORY_MSG]
    },
    name: {
      type: String,
      trim: true,
      required: [true, validation.MANDATORY_MSG]
    },
    username: {
      type: String,
      trim: true,
      required: [true, validation.MANDATORY_MSG],
      unique: [true, `username: ${validation.UNIQUE_MSG}`]
    },
    avatar: {
      type: String,
      trim: true,
      default: ''
    },
    password: {
      type: String,
      trim: true,
      required: [true, validation.MANDATORY_MSG],
      select: false
    },
    email: {
      type: String,
      trim: true,
      required: [true, validation.MANDATORY_MSG],
      validate: {
        validator: validation.isEmail,
        message: validation.INVALID_EMAIL_MSG
      },
      unique: [true, `email: ${validation.UNIQUE_MSG}`]
    },
    role: {
      type: String,
      trim: true,
      required: [true, validation.MANDATORY_MSG],
      enum: {
        values: Object.values(ALLOWED_ROLES),
        message: `${
          validation.ALLOWED_VALUES_MSG
        }: ${validation.getObjectValues(ALLOWED_ROLES)}`
      },
      default: ROLES.user
    }
  },
  {
    timestamps: true
  }
)

userSchema.index(
  { avatar: 1 },
  {
    unique: true,
    partialFilterExpression: {
      // La restricción sólo salta cuando el campo no está vacío y está repetido
      $and: [{ avatar: { $type: 'string' } }, { avatar: { $gt: '' } }]
    }
  }
)

userSchema.pre('validate', function (next) {
  if (this.surnames != null) {
    this.surnames = validation.normalizeString(this.surnames)
  }

  if (this.name != null) {
    this.name = validation.normalizeString(this.name)
  }

  if (this.username != null) {
    this.username = validation.normalizeUserName(this.username)
  }

  if (this.role != null) {
    this.role = validation.normalizeString(this.role)
  }

  return next()
})

// Modelo, esquema y colección de los usuarios
// Si no se especifica, por defecto, la colección es el plural del modelo
const User = mongoose.model(
  USER_COLLECTION_NAME,
  userSchema,
  USER_COLLECTION_NAME
)

module.exports = { USER_COLLECTION_NAME, ROLES, User }
