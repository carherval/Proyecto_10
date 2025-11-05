export const MANDATORY_FIELDS_MSG = 'Campos obligatorios'
export const FILE_NOT_SELECTED_MSG = 'Ningún archivo seleccionado'

export const ENTITIES = { event: 'event', user: 'user' }

export const EVENT_HEADERS = {
  events: { id: 'events', label: 'Eventos' },
  myEvents: { id: 'my-events', label: 'Mis eventos' }
}

export const EVENT_FIELDS = {
  title: { id: 'title', label: 'Título' },
  poster: { id: 'poster', label: 'Cartel' },
  date: { id: 'date', label: 'Fecha' },
  time: { id: 'time', label: 'Hora' },
  headquarters: { id: 'headquarters', label: 'Sede' },
  dateHeadquarters: { id: 'date-headquarters', label: 'Fecha y sede' },
  description: { id: 'description', label: 'Descripción' },
  users: { id: 'users', label: 'Asistentes' },
  author: { id: 'author', label: 'Autor' },
  field: { id: 'field', label: 'Campo' },
  order: { id: 'order', label: 'Orden' }
}

export const EVENT_ACTIONS = {
  filter: { id: 'filter', label: 'Filtrar' },
  create: { id: 'create', label: 'Crear evento' },
  update: { id: 'update', label: 'Actualizar evento' },
  delete: { id: 'delete', label: 'Eliminar evento' },
  attend: { id: 'attend', label: 'Asistir al evento' },
  unattend: { id: 'unattend', label: 'Dejar de asistir al evento' }
}

export const EVENT_COLLAPSIBLE_OPTIONS = {
  open: 'Abrir evento',
  close: 'Cerrar evento'
}

export const USER_HEADERS = {
  users: { id: 'users', label: 'Usuarios' },
  profile: { id: 'profile', label: 'Mi perfil' },
  register: { id: 'register', label: 'Registrarse' },
  login: { id: 'login', label: 'Inicio de sesión' },
  logout: { id: 'logout', label: 'Logout' }
}

export const USER_FIELDS = {
  surnames: { id: 'surnames', label: 'Apellidos' },
  name: { id: 'name', label: 'Nombre' },
  username: { id: 'username', label: 'Nombre de usuario' },
  avatar: { id: 'avatar', label: 'Imagen de perfil' },
  password: { id: 'password', label: 'Contraseña' },
  email: { id: 'email', label: 'Correo electrónico' },
  role: { id: 'role', label: 'Rol' }
}

export const USER_ACTIONS = {
  login: { id: 'login', label: 'Login' },
  register: { id: 'create', label: 'Registrarse' },
  create: { id: 'create', label: 'Crear usuario' },
  update: { id: 'update', label: 'Actualizar usuario' },
  updateData: { id: 'update-data', label: 'Actualizar datos' },
  updatePassword: { id: 'update-password', label: 'Actualizar contraseña' },
  delete: { id: 'delete', label: 'Eliminar usuario' }
}

export const USER_COLLAPSIBLE_OPTIONS = {
  open: 'Abrir usuario',
  close: 'Cerrar usuario'
}

export const SORT_FIELDS = [
  { id: 'title', title: 'Título' },
  { id: 'date', title: 'Fecha' }
]

export const SORT_ORDERS = [
  { id: 'asc', title: 'Ascendente' },
  { id: 'desc', title: 'Descendente' }
]
