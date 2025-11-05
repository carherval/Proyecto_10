import './field.css'

import * as stringsUtil from '../../utils/strings'

// Si el "label" no es visible se muestra el "placeholder" del campo
export const getTextField = ({
  label,
  id,
  type = 'text',
  isVisible = true,
  isRequired = true,
  value = ''
} = {}) =>
  `<label${!isVisible ? ' class="oculto"' : ''} for="${id}">${label}${
    isRequired ? ' <span class="required">*</span>' : ''
  }</label><input id="${id}" class="txt-fld" type="${type}" name="${id}"${
    !isVisible ? ' placeholder="' + label + (isRequired ? ' *' : '') + '"' : ''
  }${type === 'password' ? ' autocomplete="off"' : ''}${
    value !== '' ? ' value="' + value + '"' : ''
  } />`

// Si el "label" no es visible se muestra el "placeholder" del campo
export const getTextAreaField = ({
  label,
  id,
  isVisible = true,
  isRequired = true,
  value = ''
} = {}) =>
  `<label${!isVisible ? ' class="oculto"' : ''} for="${id}">${label}${
    isRequired ? ' <span class="required">*</span>' : ''
  }</label><textarea id="${id}" class="txt-area-fld" name="${id}"${
    !isVisible ? ' placeholder="' + label + (isRequired ? ' *' : '') + '"' : ''
  }>${value !== '' ? value : ''}</textarea>`

export const getSelectField = ({
  label,
  id,
  options,
  isVisible = true,
  isRequired = false,
  value = ''
} = {}) => {
  const select = document.createElement('select')

  select.id = id
  select.classList.add('slct-fld')

  for (const option of options) {
    select.innerHTML += `<option value="${option.id}"${
      option.id === value ? ' selected' : ''
    }>${option.title}</option>`
  }

  return `<label${!isVisible ? ' class="oculto"' : ''} for="${id}">${label}${
    isRequired ? ' <span class="required">*</span>' : ''
  }</label>${select.outerHTML}`
}

export const getFileField = ({
  label,
  id,
  isVisible = false,
  isRequired = false
} = {}) =>
  `<label${!isVisible ? ' class="oculto"' : ''} for="${id}">${label}${
    isRequired ? ' <span class="required">*</span>' : ''
  }</label><input id="${id}" class="oculto" type="file" name="${id}" />
  <div class="flex file-fld"><label class="flex btn-lnk" for="${id}">${label}</label>
  <span id="file-name">${stringsUtil.FILE_NOT_SELECTED_MSG}</span></div>`

export const getSubmitButton = (id, label) =>
  `<button id="${id}" class="flex btn" type="submit" name="submit">${label}</button>`

export const getButtonLink = (id, label) =>
  `<a class="flex btn-lnk" id="${id}" href="#">${label}</a>`

/* Utilidades */

// Comprueba si existe la imagen antes de cargarla o no
export const checkImgLoad = (className) =>
  document.querySelectorAll(`.${className} > img`).forEach((img) => {
    const image = new Image()

    image.src = img.src

    image.onerror = () => {
      img.parentNode.outerHTML = ''
    }
  })
