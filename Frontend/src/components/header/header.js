import './header.css'

import * as userComp from '../user/user'
import * as eventsPage from '../../pages/events'
import * as loginPage from '../../pages/login'
import * as usersPage from '../../pages/users'
import * as stringsUtil from '../../utils/strings'

export const getHeader = (isAuth = true) => {
  const user = userComp.getUser()
  const header = document.querySelector('header')

  let headerContent = `<h1>${document.title}</h1><div class="flex"><div id="greeting"></div><nav><ul class="flex"><li><a id="nav-${stringsUtil.EVENT_HEADERS.events.id}" href="#">${stringsUtil.EVENT_HEADERS.events.label}</a></li>`

  // Sólo para usuarios que han iniciado sesión
  headerContent +=
    isAuth && user != null
      ? `<li><a id="nav-${stringsUtil.EVENT_HEADERS.myEvents.id}" href="#">${stringsUtil.EVENT_HEADERS.myEvents.label}</a></li>`
      : ''

  // Sólo para usuarios "admin"
  headerContent +=
    isAuth && userComp.isAdminUser()
      ? `<li><a id="nav-${stringsUtil.USER_HEADERS.users.id}" href="#">${stringsUtil.USER_HEADERS.users.label}</a></li>`
      : ''

  // Sólo para usuarios que han iniciado sesión
  headerContent +=
    isAuth && user != null
      ? `<li><a id="nav-${stringsUtil.USER_HEADERS.profile.id}" href="#">${stringsUtil.USER_HEADERS.profile.label}</a></li>`
      : ''

  headerContent +=
    !isAuth || user == null
      ? `<li><a id="nav-${stringsUtil.USER_HEADERS.login.id}" href="#">${stringsUtil.USER_HEADERS.login.label}</a></li><li><a id="nav-${stringsUtil.USER_HEADERS.register.id}" href="#">${stringsUtil.USER_HEADERS.register.label}</a></li>`
      : `<li><a id="nav-${stringsUtil.USER_HEADERS.logout.id}" href="#">${stringsUtil.USER_HEADERS.logout.label}</a></li>`

  headerContent += '</ul></nav></div>'

  header.classList.add('flex', 'header')
  header.innerHTML = headerContent

  const greeting = document.getElementById('greeting')

  isAuth && user != null
    ? (greeting.innerHTML = `Hola, ${user.name}`)
    : (greeting.outerHTML = '')

  addHeaderListeners()
}

/* Escuchadores de eventos */

const addHeaderListeners = () => {
  document
    .querySelector(`#nav-${stringsUtil.EVENT_HEADERS.events.id}`)
    .addEventListener('click', () => eventsPage.getAllEvents())
  document
    .querySelector(`#nav-${stringsUtil.EVENT_HEADERS.myEvents.id}`)
    ?.addEventListener('click', () => eventsPage.getMyEvents())
  document
    .querySelector(`#nav-${stringsUtil.USER_HEADERS.users.id}`)
    ?.addEventListener('click', () => usersPage.getAllUsers())
  document
    .querySelector(`#nav-${stringsUtil.USER_HEADERS.profile.id}`)
    ?.addEventListener('click', () => usersPage.getProfile())
  document
    .querySelector(`#nav-${stringsUtil.USER_HEADERS.login.id}`)
    ?.addEventListener('click', () => loginPage.getLogin())
  document
    .querySelector(`#nav-${stringsUtil.USER_HEADERS.register.id}`)
    ?.addEventListener('click', () =>
      usersPage.getCreateUser(stringsUtil.USER_ACTIONS.register)
    )
  document
    .querySelector(`#nav-${stringsUtil.USER_HEADERS.logout.id}`)
    ?.addEventListener('click', () => userComp.logoutUser())
}
