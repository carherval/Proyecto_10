import * as eventComp from '../components/event/event'
import * as fieldComp from '../components/field/field'
import * as headerComp from '../components/header/header'
import * as loaderComp from '../components/loader/loader'
import * as messageComp from '../components/message/message'
import * as userComp from '../components/user/user'
import * as fetchUtil from '../utils/fetch'
import * as listenersUtil from '../utils/listeners'
import * as stringsUtil from '../utils/strings'

const EVENTS_NOT_FOUND_MSG = 'No se han encontrado eventos'

/* Página "Eventos" */

export const getAllEvents = async () => {
  if (userComp.isExpiredToken()) {
    userComp.doExpiredTokenActions(getAllEvents)
    return
  }

  loaderComp.showLoader()

  const resData = await fetchUtil.getAllEvents()

  if (resData != null) {
    headerComp.getHeader()
    document.querySelector('main').innerHTML = `<section class="flex ${
      stringsUtil.EVENT_HEADERS.events.id
    }"><h2>${stringsUtil.EVENT_HEADERS.events.label}</h2>${
      // Sólo los usuarios "admin" pueden crear eventos
      userComp.isAdminUser()
        ? fieldComp.getButtonLink(
            stringsUtil.EVENT_ACTIONS.create.id,
            stringsUtil.EVENT_ACTIONS.create.label
          )
        : ''
    }${getEventFilterForm()}<div id="content" class="flex"></div></section>`
    document.forms[0].elements.title.focus()

    getEvents(resData)
    addCreateEventButtonListeners()
    addEventFilterListeners()
  }

  loaderComp.hideLoader()
}

const getFilteredEvents = async () => {
  if (userComp.isExpiredToken()) {
    userComp.doExpiredTokenActions(getAllEvents)
    return
  }

  const title = document.forms[0].elements.title.value.trim()
  const field = document.forms[0].elements.field.value
  const order = document.forms[0].elements.order.value

  loaderComp.showLoader()

  const resData = await fetchUtil.getFilteredEvents(title, field, order)

  if (resData != null) {
    getEvents(resData)
  }

  loaderComp.hideLoader()
}

// Asistir a un evento
const attendEventById = async (id) => {
  if (userComp.isExpiredToken()) {
    userComp.doExpiredTokenActions()
    return
  }

  loaderComp.showLoader()

  const resData = await fetchUtil.attendEventById(id)

  if (resData != null) {
    messageComp.showAlertDialog(resData.msg)
    document.getElementById(`${stringsUtil.ENTITIES.event}-${id}`).outerHTML =
      eventComp.getEvent(resData.data, true)

    fieldComp.checkImgLoad(stringsUtil.EVENT_FIELDS.poster.id)
    addEventListeners(id)
  }

  loaderComp.hideLoader()
}

// Dejar de asistir a un evento
const unattendEventById = async (id) => {
  if (userComp.isExpiredToken()) {
    userComp.doExpiredTokenActions()
    return
  }

  loaderComp.showLoader()

  const resData = await fetchUtil.unattendEventById(id)

  if (resData != null) {
    messageComp.showAlertDialog(resData.msg)

    // Si la página es la de "Mis eventos" se elimina el evento del listado
    if (
      document.querySelector('h2').innerHTML ===
      stringsUtil.EVENT_HEADERS.events.label
    ) {
      document.getElementById(`${stringsUtil.ENTITIES.event}-${id}`).outerHTML =
        eventComp.getEvent(resData.data, true)
    } else {
      const ul = document.getElementById(`${stringsUtil.ENTITIES.event}-${id}`)
        .parentNode.parentNode

      document.getElementById(
        `${stringsUtil.ENTITIES.event}-${id}`
      ).parentNode.outerHTML = ''

      if (ul.innerHTML === '') {
        ul.outerHTML = `<div class="flex msg negrita">${EVENTS_NOT_FOUND_MSG}</div>`
      }
    }

    fieldComp.checkImgLoad(stringsUtil.EVENT_FIELDS.poster.id)
    addEventListeners(id)
  }

  loaderComp.hideLoader()
}

/* Página "Mis eventos" */

export const getMyEvents = async () => {
  if (userComp.isExpiredToken()) {
    userComp.doExpiredTokenActions()
    return
  }

  loaderComp.showLoader()

  const resData = await fetchUtil.getEventsByUserId(userComp.getUserId())

  if (resData != null) {
    headerComp.getHeader()
    document.querySelector(
      'main'
    ).innerHTML = `<section class="flex ${stringsUtil.EVENT_HEADERS.events.id}"><h2>${stringsUtil.EVENT_HEADERS.myEvents.label}</h2><div id="content" class="flex"></div></section>`

    getEvents(resData)
  }

  loaderComp.hideLoader()
}

/* Página "Crear evento" y "Actualizar evento" */

const getCreateEvent = () =>
  getCreateUpdateEventContent(stringsUtil.EVENT_ACTIONS.create)

const getUpdateEvent = async (id) => {
  if (userComp.isExpiredToken()) {
    userComp.doExpiredTokenActions()
    return
  }

  loaderComp.showLoader()

  const resData = await fetchUtil.getEventById(id)

  if (resData != null) {
    getCreateUpdateEventContent(stringsUtil.EVENT_ACTIONS.update, resData.data)
  }

  loaderComp.hideLoader()
}

const getCreateUpdateEventContent = (action, event = null) => {
  headerComp.getHeader()
  document.querySelector('main').innerHTML = `<section class="flex ${
    action.id
  }-${stringsUtil.ENTITIES.event}"><h2>${
    action.label
  }</h2>${getCreateUpdateEventForm(event)}</section>`
  document.forms[0].elements.title.focus()

  addCreateUpdateEventListeners(event?._id ?? '')
}

const createUpdateEvent = async (id = '') => {
  if (userComp.isExpiredToken()) {
    userComp.doExpiredTokenActions()
    return
  }

  const body = new FormData()
  const poster = document.forms[0].elements.poster

  body.append(
    stringsUtil.EVENT_FIELDS.title.id,
    document.forms[0].elements.title.value.trim()
  )
  body.append(
    stringsUtil.EVENT_FIELDS.date.id,
    document.forms[0].elements.date.value.trim()
  )
  body.append(
    stringsUtil.EVENT_FIELDS.time.id,
    document.forms[0].elements.time.value.trim()
  )
  body.append(
    stringsUtil.EVENT_FIELDS.headquarters.id,
    document.forms[0].elements.headquarters.value.trim()
  )
  body.append(
    stringsUtil.EVENT_FIELDS.description.id,
    document.forms[0].elements.description.value.trim()
  )

  if (poster.files.length > 0) {
    body.append(stringsUtil.EVENT_FIELDS.poster.id, poster.files[0])
  }

  loaderComp.showLoader()

  const resData =
    id === ''
      ? await fetchUtil.createEvent(body)
      : await fetchUtil.updateEventById(id, body)

  if (resData != null) {
    messageComp.showAlertDialog(resData.msg)
  }

  loaderComp.hideLoader()
}

/* Borrar evento */

const getDeleteEvent = (id) =>
  messageComp.showConfirmDialog('¿Deseas eliminar el evento?', () =>
    deleteEvent(id)
  )

const deleteEvent = async (id) => {
  if (userComp.isExpiredToken()) {
    userComp.doExpiredTokenActions()
    return
  }

  loaderComp.showLoader()

  const resData = await fetchUtil.deleteEventById(id)

  if (resData != null) {
    messageComp.showAlertDialog(resData.msg)

    const ul = document.getElementById(`${stringsUtil.ENTITIES.event}-${id}`)
      .parentNode.parentNode

    document.getElementById(
      `${stringsUtil.ENTITIES.event}-${id}`
    ).parentNode.outerHTML = ''

    if (ul.innerHTML === '') {
      ul.outerHTML = `<div class="flex msg negrita">${EVENTS_NOT_FOUND_MSG}</div>`
    }
  }

  loaderComp.hideLoader()
}

/* Formularios */

export const getEventFilterForm = () =>
  `<form name="${
    stringsUtil.EVENT_ACTIONS.filter.id
  }" class="flex" method="post">${fieldComp.getTextField({
    label: stringsUtil.EVENT_FIELDS.title.label,
    id: stringsUtil.EVENT_FIELDS.title.id,
    isVisible: false,
    isRequired: false
  })}${fieldComp.getSelectField({
    label: stringsUtil.EVENT_FIELDS.field.label,
    id: stringsUtil.EVENT_FIELDS.field.id,
    options: stringsUtil.SORT_FIELDS,
    isVisible: false
  })}${fieldComp.getSelectField({
    label: stringsUtil.EVENT_FIELDS.order.label,
    id: stringsUtil.EVENT_FIELDS.order.id,
    options: stringsUtil.SORT_ORDERS,
    isVisible: false
  })}${fieldComp.getSubmitButton(
    stringsUtil.EVENT_ACTIONS.filter.id,
    stringsUtil.EVENT_ACTIONS.filter.label
  )}</form>`

const getCreateUpdateEventForm = (event = null) =>
  `<form name="${
    event == null
      ? stringsUtil.EVENT_ACTIONS.create.id
      : stringsUtil.EVENT_ACTIONS.update.id
  }" class="flex" method="post"><div class="required-note"><span class="required">*</span> ${
    stringsUtil.MANDATORY_FIELDS_MSG
  }</div><div class="flex">${fieldComp.getTextField({
    label: stringsUtil.EVENT_FIELDS.title.label,
    id: stringsUtil.EVENT_FIELDS.title.id,
    value: event != null ? event.title : ''
  })}</div><div class="flex">${fieldComp.getTextField({
    label: stringsUtil.EVENT_FIELDS.date.label,
    id: stringsUtil.EVENT_FIELDS.date.id,
    value: event != null ? event.date : ''
  })}</div><div class="flex">${fieldComp.getTextField({
    label: stringsUtil.EVENT_FIELDS.time.label,
    id: stringsUtil.EVENT_FIELDS.time.id,
    value: event != null ? event.time : ''
  })}</div><div class="flex">${fieldComp.getTextField({
    label: stringsUtil.EVENT_FIELDS.headquarters.label,
    id: stringsUtil.EVENT_FIELDS.headquarters.id,
    value: event != null ? event.headquarters : ''
  })}</div><div class="flex">${fieldComp.getTextAreaField({
    label: stringsUtil.EVENT_FIELDS.description.label,
    id: stringsUtil.EVENT_FIELDS.description.id,
    value: event != null ? event.description : ''
  })}</div><div class="flex">${fieldComp.getFileField({
    label: stringsUtil.EVENT_FIELDS.poster.label,
    id: stringsUtil.EVENT_FIELDS.poster.id
  })}</div><div class="flex">${fieldComp.getSubmitButton(
    event == null
      ? stringsUtil.EVENT_ACTIONS.create.id
      : stringsUtil.EVENT_ACTIONS.update.id,
    event == null
      ? stringsUtil.EVENT_ACTIONS.create.label
      : stringsUtil.EVENT_ACTIONS.update.label
  )}</div></form>`

/* Utilidades */

export const getEvents = (resData) => {
  const events = resData.data
  const content = document.getElementById('content')

  if (events.length === 0) {
    content.innerHTML = `<div class="flex msg negrita">${EVENTS_NOT_FOUND_MSG}</div>`
  } else {
    const ul = document.createElement('ul')

    ul.classList.add('flex')

    for (const event of events) {
      const li = document.createElement('li')

      li.innerHTML = eventComp.getEvent(event)
      ul.appendChild(li)
    }

    content.innerHTML = ul.outerHTML
  }

  fieldComp.checkImgLoad(stringsUtil.EVENT_FIELDS.poster.id)
  addEventListeners()
}

/* Escuchadores de eventos */

const addEventListeners = (id = '') => {
  listenersUtil.addPreventDefault()
  listenersUtil.addCollapsible(stringsUtil.ENTITIES.event, id)

  // Botón "Actualizar evento"
  document
    .querySelectorAll(
      `${
        id !== '' ? '#' + stringsUtil.ENTITIES.event + '-' + id + ' ' : ''
      }a[id^="${stringsUtil.EVENT_ACTIONS.update.id}-"]`
    )
    .forEach((btn) => {
      btn.addEventListener('click', () =>
        getUpdateEvent(
          btn.id.replace(`${stringsUtil.EVENT_ACTIONS.update.id}-`, '')
        )
      )
    })

  // Botón "Eliminar evento"
  document
    .querySelectorAll(
      `${
        id !== '' ? '#' + stringsUtil.ENTITIES.event + '-' + id + ' ' : ''
      }a[id^="${stringsUtil.EVENT_ACTIONS.delete.id}-"]`
    )
    .forEach((btn) => {
      btn.addEventListener('click', () =>
        getDeleteEvent(
          btn.id.replace(`${stringsUtil.EVENT_ACTIONS.delete.id}-`, '')
        )
      )
    })

  // Botón "Asistir al evento"
  document
    .querySelectorAll(
      `${
        id !== '' ? '#' + stringsUtil.ENTITIES.event + '-' + id + ' ' : ''
      }button[id^="${stringsUtil.EVENT_ACTIONS.attend.id}-"]`
    )
    .forEach((btn) => {
      btn.addEventListener('click', () =>
        attendEventById(
          btn.id.replace(`${stringsUtil.EVENT_ACTIONS.attend.id}-`, '')
        )
      )
    })

  // Botón "Dejar de asistir al evento"
  document
    .querySelectorAll(
      `${
        id !== '' ? '#' + stringsUtil.ENTITIES.event + '-' + id + ' ' : ''
      }button[id^="${stringsUtil.EVENT_ACTIONS.unattend.id}-"]`
    )
    .forEach((btn) => {
      btn.addEventListener('click', () =>
        unattendEventById(
          btn.id.replace(`${stringsUtil.EVENT_ACTIONS.unattend.id}-`, '')
        )
      )
    })
}

const addEventFilterListeners = () => {
  listenersUtil.addPreventDefault()
  document.forms[0].elements.submit.addEventListener('click', () =>
    getFilteredEvents()
  )
}

// Botón "Crear evento"
const addCreateEventButtonListeners = () =>
  document
    .querySelector(`#${stringsUtil.EVENT_ACTIONS.create.id}`)
    ?.addEventListener('click', () => getCreateEvent())

// Botón del formulario de creación y actualización de eventos
const addCreateUpdateEventListeners = (id = '') => {
  listenersUtil.addPreventDefault()
  listenersUtil.addFileFieldChange(document.forms[0].elements.poster)
  document.forms[0].elements.submit.addEventListener('click', () =>
    createUpdateEvent(id)
  )
}
