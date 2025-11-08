import * as messageComp from '../components/message/message'
import * as userComp from '../components/user/user'

const API_URL = import.meta.env.VITE_API_URL
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
    `${API_URL}/event/get/all/`,
    userComp.getUserToken(),
    FETCH_METHODS.get,
    null
  )

export const getFilteredEvents = (title, field, order) =>
  getData(
    title !== ''
      ? `${API_URL}/event/get/title/${title}?field=${field}&order=${order}`
      : `${API_URL}/event/get/all/?field=${field}&order=${order}`,
    userComp.getUserToken(),
    FETCH_METHODS.get,
    null
  )

export const getEventById = (id) =>
  getData(
    `${API_URL}/event/get/id/${id}`,
    userComp.getUserToken(),
    FETCH_METHODS.get,
    null
  )

export const getEventsByUserId = (id) =>
  getData(
    `${API_URL}/event/get/user-id/${id}`,
    userComp.getUserToken(),
    FETCH_METHODS.get,
    null
  )

export const createEvent = (body) =>
  getData(
    `${API_URL}/event/create/`,
    userComp.getUserToken(),
    FETCH_METHODS.post,
    body
  )

export const updateEventById = (id, body) =>
  getData(
    `${API_URL}/event/update/id/${id}`,
    userComp.getUserToken(),
    FETCH_METHODS.put,
    body
  )

export const attendEventById = (id) =>
  getData(
    `${API_URL}/event/attend/id/${id}`,
    userComp.getUserToken(),
    FETCH_METHODS.put,
    null
  )

export const unattendEventById = (id) =>
  getData(
    `${API_URL}/event/unattend/id/${id}`,
    userComp.getUserToken(),
    FETCH_METHODS.put,
    null
  )

export const deleteEventById = (id) =>
  getData(
    `${API_URL}/event/delete/id/${id}`,
    userComp.getUserToken(),
    FETCH_METHODS.delete,
    null
  )

export const getAllUsers = () =>
  getData(
    `${API_URL}/user/get/all/`,
    userComp.getUserToken(),
    FETCH_METHODS.get,
    null
  )

export const getUserById = (id) =>
  getData(
    `${API_URL}/user/get/id/${id}`,
    userComp.getUserToken(),
    FETCH_METHODS.get,
    null
  )

export const loginUser = (body) =>
  getData(`${API_URL}/user/login/`, null, FETCH_METHODS.post, body)

export const createUser = (body) =>
  getData(
    `${API_URL}/user/create/`,
    userComp.getUserToken(),
    FETCH_METHODS.post,
    body
  )

export const updateUserById = (id, body) =>
  getData(
    `${API_URL}/user/update/id/${id}`,
    userComp.getUserToken(),
    FETCH_METHODS.put,
    body
  )

export const deleteUserById = (id) =>
  getData(
    `${API_URL}/user/delete/id/${id}`,
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
