const USER_FOLDER_NAME = 'Meetings/Users'

const multer = require('multer')
const { storageConfig } = require('./file')
const { getError } = require('../utils/error')
const { validation } = require('../utils/validation')

const uploadUser = (req, res, next) =>
  // Se pasa como parámetro el nombre del campo de tipo "file"
  multer({ storage: storageConfig(USER_FOLDER_NAME) }).single('avatar')(
    req,
    res,
    (error) =>
      error != null || (req.file != null && req.file.path == null)
        ? next(
            getError(
              `Se ha producido un error al subir el avatar del usuario a "Cloudinary"${
                error != null ? ':' + validation.LINE_BREAK + error.message : ''
              }`,
              400
            )
          )
        : next()
  )

const uploadNoAvatarUser = (req, res, next) =>
  multer().none()(req, res, (error) =>
    error != null
      ? next(
          getError(
            `Se ha producido un error al subir el usuario:${validation.LINE_BREAK}${error.message}`,
            400
          )
        )
      : next()
  )

module.exports = { uploadUser, uploadNoAvatarUser }
