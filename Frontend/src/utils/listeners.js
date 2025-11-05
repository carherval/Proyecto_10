import * as stringsUtil from '../utils/strings'

/* Escuchadores de eventos genéricos */

// Evita que el formulario recargue la página
export const addPreventDefault = () =>
  document
    .querySelectorAll('button[type="submit"]')
    .forEach((btn) =>
      btn.addEventListener('click', (event) => event.preventDefault())
    )

// Añade el efecto acordeón a los eventos y usuarios
export const addCollapsible = (entity, id = '') => {
  const collapsibleOptions =
    entity === stringsUtil.ENTITIES.event
      ? stringsUtil.EVENT_COLLAPSIBLE_OPTIONS
      : stringsUtil.USER_COLLAPSIBLE_OPTIONS

  document
    .querySelectorAll(
      `${id !== '' ? '#' + entity + '-' + id : ''}.${entity} ${
        entity === stringsUtil.ENTITIES.event ? 'h3' : 'h4'
      }`
    )
    .forEach((header) =>
      header.addEventListener('click', () => {
        header.classList.toggle('opened')
        header.nextElementSibling.classList.toggle('oculto')
        header.title =
          header.title === collapsibleOptions.open
            ? collapsibleOptions.close
            : collapsibleOptions.open
      })
    )
}

// Muestra el nombre del archivo cuando se selecciona en un formulario
export const addFileFieldChange = (fileField) =>
  fileField.addEventListener(
    'change',
    () =>
      (document.getElementById('file-name').innerHTML =
        fileField.files.length > 0
          ? fileField.files[0].name
          : stringsUtil.FILE_NOT_SELECTED_MSG)
  )
