export const routes = {
  auth: {
    login: '/login',
    logout: '/logout',
    register: '/register',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    me: '/user',
    changePassword: '/change-password',
    refreshToken: '/refresh-token',
  },

  templates: {
    downloadDiscounts: '/download-discounts-template',
    downloadExpenses: '/download-expenses-template',
  },

  invoices: {
    base: '/facturas',
    importar: '/facturas/importar',
    importarXml: '/facturas/importar-xml',
    streamXml: '/facturas/importar-xml/stream',
    importarTxt: '/facturas/importar-txt',
    streamTxt: '/facturas/importar-txt/stream',
    pdf: (id: number | string) => `/invoices/${id}/pdf`,
    viewPdf: (id: number | string) => `/invoices/${id}/view`,
  },

  latinium: {
    accounts: '/latinium/accounts',
    projects: '/latinium/projects',
    centroCosto: '/latinium/centro-costo',
    actualizarProveedores: '/latinium/proveedores',
    actualizarEstadoContable: '/latinium/estado-contable',
  },

  users: {
    index: '/users',
    store: '/users',
    show: (id: number | string) => `/users/${id}`,
    update: (id: number | string) => `/users/${id}`,
    destroy: (id: number | string) => `/users/${id}`,
    updatePermissions: (id: number | string) => `/users/${id}/permissions`,
    getPermissions: (id: number | string) => `/users/${id}/permissions`,
    getProjects: (id: number | string) => `/users/${id}/projects`,
    assignProjects: (id: number | string) => `/users/${id}/projects`,
    patch: (id: number | string) => `/users/${id}`,
  },

  roles: {
    index: '/roles',
    store: '/roles',
    show: (id: number | string) => `/roles/${id}`,
    update: (id: number | string) => `/roles/${id}`,
    destroy: (id: number | string) => `/roles/${id}`,
    permissions: (id: number | string) => `/roles/${id}/permissions`,
    updatePermissions: (id: number | string) => `/roles/${id}/permissions`,
  },

  permissions: {
    index: '/permissions',
    store: '/permissions',
    show: (id: number | string) => `/permissions/${id}`,
    update: (id: number | string) => `/permissions/${id}`,
    destroy: (id: number | string) => `/permissions/${id}`,
    assignToRole: (id: number | string) => `/permissions/${id}/assign-to-role`,
  },

  accounts: '/accounts',
  transports: '/transports',
  vehicles: '/vehicles',
  responsibles: '/responsibles',
  areas: '/areas',

  requests: {
    base: '/requests',
    uploadDiscounts: '/requests/upload-discounts',
    importExcel: '/requests/import',
    batchDelete: '/requests/batch-delete',
  },

  reposiciones: {
    base: '/reposiciones',
    file: (id: number | string) => `/reposiciones/${id}/file`,
  },

  loans: {
    base: '/loans',
    import: '/loans/import',
  },

  projects: {
    base: '/projects',
    index: '/projects',
    show: (id: number | string) => `/projects/${id}`,
    create: '/projects',
    update: (id: number | string) => `/projects/${id}`,
    delete: (id: number | string) => `/projects/${id}`,
    getUsers: (id: number | string) => `/projects/${id}/users`,
    assignUsers: (id: number | string) => `/projects/${id}/users`,
  },

  reports: {
    generate: '/reports/generate',
  },

  stats: {
    sriDocuments: '/sri-documents-stats',
  },

  documents: {
    generate: '/generate-documents',
  },

  audit: {
    index: '/auditoria',
  },

  sri: {
    updateData: '/update-data',
  },

  debug: {
    general: '/debug',
    cors: '/debug-cors',
    corsFull: '/debug-cors-full',
    env: '/_env',
    serverStatus: '/serverstatus',
  },

  mobile: {
    data: '/mobile/data',
  },

  fallback: {
    options: '*',
  },
}
