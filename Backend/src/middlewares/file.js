const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')

const isValidSize = (req, res, next) => {
  // MB
  const MAX_SIZE = 5

  const contentLength = req.headers['content-length']

  const { getError } = require('../utils/error')
  const { validation } = require('../utils/validation')

  return contentLength != null &&
    parseInt(contentLength, 10) > MAX_SIZE * 1024 * 1204
    ? next(
        getError(
          `Se ha producido un error al subir el archivo a "Cloudinary":${validation.LINE_BREAK}El tamaño no debe ser superior a ${MAX_SIZE} MB`,
          413
        )
      )
    : next()
}

const storageConfig = (folderName) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder: folderName,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
    }
  })

module.exports = { isValidSize, storageConfig }
