const cloudinary = require('cloudinary').v2

const getPublicIdCloudinary = (pathFile) =>
  `${pathFile.split('/').at(-3)}/${pathFile.split('/').at(-2)}/${
    pathFile.split('/').at(-1).split('.')[0]
  }`

const fileExistsInCloudinary = async (publicId) => {
  try {
    await cloudinary.api.resource(publicId)

    return true
  } catch {
    return false
  }
}

const deleteFile = (pathFile, reasonMsg) => {
  const publicId = getPublicIdCloudinary(pathFile)

  // Sólo se elimina si el archivo existe en "cloudinary"
  fileExistsInCloudinary(publicId).then((exists) => {
    if (exists) {
      cloudinary.uploader.destroy(publicId, () => {
        console.log(
          `Archivo "${publicId}" de "Cloudinary" eliminado debido a: ${reasonMsg}`
        )
      })
    }
  })
}

module.exports = { getPublicIdCloudinary, fileExistsInCloudinary, deleteFile }
