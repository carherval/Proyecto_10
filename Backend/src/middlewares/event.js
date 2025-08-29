const EVENT_FOLDER_NAME = 'Meetings/Events'

const multer = require('multer')
const { storageConfig } = require('./file')
const { validation } = require('../utils/validation')

const isEventAuthor = async (req, res, next) => {
  const { id } = req.params

  try {
    if (!require('mongoose').isValidObjectId(id)) {
      throw new Error(validation.INVALID_ID_MSG)
    }

    const { Event } = require('../api/models/event')

    const event = await Event.findById(id)

    if (event == null) {
      return res.status(404).send(validation.getEventNotFoundByIdMsg(id))
    }

    const { ROLES } = require('../api/models/user')

    if (
      req.user._id.toString() !== event.author.toString() &&
      req.user.role !== ROLES.superadmin
    ) {
      return res
        .status(403)
        .send(validation.getNotAllowedActionMsg('No eres el autor del evento'))
    }

    next()
  } catch (error) {
    error.message = `${validation.ENDPOINT_ACCESS_ERROR_MSG}:${validation.LINE_BREAK}${error.message}`
    error.status = 401
    next(error)
  }
}

const uploadEvent = (req, res, next) =>
  // Se pasa como parámetro el nombre del campo de tipo "file"
  multer({ storage: storageConfig(EVENT_FOLDER_NAME) }).single('poster')(
    req,
    res,
    (error) => {
      if (error != null || (req.file != null && req.file.path == null)) {
        return res
          .status(400)
          .send(
            `Se ha producido un error al subir el cartel del evento a "Cloudinary"${
              error != null ? ':' + validation.LINE_BREAK + error.message : ''
            }`
          )
      }

      next()
    }
  )

const uploadNoPosterEvent = (req, res, next) =>
  multer().none()(req, res, (error) => {
    if (error != null) {
      return res
        .status(400)
        .send(
          `Se ha producido un error al subir el evento:${validation.LINE_BREAK}${error.message}`
        )
    }

    next()
  })

module.exports = {
  EVENT_FOLDER_NAME,
  isEventAuthor,
  uploadEvent,
  uploadNoPosterEvent
}
