import './user.css'

import * as fieldComp from '../field/field'
import * as messageComp from '../message/message'
import * as loginPage from '../../pages/login'
import * as stringsUtil from '../../utils/strings'

// Minutos
const EXPIRATION_TIME = 15
export const SHOW_SUPERADMIN_USER = false

export const ROLES = { user: 'user', admin: 'admin', superadmin: 'superadmin' }
export const { superadmin, ...ALLOWED_ROLES } = ROLES
const { user, ...ADMIN_ROLES } = ROLES

export const getUser = () => {
  try {
    return JSON.parse(
      sessionStorage.getItem(stringsUtil.ENTITIES.user) ?? 'null'
    )
  } catch {
    return null
  }
}

export const getUserToken = () => getUser()?.token

export const getUserId = () => getUser()?._id

export const logoutUser = () =>
  messageComp.showConfirmDialog('¿Deseas cerrar la sesión?', () => {
    sessionStorage.removeItem(stringsUtil.ENTITIES.user)
    loginPage.getLogin()
  })

export const isExpiredToken = () =>
  getUser() != null &&
  Date.now() - getUser().tokenExpiredDate > EXPIRATION_TIME * 60 * 1000

export const doExpiredTokenActions = (doActions = loginPage.getLogin) => {
  sessionStorage.removeItem(stringsUtil.ENTITIES.user)
  messageComp.showAlertDialog('Tu sesión ha expirado', doActions)
}

export const getUserFullName = (user, showUserName = true) =>
  `${user.surnames}, ${user.name}${
    showUserName ? ' (' + user.username + ')' : ''
  }`

export const isAdminUser = (user = getUser()) =>
  Object.values(ADMIN_ROLES).includes(user?.role)

export const isSuperadminUser = (user = getUser()) =>
  user?.role === ROLES.superadmin

export const isMyself = (user) => getUserId() === user._id

export const isEventAttendee = (event, user = getUser()) =>
  event.users.some((eventUser) => eventUser._id === user?._id)

export const isEventAuthor = (event) => getUserId() === event.author._id

// "isCollapsible" indica si se muestra la información del usuario en forma de acordeón o no
export const getUserInfo = (user, isCollapsible = true) => {
  let userContent = `<article id="${stringsUtil.ENTITIES.user}-${
    user._id
  }" class="flex ${stringsUtil.ENTITIES.user}"><h4${
    isCollapsible
      ? ' title="' + stringsUtil.USER_COLLAPSIBLE_OPTIONS.open + '"'
      : ''
  }>${getUserFullName(user, false)}</h4><div class="flex${
    isCollapsible ? ' oculto' : ''
  }"><div class="flex content"><div class="flex avatar"><img src="${
    user.avatar
  }" alt="${getUserFullName(user)}" title="${getUserFullName(
    user
  )}" /></div><div class="flex info"><div class="flex field"><div class="flex label">${
    stringsUtil.USER_FIELDS.username.label
  }:</div><div class="flex value">${
    user.username
  }</div></div><div class="flex field"><div class="flex label">${
    stringsUtil.USER_FIELDS.email.label
  }:</div><div class="flex value">${user.email}</div></div>`

  // Sólo se muestra el rol en el perfil de usuario, no en el listado de usuarios clasificados por rol
  if (!isCollapsible) {
    userContent += `<div class="flex field"><div class="flex label">${stringsUtil.USER_FIELDS.role.label}:</div><div class="flex value">${user.role}</div></div>`
  }

  let userButtons = ''

  // El usuario "superadmin" no se puede actualizar ni eliminar
  if (!isSuperadminUser(user)) {
    // El usuario sólo puede ser actualizado por un usuario "admin" o por el propio usuario
    if (isAdminUser() || isMyself(user)) {
      userButtons +=
        fieldComp.getButtonLink(
          `${stringsUtil.USER_ACTIONS.updateData.id}-${user._id}`,
          stringsUtil.USER_ACTIONS.updateData.label
        ) +
        fieldComp.getButtonLink(
          `${stringsUtil.USER_ACTIONS.updatePassword.id}-${user._id}`,
          stringsUtil.USER_ACTIONS.updatePassword.label
        )
    }

    // El usuario sólo puede ser eliminado por un usuario "admin" y un usuario no se puede eliminar a sí mismo
    if (isAdminUser() && !isMyself(user)) {
      userButtons += fieldComp.getButtonLink(
        `${stringsUtil.USER_ACTIONS.delete.id}-${user._id}`,
        stringsUtil.USER_ACTIONS.delete.label
      )
    }
  }

  userContent +=
    userButtons !== ''
      ? `</div></div><div class="flex buttons">${userButtons}</div></div></article>`
      : '</div></div></div></article>'

  return userContent
}
