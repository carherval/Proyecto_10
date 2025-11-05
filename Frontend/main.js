import './style.css'

import * as loaderComp from './src/components/loader/loader'
import * as messageComp from './src/components/message/message'
import * as userComp from './src/components/user/user'
import * as eventsPage from './src/pages/events'
import * as loginPage from './src/pages/login'

document.title = 'Gestión de Eventos y Asistentes'
document.body.insertAdjacentHTML('beforeend', loaderComp.getLoader())

loginPage.getLogin()

// Si existe usuario en sesión se detecta si ha expirado o si se recupera dicha sesión
if (userComp.isExpiredToken()) {
  userComp.doExpiredTokenActions()
} else {
  if (userComp.getUser() != null) {
    messageComp.showAlertDialog(
      'Se ha recuperado tu sesión',
      eventsPage.getAllEvents
    )
  }
}
