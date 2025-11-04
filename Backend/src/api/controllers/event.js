const mongoose = require('mongoose')
const { Event } = require('../models/event')
const { ROLES } = require('../models/user')
const { getError } = require('../../utils/error')
const { validation } = require('../../utils/validation')
const moment = require('moment')
const { deleteFile } = require('../../utils/file')

const getUpdatedAttendeesMsg = () =>
  'Asistentes al evento actualizados correctamente'

const getAttendeeUpdateErrorMsg = () =>
  'Se ha producido un error al actualizar los asistentes al evento'

const getEventWithSortedUsers = (req, event) => {
  if (event != null) {
    event.users.sort(validation.sortUsers)

    event = event.toObject()
    event.createdAt = moment(event.createdAt).format('DD/MM/YYYY HH:mm:ss')
    event.updatedAt = moment(event.updatedAt).format('DD/MM/YYYY HH:mm:ss')

    // Los usuarios de un evento sólo pueden ser visualizados por un usuario "admin" o si el propio usuario es asistente al evento
    if (
      req.user == null ||
      (req.user.role === ROLES.user &&
        !event.users.some((user) => user.username === req.user.username))
    ) {
      delete event.users
    }

    // El autor de un evento sólo puede ser visualizado por un usuario "admin"
    if (req.user == null || req.user.role === ROLES.user) {
      delete event.author
    }
  }

  return event
}

const getEventsWithSortedUsers = (req, events) =>
  events.map((event) => getEventWithSortedUsers(req, event))

const getAllEvents = async (req, res, next) => {
  const field = req.query.field?.toLowerCase().trim() ?? 'title'
  const order = req.query.order?.toLowerCase().trim() ?? 'asc'

  try {
    const events = getEventsWithSortedUsers(
      req,
      await Event.find()
        .populate('users', 'surnames name username')
        .populate('author', 'username role')
    ).sort((event1, event2) =>
      validation.sortEvents(event1, event2, field, order)
    )

    return res.status(200).json({
      msg: events.length === 0 ? 'No se han encontrado eventos' : undefined,
      data: events
    })
  } catch (error) {
    error.message = `Se ha producido un error al consultar los eventos:${validation.LINE_BREAK}${error.message}`
    error.status = 500

    return next(error)
  }
}

const getEventById = async (req, res, next) => {
  const { id } = req.params

  try {
    if (!mongoose.isValidObjectId(id)) {
      throw new Error(validation.INVALID_ID_MSG)
    }

    const event = getEventWithSortedUsers(
      req,
      await Event.findById(id)
        .populate('users', 'surnames name username')
        .populate('author', 'username role')
    )

    return event != null
      ? res.status(200).json({ data: event })
      : next(getError(validation.getEventNotFoundByIdMsg(id), 404))
  } catch (error) {
    error.message = `Se ha producido un error al consultar el evento:${validation.LINE_BREAK}${error.message}`
    error.status = 500

    return next(error)
  }
}

const getEventsByTitle = async (req, res, next) => {
  const title = validation.getIgnoreAccentCaseText(
    validation.normalizeString(req.params.title)
  )
  const field = req.query.field?.toLowerCase().trim() ?? 'title'
  const order = req.query.order?.toLowerCase().trim() ?? 'asc'

  try {
    const events = getEventsWithSortedUsers(
      req,
      await Event.find({ title })
        .populate('users', 'surnames name username')
        .populate('author', 'username role')
    ).sort((event1, event2) =>
      validation.sortEvents(event1, event2, field, order)
    )

    return res.status(200).json({
      msg:
        events.length === 0
          ? `No se han encontrado eventos cuyo título contenga "${validation.normalizeSearchString(
              title
            )}"`
          : undefined,
      data: events
    })
  } catch (error) {
    error.message = `Se ha producido un error al consultar los eventos cuyo título contenga "${validation.normalizeSearchString(
      title
    )}":${validation.LINE_BREAK}${error.message}`
    error.status = 500

    return next(error)
  }
}

const getEventsByUserId = async (req, res, next) => {
  const { id } = req.params
  const field = req.query.field?.toLowerCase().trim() ?? 'title'
  const order = req.query.order?.toLowerCase().trim() ?? 'asc'

  try {
    if (!mongoose.isValidObjectId(id)) {
      throw new Error(validation.INVALID_ID_MSG)
    }

    if (req.user.role === ROLES.user && req.user._id.toString() !== id) {
      return next(
        getError(
          validation.getNotAllowedActionMsg(
            'Si no eres un usuario "admin" sólo puedes consultar tus propios eventos'
          ),
          403
        )
      )
    }

    const events = getEventsWithSortedUsers(
      req,
      await Event.find({ users: { $in: id } })
        .populate('users', 'surnames name username')
        .populate('author', 'username role')
    ).sort((event1, event2) =>
      validation.sortEvents(event1, event2, field, order)
    )

    return res.status(200).json({
      msg:
        events.length === 0
          ? `No se han encontrado eventos con el identificador "${id}" en alguno de sus usuarios`
          : undefined,
      data: events
    })
  } catch (error) {
    error.message = `Se ha producido un error al consultar los eventos con el identificador "${id}" en alguno de sus usuarios:${validation.LINE_BREAK}${error.message}`
    error.status = 500

    return next(error)
  }
}

const createEvent = async (req, res, next) => {
  const isUploadedFile = req.file != null && req.file.path != null

  try {
    if (isUploadedFile) {
      req.body.poster = req.file.path
    }

    req.body.users = []
    req.body.author = req.user._id

    // Sólo se permite la población de campos en funciones de búsqueda
    return res.status(201).json({
      msg: 'Evento creado correctamente',
      data: getEventWithSortedUsers(
        req,
        await Event.findById((await new Event(req.body).save())._id)
          .populate('users', 'surnames name username')
          .populate('author', 'username role')
      )
    })
  } catch (error) {
    const msg = 'Se ha producido un error al crear el evento'

    if (isUploadedFile) {
      deleteFile(req.file.path, msg)
    }

    error.message = `${msg}:${validation.LINE_BREAK}${validation.formatErrorMsg(
      error.message
    )}`
    error.status = 500

    return next(error)
  }
}

const updateEventById = async (req, res, next) => {
  const { id } = req.params
  const isUploadedFile = req.file != null && req.file.path != null

  try {
    if (!mongoose.isValidObjectId(id)) {
      throw new Error(validation.INVALID_ID_MSG)
    }

    const event = await Event.findById(id)

    if (event == null) {
      return next(getError(validation.getEventNotFoundByIdMsg(id), 404))
    }

    if (Object.keys(req.body).length === 0 && req.file == null) {
      throw new Error(
        'No se ha introducido ningún dato para actualizar el evento'
      )
    }

    let updatedEvent = new Event(event)

    // Siempre que se actualiza el cartel del evento, se elimina el que esté subido a "cloudinary"
    if (isUploadedFile || req.body.poster != null) {
      const { getPublicIdCloudinary } = require('../../utils/file')

      deleteFile(
        updatedEvent.poster,
        `Actualización del cartel "${
          isUploadedFile
            ? getPublicIdCloudinary(req.file.path)
            : req.body.poster
        }" del evento`
      )
    }

    // Se sustituye la información del evento a actualizar por la introducida por el usuario
    const { title, poster, date, time, headquarters, description } = req.body

    updatedEvent.title = title ?? updatedEvent.title
    updatedEvent.poster = isUploadedFile
      ? req.file.path
      : poster ?? updatedEvent.poster
    updatedEvent.date = date ?? updatedEvent.date
    updatedEvent.time = time ?? updatedEvent.time
    updatedEvent.headquarters = headquarters ?? updatedEvent.headquarters
    updatedEvent.description = description ?? updatedEvent.description

    // Sólo se permite la población de campos en funciones de búsqueda
    return res.status(201).json({
      msg: 'Evento actualizado correctamente',
      data: getEventWithSortedUsers(
        req,
        await Event.findById((await updatedEvent.save())._id)
          .populate('users', 'surnames name username')
          .populate('author', 'username role')
      )
    })
  } catch (error) {
    const msg = 'Se ha producido un error al actualizar el evento'

    if (isUploadedFile) {
      deleteFile(req.file.path, msg)
    }

    error.message = `${msg}:${validation.LINE_BREAK}${validation.formatErrorMsg(
      error.message
    )}`
    error.status = 500

    return next(error)
  }
}

const attendEventById = async (req, res, next) => {
  const { id } = req.params

  try {
    if (!mongoose.isValidObjectId(id)) {
      throw new Error(validation.INVALID_ID_MSG)
    }

    const event = await Event.findById(id)

    if (event == null) {
      return next(getError(validation.getEventNotFoundByIdMsg(id), 404))
    }

    event.users.push(req.user._id)

    // Sólo se permite la población de campos en funciones de búsqueda
    return res.status(201).json({
      msg: getUpdatedAttendeesMsg(),
      data: getEventWithSortedUsers(
        req,
        await Event.findById((await event.save())._id)
          .populate('users', 'surnames name username')
          .populate('author', 'username role')
      )
    })
  } catch (error) {
    error.message = `${getAttendeeUpdateErrorMsg()}:${
      validation.LINE_BREAK
    }${validation.formatErrorMsg(error.message)}`
    error.status = 500

    return next(error)
  }
}

const unattendEventById = async (req, res, next) => {
  const { id } = req.params

  try {
    if (!mongoose.isValidObjectId(id)) {
      throw new Error(validation.INVALID_ID_MSG)
    }

    const event = await Event.findById(id)

    if (event == null) {
      return next(getError(validation.getEventNotFoundByIdMsg(id), 404))
    }

    event.users = event.users.filter(
      (userId) => userId.toString() !== req.user._id.toString()
    )

    // Sólo se permite la población de campos en funciones de búsqueda
    return res.status(201).json({
      msg: getUpdatedAttendeesMsg(),
      data: getEventWithSortedUsers(
        req,
        await Event.findById((await event.save())._id)
          .populate('users', 'surnames name username')
          .populate('author', 'username role')
      )
    })
  } catch (error) {
    error.message = `${getAttendeeUpdateErrorMsg()}:${
      validation.LINE_BREAK
    }${validation.formatErrorMsg(error.message)}`
    error.status = 500

    return next(error)
  }
}

const deleteEventById = async (req, res, next) => {
  const { id } = req.params
  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    if (!mongoose.isValidObjectId(id)) {
      throw new Error(validation.INVALID_ID_MSG)
    }

    const event = await Event.findById(id)

    if (event == null) {
      await session.abortTransaction()

      return next(getError(validation.getEventNotFoundByIdMsg(id), 404))
    }

    await Event.deleteOne(event, { session })

    const msg = 'Evento eliminado correctamente'

    deleteFile(event.poster, msg)

    await session.commitTransaction()

    return res.status(200).json({ msg })
  } catch (error) {
    await session.abortTransaction()

    error.message = `Se ha producido un error al eliminar el evento:${validation.LINE_BREAK}${error.message}`
    error.status = 500

    return next(error)
  } finally {
    session.endSession()
  }
}

const eventController = {
  getAllEvents,
  getEventById,
  getEventsByTitle,
  getEventsByUserId,
  createEvent,
  updateEventById,
  attendEventById,
  unattendEventById,
  deleteEventById
}

module.exports = { eventController }
