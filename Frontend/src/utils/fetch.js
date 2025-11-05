import * as messageComp from '../components/message/message'
import * as userComp from '../components/user/user'

const TRY_AGAIN_MSG = 'Inténtalo de nuevo más tarde'
const LINE_BREAK = '<br /><br />'

const FETCH_METHODS = {
  get: 'GET',
  delete: 'DELETE',
  post: 'POST',
  put: 'PUT'
}

const MESSAGES = [
  {
    original: 'fetch',
    new: `No se puede atender la solicitud${LINE_BREAK}El servidor está caído${LINE_BREAK}${TRY_AGAIN_MSG}`
  },
  {
    original: 'buffering',
    new: `El servidor no responde${LINE_BREAK}${TRY_AGAIN_MSG}${LINE_BREAK}Es posible que se cierre tu sesión`
  },
  { original: 'url', new: 'Solicitud incorrecta' }
]

export const getAllEvents = () =>
  getData(
    'http://localhost:3000/event/get/all/',
    userComp.getUserToken(),
    FETCH_METHODS.get,
    null
  )

export const getFilteredEvents = (title, field, order) =>
  getData(
    title !== ''
      ? `http://localhost:3000/event/get/title/${title}?field=${field}&order=${order}`
      : `http://localhost:3000/event/get/all/?field=${field}&order=${order}`,
    userComp.getUserToken(),
    FETCH_METHODS.get,
    null
  )

export const getEventById = (id) =>
  getData(
    `http://localhost:3000/event/get/id/${id}`,
    userComp.getUserToken(),
    FETCH_METHODS.get,
    null
  )

export const getEventsByUserId = (id) =>
  getData(
    `http://localhost:3000/event/get/user-id/${id}`,
    userComp.getUserToken(),
    FETCH_METHODS.get,
    null
  )

export const createEvent = (body) =>
  getData(
    'http://localhost:3000/event/create/',
    userComp.getUserToken(),
    FETCH_METHODS.post,
    body
  )

export const updateEventById = (id, body) =>
  getData(
    `http://localhost:3000/event/update/id/${id}`,
    userComp.getUserToken(),
    FETCH_METHODS.put,
    body
  )

export const attendEventById = (id) =>
  getData(
    `http://localhost:3000/event/attend/id/${id}`,
    userComp.getUserToken(),
    FETCH_METHODS.put,
    null
  )

export const unattendEventById = (id) =>
  getData(
    `http://localhost:3000/event/unattend/id/${id}`,
    userComp.getUserToken(),
    FETCH_METHODS.put,
    null
  )

export const deleteEventById = (id) =>
  getData(
    `http://localhost:3000/event/delete/id/${id}`,
    userComp.getUserToken(),
    FETCH_METHODS.delete,
    null
  )

export const getAllUsers = () =>
  getData(
    'http://localhost:3000/user/get/all/',
    userComp.getUserToken(),
    FETCH_METHODS.get,
    null
  )

export const getUserById = (id) =>
  getData(
    `http://localhost:3000/user/get/id/${id}`,
    userComp.getUserToken(),
    FETCH_METHODS.get,
    null
  )

export const loginUser = (body) =>
  getData('http://localhost:3000/user/login/', null, FETCH_METHODS.post, body)

export const createUser = (body) =>
  getData(
    'http://localhost:3000/user/create/',
    userComp.getUserToken(),
    FETCH_METHODS.post,
    body
  )

export const updateUserById = (id, body) =>
  getData(
    `http://localhost:3000/user/update/id/${id}`,
    userComp.getUserToken(),
    FETCH_METHODS.put,
    body
  )

export const deleteUserById = (id) =>
  getData(
    `http://localhost:3000/user/delete/id/${id}`,
    userComp.getUserToken(),
    FETCH_METHODS.delete,
    null
  )

// Función genérica para ejecutar un "endpoint" del "backend"
const getData = async (url, token, method, body) => {
  const headers = {}
  // Si es FormData el "Content-Type" se establece automáticamente
  const isFormData = body instanceof FormData

  if (body != null && !isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  if (token != null) {
    headers.Authorization = `Bearer ${token}`
  }

  const options =
    Object.keys(headers).length !== 0 ? { headers, method } : { method }

  if (body != null) {
    options.body = isFormData ? body : JSON.stringify(body)
  }

  try {
    const res = await fetch(url, options)
    const resData = await res.json()

    if (!res.ok) {
      // Se comprueba si ha habido error en la autorización del usuario
      res.status === 401 &&
      (resData.msg.includes('jwt') || resData.msg.includes('invalid'))
        ? userComp.doExpiredTokenActions()
        : messageComp.showAlertDialog(getMessage(resData.msg))
    }

    return res.ok ? resData : null
  } catch (error) {
    messageComp.showAlertDialog(getMessage(error.message))

    return null
  }
}

const getMessage = (msg) => {
  for (const message of MESSAGES) {
    if (msg.toLowerCase().includes(message.original)) {
      return message.new
    }
  }

  return msg
}
