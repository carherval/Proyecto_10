import './event.css'

import * as fieldComp from '../field/field'
import * as userComp from '../user/user'
import * as stringsUtil from '../../utils/strings'

// "isOpened" indica si se muestra el acordeón con la información del evento abierto o no
export const getEvent = (event, isOpened = false) => {
  let eventContent = `<article id="${stringsUtil.ENTITIES.event}-${
    event._id
  }" class="flex ${stringsUtil.ENTITIES.event}"><h3${
    isOpened ? ' class="opened"' : ''
  } title="${
    !isOpened
      ? stringsUtil.EVENT_COLLAPSIBLE_OPTIONS.open
      : stringsUtil.EVENT_COLLAPSIBLE_OPTIONS.close
  }">${event.title}</h3><div class="flex${
    !isOpened ? ' oculto' : ''
  }"><div class="flex content"><div class="flex poster"><img src="${
    event.poster
  }" alt="${event.title}" title="${
    event.title
  }" /></div><div class="flex info"><div class="flex field"><div class="flex label">${
    stringsUtil.EVENT_FIELDS.dateHeadquarters.label
  }:</div><div class="flex value">${event.date} a las ${
    event.time
  } horas<br />${
    event.headquarters
  }</div></div><div class="flex field"><div class="flex label">${
    stringsUtil.EVENT_FIELDS.description.label
  }:</div><div class="flex value">${event.description}</div></div>`

  if (event.users != null) {
    eventContent += `<div class="flex field"><div class="flex label">${
      stringsUtil.EVENT_FIELDS.users.label
    }:</div><div class="flex value">${
      event.users.length > 0
        ? event.users
            .map((user) =>
              userComp.getUserFullName(user, userComp.isAdminUser())
            )
            .join('; ')
        : 'No hay asistentes al evento'
    }</div></div>`
  }

  let eventButtons = ''

  if (event.author != null) {
    eventContent += `<div class="flex field"><div class="flex label">${
      stringsUtil.EVENT_FIELDS.author.label
    }:</div><div class="flex value">${
      // Si el autor del evento es el usuario "superadmin" y éste es omitido se muestra su rol, no su nombre de usuario
      event.author.role === userComp.ROLES.superadmin &&
      !userComp.SHOW_SUPERADMIN_USER
        ? event.author.role
        : event.author.username
    }</div></div>`

    // El evento sólo puede ser actualizado y eliminado por su autor o por el usuario "superadmin"
    if (userComp.isEventAuthor(event) || userComp.isSuperadminUser()) {
      eventButtons +=
        fieldComp.getButtonLink(
          `${stringsUtil.EVENT_ACTIONS.update.id}-${event._id}`,
          stringsUtil.EVENT_ACTIONS.update.label
        ) +
        fieldComp.getButtonLink(
          `${stringsUtil.EVENT_ACTIONS.delete.id}-${event._id}`,
          stringsUtil.EVENT_ACTIONS.delete.label
        )
    }
  }

  // Sólo pueden asistir o dejar de asistir a un evento los usuarios que han iniciado sesión
  if (userComp.getUser() != null) {
    if (event.users == null || !userComp.isEventAttendee(event)) {
      eventButtons += fieldComp.getSubmitButton(
        `${stringsUtil.EVENT_ACTIONS.attend.id}-${event._id}`,
        stringsUtil.EVENT_ACTIONS.attend.label
      )
    } else {
      eventButtons += fieldComp.getSubmitButton(
        `${stringsUtil.EVENT_ACTIONS.unattend.id}-${event._id}`,
        stringsUtil.EVENT_ACTIONS.unattend.label
      )
    }
  }

  eventContent +=
    eventButtons !== ''
      ? `</div></div><div class="flex buttons">${eventButtons}</div></div></article>`
      : '</div></div></div></article>'

  return eventContent
}
