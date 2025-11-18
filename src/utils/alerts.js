import Swal from 'sweetalert2';

/**
 * Affiche une alerte simple
 */
export const showAlert = (title, text, icon = 'info', isDarkMode = false) => {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonText: 'OK',
    background: isDarkMode ? '#1f1f1f' : '#fff',
    color: isDarkMode ? '#fff' : '#000',
  });
};

/**
 * Affiche une confirmation avec bouton Annuler
 */
export const showConfirm = async (
  title,
  icon = 'warning',
  confirmButtonText = 'Oui, supprimer',
  text,
  cancelButtonText = 'Annuler',
  isDarkMode = false
) => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    customClass: {
      confirmButton: `px-4 m-4 py-2 rounded-lg text-white bg-red-500`,
      cancelButton: `px-4 m-4 py-2 rounded-lg text-white bg-gray-500`,
    },
    buttonsStyling: false,
    background: isDarkMode ? '#1f1f1f' : '#fff',
    color: isDarkMode ? '#fff' : '#000',
  });

  return result.isConfirmed;
};

/**
 * Confirmation d'information sans bouton Annuler
 */
export const showConfirmInf = async (
  title,
  icon = 'info',
  confirmButtonText = 'Terminé',
  text,
  isDarkMode = false
) => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: false,
    confirmButtonText,
    customClass: {
      confirmButton: `px-4 m-4 py-2 rounded-lg text-white bg-emerald-500`,
    },
    buttonsStyling: false,
    background: isDarkMode ? '#1f1f1f' : '#fff',
    color: isDarkMode ? '#fff' : '#000',
  });

  return result.isConfirmed;
};

/**
 * Toast d'information
 */
export const showToast = (message, icon = 'success', isDarkMode = false) => {
  return Swal.fire({
    toast: true,
    position: 'bottom-right',
    icon,
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: isDarkMode ? '#1f1f1f' : '#fff',
    color: isDarkMode ? '#fff' : '#000',
  });
};

/**
 * Toast d'erreur
 */
export const showToastErr = (message, icon = 'error', isDarkMode = false) => {
  return Swal.fire({
    toast: true,
    position: 'bottom-left',
    icon,
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: isDarkMode ? '#1f1f1f' : '#fff',
    color: isDarkMode ? '#fff' : '#000',
  });
};

/**
 * Affiche une erreur classique
 */
export const showError = (message = 'Une erreur est survenue.', title = 'Erreur', isDarkMode = false) => {
  return Swal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonText: 'Fermer',
    background: isDarkMode ? '#1f1f1f' : '#fff',
    color: isDarkMode ? '#fff' : '#000',
  });
};
