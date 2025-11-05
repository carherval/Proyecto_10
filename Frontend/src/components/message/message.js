import './message.css'

import Swal from 'sweetalert2'

const DIALOG_LABELS = { accept: 'Aceptar', cancel: 'Cancelar' }

// Las acciones a ejecutar después de aceptar o cancelar el mensaje son opcionales
export const showAlertDialog = (dialogTitle, doActions = () => {}) =>
  Swal.fire({
    title: dialogTitle,
    confirmButtonText: DIALOG_LABELS.accept
  }).then((result) => {
    if (result.isConfirmed || result.isDismissed) {
      doActions()
    }
  })

export const showConfirmDialog = (dialogTitle, doActions) =>
  Swal.fire({
    title: dialogTitle,
    confirmButtonText: DIALOG_LABELS.accept,
    showCancelButton: true,
    cancelButtonText: DIALOG_LABELS.cancel
  }).then((result) => {
    if (result.isConfirmed) {
      doActions()
    }
  })
