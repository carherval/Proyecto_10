const userRouter = require('express').Router()
const { userController } = require('../controllers/user')
const { isAuthorizedUser } = require('../../middlewares/auth')
const { isValidSize } = require('../../middlewares/file')
const { uploadUser, uploadNoAvatarUser } = require('../../middlewares/user')
const { ROLES } = require('../models/user')

userRouter.get(
  '/get/all/',
  isAuthorizedUser({ role: ROLES.admin }),
  userController.getAllUsers
)

userRouter.get('/get/id/:id', isAuthorizedUser(), userController.getUserById)

userRouter.post('/login/', uploadNoAvatarUser, userController.loginUser)

userRouter.post(
  '/create/',
  isAuthorizedUser({ isRequiredLogin: false }),
  isValidSize,
  uploadUser,
  userController.createUser
)

userRouter.put(
  '/update/id/:id',
  isAuthorizedUser(),
  uploadUser,
  userController.updateUserById
)

userRouter.delete(
  '/delete/id/:id',
  isAuthorizedUser({ role: ROLES.admin }),
  userController.deleteUserById
)

module.exports = { userRouter }
