const eventRouter = require('express').Router()
const { eventController } = require('../controllers/event')
const { isAuthorizedUser } = require('../../middlewares/auth')
const {
  isEventAuthor,
  uploadEvent,
  uploadNoPosterEvent
} = require('../../middlewares/event')
const { isValidSize } = require('../../middlewares/file')
const { ROLES } = require('../models/user')

eventRouter.get(
  '/get/all/',
  isAuthorizedUser({ isRequiredLogin: false }),
  eventController.getAllEvents
)

eventRouter.get(
  '/get/id/:id',
  isAuthorizedUser({ isRequiredLogin: false }),
  eventController.getEventById
)

eventRouter.get(
  '/get/title/:title',
  isAuthorizedUser({ isRequiredLogin: false }),
  eventController.getEventsByTitle
)

eventRouter.get(
  '/get/user-id/:id',
  isAuthorizedUser({ role: ROLES.admin }),
  eventController.getEventsByUserId
)

eventRouter.post(
  '/create/',
  isAuthorizedUser({ role: ROLES.admin }),
  isValidSize,
  uploadEvent,
  eventController.createEvent
)

eventRouter.put(
  '/update/id/:id',
  isAuthorizedUser({ role: ROLES.admin }),
  isEventAuthor,
  isValidSize,
  uploadEvent,
  eventController.updateEventById
)

eventRouter.put(
  '/attend/id/:id',
  isAuthorizedUser(),
  uploadNoPosterEvent,
  eventController.attendEventById
)

eventRouter.put(
  '/unattend/id/:id',
  isAuthorizedUser(),
  uploadNoPosterEvent,
  eventController.unattendEventById
)

eventRouter.delete(
  '/delete/id/:id',
  isAuthorizedUser({ role: ROLES.admin }),
  isEventAuthor,
  eventController.deleteEventById
)

module.exports = { eventRouter }
