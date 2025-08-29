const mongoose = require('mongoose')
const { Event } = require('../models/event')
const { ROLES, User } = require('../models/user')
const { validation } = require('../../utils/validation')
const bcrypt = require('bcrypt')
const moment = require('moment')
const { deleteFile } = require('../../utils/file')

const getUserNotFoundByIdMsg = (id) =>
  `No se ha encontrado ningún usuario con el identificador "${id}"`

const getUserWithSortedEvents = async (user) => {
  if (user != null) {
    const events = await Event.find({ users: { $in: user._id } })

    user = user.toObject()
    user.events =
      events.length > 0
        ? events.sort(validation.sortEvents).map((event) => event.title)
        : []
    user.createdAt = moment(user.createdAt).format('DD/MM/YYYY HH:mm:ss')
    user.updatedAt = moment(user.updatedAt).format('DD/MM/YYYY HH:mm:ss')

    delete user.password
  }

  return user
}

const getUsersWithSortedEvents = async (users) =>
  await Promise.all(users.map((user) => getUserWithSortedEvents(user)))

const getAllUsers = async (req, res, next) => {
  try {
    const users = (await getUsersWithSortedEvents(await User.find())).sort(
      validation.sortUsers
    )

    return users.length > 0
      ? res.status(200).send(users)
      : res.status(404).send('No se han encontrado usuarios')
  } catch (error) {
    error.message = `Se ha producido un error al consultar los usuarios:${validation.LINE_BREAK}${error.message}`
    error.status = 500
    next(error)
  }
}

const getUserById = async (req, res, next) => {
  const { id } = req.params

  if (req.user.role === ROLES.user && req.user._id.toString() !== id) {
    return res
      .status(403)
      .send(
        validation.getNotAllowedActionMsg(
          'Si no eres un usuario "admin" sólo puedes consultar tu propio usuario'
        )
      )
  }

  try {
    if (!mongoose.isValidObjectId(id)) {
      throw new Error(validation.INVALID_ID_MSG)
    }

    const user = await getUserWithSortedEvents(await User.findById(id))

    return user != null
      ? res.status(200).send(user)
      : res.status(404).send(getUserNotFoundByIdMsg(id))
  } catch (error) {
    error.message = `Se ha producido un error al consultar el usuario:${validation.LINE_BREAK}${error.message}`
    error.status = 500
    next(error)
  }
}

const loginUser = async (req, res, next) => {
  const INVALID_USER_PASSWORD_MSG = 'Usuario o contraseña incorrectos'

  let user

  try {
    if (req.body.userName == null) {
      throw new Error('Se debe introducir el usuario')
    }
    if (req.body.password == null) {
      throw new Error('Se debe introducir la contraseña')
    }

    user = await User.findOne({ userName: req.body.userName }).select(
      '+password'
    )
    if (user == null) {
      throw new Error(INVALID_USER_PASSWORD_MSG)
    }

    const { getJwtToken } = require('../../utils/token')

    return bcrypt.compareSync(req.body.password, user.password)
      ? res.status(200).json(getJwtToken(user._id, user.userName))
      : res.status(400).send(INVALID_USER_PASSWORD_MSG)
  } catch (error) {
    error.message = `Se ha producido un error al realizar el inicio de sesión del usuario:${
      validation.LINE_BREAK
    }${validation.formatErrorMsg(error.message)}`
    error.status = 400
    next(error)
  }
}

const createUser = async (req, res, next) => {
  const isUploadedFile = req.file != null && req.file.path != null

  try {
    // La acción sólo puede realizarse para registrarse el propio usuario o por un usuario "admin" para crear otro usuario
    if (req.user != null && req.user.role === ROLES.user) {
      return res
        .status(403)
        .send(
          validation.getNotAllowedActionMsg(
            'Si no eres un usuario "admin" no puedes crear otros usuarios'
          )
        )
    }

    if (isUploadedFile) {
      req.body.avatar = req.file.path
    }

    // Se valida aquí y no en el "validate" del modelo porque, si no, en el modelo se validaría el "hash" del cifrado de la contraseña, no la contraseña
    if (
      req.body.password != null &&
      !validation.isPassword(req.body.password)
    ) {
      throw new Error(validation.INVALID_PASSWORD_MSG)
    }

    // Cifrado de la contraseña
    // Al ser creación del usuario se podría hacer en el "middleware" "pre save" ya que siempre se tiene que cifrar
    if (req.body.password != null) {
      req.body.password = bcrypt.hashSync(req.body.password, 10)
    }

    req.body.role = ROLES.user

    return res
      .status(201)
      .send(await getUserWithSortedEvents(await new User(req.body).save()))
  } catch (error) {
    const msg = 'Se ha producido un error al crear el usuario'

    if (isUploadedFile) {
      deleteFile(req.file.path, msg)
    }

    error.message = `${msg}:${validation.LINE_BREAK}${validation.formatErrorMsg(
      error.message
    )}`
    error.status = 500
    next(error)
  }
}

const updateUserById = async (req, res, next) => {
  const { id } = req.params

  if (req.user.role === ROLES.user && req.user._id.toString() !== id) {
    return res
      .status(403)
      .send(
        validation.getNotAllowedActionMsg(
          'Si no eres un usuario "admin" sólo puedes actualizar tu propio usuario'
        )
      )
  }

  const isUploadedFile = req.file != null && req.file.path != null

  try {
    if (!mongoose.isValidObjectId(id)) {
      throw new Error(validation.INVALID_ID_MSG)
    }

    const user = await User.findById(id).select('+password')

    if (user == null) {
      return res.status(404).send(getUserNotFoundByIdMsg(id))
    }

    if (user.role === ROLES.superadmin) {
      return res
        .status(403)
        .send(`El usuario "${ROLES.superadmin}" no se puede actualizar`)
    }

    if (Object.keys(req.body).length === 0 && req.file == null) {
      throw new Error(
        'No se ha introducido ningún dato para actualizar el usuario'
      )
    }

    let updatedUser = new User(user)

    // Siempre que se actualiza el avatar del usuario, se elimina el que esté subido a "cloudinary"
    if (isUploadedFile || req.body.avatar != null) {
      const { getPublicIdCloudinary } = require('../../utils/file')

      deleteFile(
        updatedUser.avatar,
        `Actualización del avatar "${
          isUploadedFile
            ? getPublicIdCloudinary(req.file.path)
            : req.body.avatar
        }" del usuario`
      )
    }

    // Se sustituye la información del usuario a actualizar por la introducida por el usuario
    const { surnames, name, userName, avatar, password, email, role } = req.body

    // Se valida aquí y no en el "validate" del modelo porque, si no, en el modelo se validaría el "hash" del cifrado de la contraseña, no la contraseña
    if (password != null && !validation.isPassword(password)) {
      throw new Error(validation.INVALID_PASSWORD_MSG)
    }

    updatedUser.surnames = surnames ?? updatedUser.surnames
    updatedUser.name = name ?? updatedUser.name
    updatedUser.userName = userName ?? updatedUser.userName
    updatedUser.avatar = isUploadedFile
      ? req.file.path
      : avatar ?? updatedUser.avatar
    // Cifrado de la contraseña
    // Se hace aquí y no en el "middleware" "pre save" para evitar que se cifre siempre aunque no se actualice
    updatedUser.password =
      password != null ? bcrypt.hashSync(password, 10) : updatedUser.password
    updatedUser.email = email ?? updatedUser.email

    // El rol sólo puede ser actualizado por un usuario "admin"
    if (req.user.role !== ROLES.user && role != null) {
      updatedUser.role = role
    }

    return res
      .status(201)
      .send(await getUserWithSortedEvents(await updatedUser.save()))
  } catch (error) {
    const msg = 'Se ha producido un error al actualizar el usuario'

    if (isUploadedFile) {
      deleteFile(req.file.path, msg)
    }

    error.message = `${msg}:${validation.LINE_BREAK}${validation.formatErrorMsg(
      error.message
    )}`
    error.status = 500
    next(error)
  }
}

const deleteUserById = async (req, res, next) => {
  const { id } = req.params

  if (req.user._id.toString() === id) {
    return res
      .status(403)
      .send(
        validation.getNotAllowedActionMsg(
          'Un usuario no se puede eliminar a sí mismo'
        )
      )
  }

  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    if (!mongoose.isValidObjectId(id)) {
      throw new Error(validation.INVALID_ID_MSG)
    }

    const user = await User.findById(id)

    if (user == null) {
      await session.abortTransaction()

      return res.status(404).send(getUserNotFoundByIdMsg(id))
    }

    if (user.role === ROLES.superadmin) {
      await session.abortTransaction()

      return res
        .status(403)
        .send(`El usuario "${ROLES.superadmin}" no se puede eliminar`)
    }

    await User.deleteOne(user, { session })

    const events = await Event.find({
      $or: [{ users: { $in: id } }, { author: { $in: id } }]
    })
    const deletedUserFromEventMsg =
      (await Event.find({ users: { $in: id } })).length > 0
        ? `${validation.LINE_BREAK}Se ha eliminado el usuario de la lista de usuarios de los eventos`
        : ''
    const deletedAuthorUserMsg =
      (await Event.find({ author: { $in: id } })).length > 0
        ? `${validation.LINE_BREAK}Se ha eliminado el usuario como autor de sus eventos`
        : ''
    const superadminId = (await User.findOne({ role: ROLES.superadmin }))._id

    try {
      for (const event of events) {
        event.users = event.users.filter((userId) => userId.toString() !== id)

        if (event.author.toString() === id) {
          event.author = superadminId
        }

        await event.save({ session })
      }
    } catch (error) {
      throw new Error(
        `Se ha producido un error al eliminar el usuario de la lista de usuarios de los eventos o como autor de sus eventos:${validation.LINE_BREAK}${error.message}`
      )
    }

    const msg = 'Se ha eliminado el usuario'

    deleteFile(user.avatar, msg)

    await session.commitTransaction()

    return res
      .status(200)
      .send(msg + deletedUserFromEventMsg + deletedAuthorUserMsg)
  } catch (error) {
    await session.abortTransaction()

    error.message = `Se ha producido un error al eliminar el usuario:${validation.LINE_BREAK}${error.message}`
    error.status = 500
    next(error)
  } finally {
    session.endSession()
  }
}

const userController = {
  getAllUsers,
  getUserById,
  loginUser,
  createUser,
  updateUserById,
  deleteUserById
}

module.exports = { userController }
