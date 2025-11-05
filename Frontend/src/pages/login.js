import * as fieldComp from '../components/field/field'
import * as headerComp from '../components/header/header'
import * as loaderComp from '../components/loader/loader'
import * as eventsPage from './events'
import * as fetchUtil from '../utils/fetch'
import * as listenersUtil from '../utils/listeners'
import * as stringsUtil from '../utils/strings'

/* Página "Inicio de sesión" */

export const getLogin = () => {
  headerComp.getHeader(false)
  document.querySelector('main').innerHTML = `<section class="flex ${
    stringsUtil.USER_HEADERS.login.id
  }"><h2>${
    stringsUtil.USER_HEADERS.login.label
  }</h2>${getLoginForm()}</section>`
  document.forms[0].elements.username.focus()

  addLoginListeners()
}

export const loginUser = async () => {
  const body = {}

  body.username = document.forms[0].elements.username.value.trim()
  body.password = document.forms[0].elements.password.value.trim()

  loaderComp.showLoader()

  let resData = await fetchUtil.loginUser(body)

  if (resData != null) {
    sessionStorage.setItem(
      stringsUtil.ENTITIES.user,
      JSON.stringify(resData.data)
    )
    resData = await fetchUtil.getAllEvents()

    if (resData != null) {
      await eventsPage.getAllEvents()
    }
  }

  loaderComp.hideLoader()
}

/* Formularios */

const getLoginForm = () =>
  `<form name="${
    stringsUtil.USER_HEADERS.login.id
  }" class="flex" method="post"><div class="required-note"><span class="required">*</span> ${
    stringsUtil.MANDATORY_FIELDS_MSG
  }</div>${fieldComp.getTextField({
    label: stringsUtil.USER_FIELDS.username.label,
    id: stringsUtil.USER_FIELDS.username.id,
    isVisible: false
  })}${fieldComp.getTextField({
    label: stringsUtil.USER_FIELDS.password.label,
    id: stringsUtil.USER_FIELDS.password.id,
    type: 'password',
    isVisible: false
  })}${fieldComp.getSubmitButton(
    stringsUtil.USER_ACTIONS.login.id,
    stringsUtil.USER_ACTIONS.login.label
  )}</form>`

/* Escuchadores de eventos */

// Botón del formulario de inicio de sesión
const addLoginListeners = () => {
  listenersUtil.addPreventDefault()
  document.forms[0].elements.submit.addEventListener('click', () => loginUser())
}
