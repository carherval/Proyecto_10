import * as fieldComp from '../components/field/field'
import * as headerComp from '../components/header/header'
import * as loaderComp from '../components/loader/loader'
import * as messageComp from '../components/message/message'
import * as userComp from '../components/user/user'
import * as loginPage from './login'
import * as fetchUtil from '../utils/fetch'
import * as listenersUtil from '../utils/listeners'
import * as stringsUtil from '../utils/strings'

const USERS_NOT_FOUND_MSG = 'No se han encontrado usuarios'

/* Página "Usuarios" */

export const getAllUsers = async () => {
  if (userComp.isExpiredToken()) {
    userComp.doExpiredTokenActions()
    return
  }

  loaderComp.showLoader()

  const resData = await fetchUtil.getAllUsers()

  if (resData != null) {
    headerComp.getHeader()
    document.querySelector('main').innerHTML = `<section class="flex ${
      stringsUtil.USER_HEADERS.users.id
    }"><h2>${stringsUtil.USER_HEADERS.users.label}</h2>${
      // Sólo los usuarios "admin" pueden crear usuarios
      userComp.isAdminUser()
        ? fieldComp.getButtonLink(
            stringsUtil.USER_ACTIONS.create.id,
            stringsUtil.USER_ACTIONS.create.label
          )
        : ''
    }<div id="content" class="flex"></div></section>`

    getUsers(resData)
    addCreateUserButtonListeners()
  }

  loaderComp.hideLoader()
}

/* Página "Mi perfil" */

export const getProfile = async () => {
  if (userComp.isExpiredToken()) {
    userComp.doExpiredTokenActions()
    return
  }

  loaderComp.showLoader()

  const resData = await fetchUtil.getUserById(userComp.getUserId())

  if (resData != null) {
    const main = document.querySelector('main')

    headerComp.getHeader()
    main.innerHTML = `<section class="flex ${
      stringsUtil.USER_HEADERS.profile.id
    }"><h2>${
      stringsUtil.USER_HEADERS.profile.label
    }</h2><div id="content" class="flex">${userComp.getUserInfo(
      resData.data,
      false
    )}</div></section>`
    main.innerHTML = main.innerHTML
      .replaceAll('<h4>', '<h3>')
      .replaceAll('</h4>', '</h3>')

    fieldComp.checkImgLoad(stringsUtil.USER_FIELDS.avatar.id)
    addUserListeners()
  }

  loaderComp.hideLoader()
}

/* Página "Crear usuario" y "Actualizar usuario" */

export const getCreateUser = (action = stringsUtil.USER_ACTIONS.create) =>
  getCreateUpdateUserContent(action)

const getUpdateUserData = async (id) => {
  if (userComp.isExpiredToken()) {
    userComp.doExpiredTokenActions()
    return
  }

  loaderComp.showLoader()

  const resData = await fetchUtil.getUserById(id)

  if (resData != null) {
    // Si el usuario se actualiza a sí mismo, se actualiza la información necesaria almacenada en el "sessionStorage"
    if (userComp.isMyself(resData.data)) {
      updateSessionStorageUserProperty(
        stringsUtil.USER_FIELDS.name.id,
        resData.data.name
      )
      updateSessionStorageUserProperty(
        stringsUtil.USER_FIELDS.role.id,
        resData.data.role
      )
    }

    getCreateUpdateUserContent(
      stringsUtil.USER_ACTIONS.updateData,
      resData.data
    )
  }

  loaderComp.hideLoader()
}

const getCreateUpdateUserContent = (action, user = null) => {
  headerComp.getHeader()
  document.querySelector('main').innerHTML = `<section class="flex ${
    action.id
  }-${stringsUtil.ENTITIES.user}"><h2>${
    action.label
  }</h2>${getCreateUpdateUserForm(user)}</section>`
  document.forms[0].elements.surnames.focus()

  addCreateUpdateUserListeners(user?._id ?? '')
}

const createUpdateUser = async (id = '') => {
  if (userComp.isExpiredToken()) {
    userComp.doExpiredTokenActions()
    return
  }

  const body = new FormData()
  const password = document.forms[0].elements.password?.value.trim()
  const role = document.forms[0].elements.role?.value
  const avatar = document.forms[0].elements.avatar

  body.append(
    stringsUtil.USER_FIELDS.surnames.id,
    document.forms[0].elements.surnames.value.trim()
  )
  body.append(
    stringsUtil.USER_FIELDS.name.id,
    document.forms[0].elements.name.value.trim()
  )
  body.append(
    stringsUtil.USER_FIELDS.username.id,
    document.forms[0].elements.username.value.trim()
  )

  if (password != null) {
    body.append(stringsUtil.USER_FIELDS.password.id, password)
  }

  body.append(
    stringsUtil.USER_FIELDS.email.id,
    document.forms[0].elements.email.value.trim()
  )

  if (role != null) {
    body.append(stringsUtil.USER_FIELDS.role.id, role)
  }

  if (avatar.files.length > 0) {
    body.append(stringsUtil.USER_FIELDS.avatar.id, avatar.files[0])
  }

  loaderComp.showLoader()

  const resData =
    id === ''
      ? await fetchUtil.createUser(body)
      : await fetchUtil.updateUserById(id, body)

  if (resData != null) {
    messageComp.showAlertDialog(
      id === '' ? resData.msg : 'Datos actualizados correctamente',
      // Después de registrarse un usuario nuevo se realiza el inicio de sesión del mismo
      userComp.getUser() == null
        ? loginPage.loginUser
        : id !== ''
        ? () => getUpdateUserData(id)
        : () => {}
    )
  }

  loaderComp.hideLoader()
}

/* Página "Actualizar contraseña" */

const getUpdateUserPassword = async (id) => {
  if (userComp.isExpiredToken()) {
    userComp.doExpiredTokenActions()
    return
  }

  loaderComp.showLoader()

  const resData = await fetchUtil.getUserById(id)

  if (resData != null) {
    getUpdateUserPasswordContent(resData.data)
  }

  loaderComp.hideLoader()
}

const getUpdateUserPasswordContent = (user) => {
  headerComp.getHeader()
  document.querySelector('main').innerHTML = `<section class="flex ${
    stringsUtil.USER_ACTIONS.updatePassword.id
  }-${stringsUtil.ENTITIES.user}"><h2>${
    stringsUtil.USER_ACTIONS.updatePassword.label
  }${
    // Si se está actualizando otro usuario (usuario "admin") se muestra quién es en el título de la página
    !userComp.isMyself(user)
      ? ' del usuario ' + userComp.getUserFullName(user)
      : ''
  }</h2>${getUpdateUserPasswordForm()}</section>`
  document.forms[0].elements.password.focus()

  addUpdateUserPasswordListeners(user._id)
}

const updateUserPassword = async (id) => {
  if (userComp.isExpiredToken()) {
    userComp.doExpiredTokenActions()
    return
  }

  const body = {}

  body.password = document.forms[0].elements.password.value.trim()

  loaderComp.showLoader()

  let resData = await fetchUtil.updateUserById(id, body)

  if (resData != null) {
    messageComp.showAlertDialog('Contraseña actualizada correctamente')
  }

  loaderComp.hideLoader()
}

/* Borrar usuario */

const getDeleteUser = (id) =>
  messageComp.showConfirmDialog('¿Deseas eliminar el usuario?', () =>
    deleteUser(id)
  )

const deleteUser = async (id) => {
  if (userComp.isExpiredToken()) {
    userComp.doExpiredTokenActions()
    return
  }

  loaderComp.showLoader()

  const resData = await fetchUtil.deleteUserById(id)

  if (resData != null) {
    messageComp.showAlertDialog(resData.msg)

    const ul = document.getElementById(`${stringsUtil.ENTITIES.user}-${id}`)
      .parentNode.parentNode

    document.getElementById(
      `${stringsUtil.ENTITIES.user}-${id}`
    ).parentNode.outerHTML = ''

    if (ul.innerHTML === '') {
      ul.outerHTML = `<div class="flex msg negrita">${USERS_NOT_FOUND_MSG}</div>`
    }
  }

  loaderComp.hideLoader()
}

/* Formularios */

const getCreateUpdateUserForm = (user = null) => {
  let createUpdateUserForm = `<form name="${
    user == null
      ? stringsUtil.USER_ACTIONS.create.id
      : stringsUtil.USER_ACTIONS.updateData.id
  }" class="flex" method="post"><div class="required-note"><span class="required">*</span> ${
    stringsUtil.MANDATORY_FIELDS_MSG
  }</div><div class="flex">${fieldComp.getTextField({
    label: stringsUtil.USER_FIELDS.surnames.label,
    id: stringsUtil.USER_FIELDS.surnames.id,
    value: user != null ? user.surnames : ''
  })}</div><div class="flex">${fieldComp.getTextField({
    label: stringsUtil.USER_FIELDS.name.label,
    id: stringsUtil.USER_FIELDS.name.id,
    value: user != null ? user.name : ''
  })}</div><div class="flex">${fieldComp.getTextField({
    label: stringsUtil.USER_FIELDS.username.label,
    id: stringsUtil.USER_FIELDS.username.id,
    value: user != null ? user.username : ''
  })}</div>`

  // Sólo se muestra la contraseña en la creación de usuarios
  if (user == null) {
    createUpdateUserForm += `<div class="flex">${fieldComp.getTextField({
      label: stringsUtil.USER_FIELDS.password.label,
      id: stringsUtil.USER_FIELDS.password.id,
      type: 'password'
    })}</div>`
  }

  createUpdateUserForm += `<div class="flex">${fieldComp.getTextField({
    label: stringsUtil.USER_FIELDS.email.label,
    id: stringsUtil.USER_FIELDS.email.id,
    value: user != null ? user.email : ''
  })}</div>`

  // Sólo se muestra el rol para usuarios "admin" en la actualización de usuarios
  // Un usuario siempre se crea con rol "user" por defecto
  if (userComp.isAdminUser() && user != null) {
    createUpdateUserForm += `<div class="flex">${fieldComp.getSelectField({
      label: stringsUtil.USER_FIELDS.role.label,
      id: stringsUtil.USER_FIELDS.role.id,
      options: Object.entries(userComp.ALLOWED_ROLES).map(([id, title]) => ({
        id,
        title
      })),
      isRequired: true,
      value: user != null ? user.role : ''
    })}</div>`
  }

  createUpdateUserForm += `<div class="flex">${fieldComp.getFileField({
    label: stringsUtil.USER_FIELDS.avatar.label,
    id: stringsUtil.USER_FIELDS.avatar.id
  })}</div><div class="flex">${fieldComp.getSubmitButton(
    user == null
      ? stringsUtil.USER_ACTIONS.create.id
      : stringsUtil.USER_ACTIONS.updateData.id,
    user == null
      ? stringsUtil.USER_ACTIONS.create.label
      : stringsUtil.USER_ACTIONS.updateData.label
  )}</div></form>`

  return createUpdateUserForm
}

const getUpdateUserPasswordForm = () =>
  `<form name="${
    stringsUtil.USER_ACTIONS.updatePassword.id
  }" class="flex" method="post"><div class="required-note"><span class="required">*</span> ${
    stringsUtil.MANDATORY_FIELDS_MSG
  }</div><div class="flex">${fieldComp.getTextField({
    label: stringsUtil.USER_FIELDS.password.label,
    id: stringsUtil.USER_FIELDS.password.id,
    type: 'password',
    isVisible: false
  })}</div><div class="flex">${fieldComp.getSubmitButton(
    stringsUtil.USER_ACTIONS.updatePassword.id,
    stringsUtil.USER_ACTIONS.updatePassword.label
  )}</div></form>`

/* Utilidades */

export const getUsers = (resData) => {
  const content = document.getElementById('content')

  // Los usuarios se muestran clasificados por rol
  // Se puede omitir el usuario "superadmin"
  for (const role of Object.values(
    userComp.SHOW_SUPERADMIN_USER ? userComp.ROLES : userComp.ALLOWED_ROLES
  ).reverse()) {
    content.innerHTML += `<h3>${
      role === userComp.ROLES.superadmin
        ? stringsUtil.USER_HEADERS.users.label.slice(0, -1)
        : stringsUtil.USER_HEADERS.users.label
    } "${role}"</h3>`

    const users = resData.data.filter((user) => user.role === role)

    if (users.length === 0) {
      content.innerHTML += `<div class="flex msg negrita">${USERS_NOT_FOUND_MSG}</div>`
    } else {
      const ul = document.createElement('ul')

      ul.classList.add('flex')

      for (const user of users) {
        const li = document.createElement('li')

        li.innerHTML = userComp.getUserInfo(user)
        ul.appendChild(li)
      }

      content.innerHTML += ul.outerHTML
    }
  }

  fieldComp.checkImgLoad(stringsUtil.USER_FIELDS.avatar.id)
  addUserListeners()
}

const updateSessionStorageUserProperty = (prop, value) => {
  const user = JSON.parse(sessionStorage.getItem(stringsUtil.ENTITIES.user))
  user[prop] = value
  sessionStorage.setItem(stringsUtil.ENTITIES.user, JSON.stringify(user))
}

/* Escuchadores de eventos */

const addUserListeners = (id = '') => {
  listenersUtil.addPreventDefault()
  listenersUtil.addCollapsible(stringsUtil.ENTITIES.user, id)

  // Botón "Actualizar datos"
  document
    .querySelectorAll(
      `${
        id !== '' ? '#' + stringsUtil.ENTITIES.user + '-' + id + ' ' : ''
      }a[id^="${stringsUtil.USER_ACTIONS.updateData.id}-"]`
    )
    .forEach((btn) => {
      btn.addEventListener('click', () =>
        getUpdateUserData(
          btn.id.replace(`${stringsUtil.USER_ACTIONS.updateData.id}-`, '')
        )
      )
    })

  // Botón "Actualizar contraseña"
  document
    .querySelectorAll(
      `${
        id !== '' ? '#' + stringsUtil.ENTITIES.user + '-' + id + ' ' : ''
      }a[id^="${stringsUtil.USER_ACTIONS.updatePassword.id}-"]`
    )
    .forEach((btn) => {
      btn.addEventListener('click', () =>
        getUpdateUserPassword(
          btn.id.replace(`${stringsUtil.USER_ACTIONS.updatePassword.id}-`, '')
        )
      )
    })

  // Botón "Eliminar usuario"
  document
    .querySelectorAll(
      `${
        id !== '' ? '#' + stringsUtil.ENTITIES.user + '-' + id + ' ' : ''
      }a[id^="${stringsUtil.USER_ACTIONS.delete.id}-"]`
    )
    .forEach((btn) => {
      btn.addEventListener('click', () =>
        getDeleteUser(
          btn.id.replace(`${stringsUtil.USER_ACTIONS.delete.id}-`, '')
        )
      )
    })
}

// Botón "Crear usuario"
const addCreateUserButtonListeners = () =>
  document
    .querySelector(`#${stringsUtil.USER_ACTIONS.create.id}`)
    .addEventListener('click', () => getCreateUser())

// Botón del formulario de creación y actualización de usuarios
const addCreateUpdateUserListeners = (id = '') => {
  listenersUtil.addPreventDefault()
  listenersUtil.addFileFieldChange(document.forms[0].elements.avatar)
  document.forms[0].elements.submit.addEventListener('click', () =>
    createUpdateUser(id)
  )
}

// Botón del formulario de actualización de contraseña
const addUpdateUserPasswordListeners = (id) => {
  listenersUtil.addPreventDefault()
  document.forms[0].elements.submit.addEventListener('click', () =>
    updateUserPassword(id)
  )
}
