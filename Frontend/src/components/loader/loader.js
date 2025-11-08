import './loader.css'

import loader from '../../../assets/images/loader.png'

const LOADING_MSG = 'Espere, por favor...'

export const getLoader = () =>
  `<div id="loader" class="flex oculto"><div class="flex loader"><img src="${loader}" alt="${LOADING_MSG}" /><p class="negrita">${LOADING_MSG}</p></div></div>`

export const showLoader = () => {
  document.getElementById('loader').classList.remove('oculto')
  document.body.classList.add('no-scroll')
}

export const hideLoader = () => {
  document.getElementById('loader').classList.add('oculto')
  document.body.classList.remove('no-scroll')
}
