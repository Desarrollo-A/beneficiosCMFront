import axios from 'axios';

import { HOST } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST });
axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

const instance = axios.create({ baseURL: HOST });
instance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);
export { instance };

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  const [url, data, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    ...config,
  });

  return res.data;
};

export const fetcherGet = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await instance.get(url, { ...config });

  return res.data;
};

export const fetcherPost = async (args, dataValue) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await instance.post(
    url,
    { dataValue },
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
    { ...config }
  );

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/LoginController/check',
    me2: '/LoginController/me',
    login: '/LoginController/login',
    login2: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/LoginController/logout',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
  user: {
    list: 'Usuario/getUsersExternos',
    session : 'usuario/session',
    authorized : 'usuario/authorized',
    update: 'Usuario/updateUser',
    areas: 'Usuario/getAreas',
    batch: 'Usuario/insertBatchUsers',
    names: 'Usuario/getNameUser',
    puesto: '/GeneralController/getPuesto',
    sede: '/GeneralController/getSede',
    decodePass: '/Usuario/decodePass',
    updatePass: '/Usuario/updatePass',
    menu: 'Usuario/menu',
  },
  benefits: {
    list: 'CalendarioController/getBeneficiosPorSede',
  },
  especialistas: {
    list: 'CalendarioController/getEspecialistaPorBeneficioYSede',
    modalities: 'CalendarioController/getModalidadesEspecialista',
    sedes: 'especialistas/sedes',
    horario: 'especialistas/horario',
    horarios: 'especialistas/horarios',
  },
  calendario: {
    getAllEvents: 'CalendarioController/getAllEvents',
    saveOccupied: 'CalendarioController/saveOccupied',
    updateOccupied: 'CalendarioController/updateOccupied',
    updateAppointment: 'CalendarioController/updateAppointment',
    deleteOccupied: 'CalendarioController/deleteOccupied',
    cancelAppointment: 'CalendarioController/cancelAppointment',
    createAppointment: 'CalendarioController/createAppointment',
    appointmentDrop: 'CalendarioController/appointmentDrop',
    occupiedDrop: 'CalendarioController/occupiedDrop',
    endAppointment: 'CalendarioController/endAppointment',
    getReasons: 'CalendarioController/getReasons',
    getPendingEnd: 'CalendarioController/getPendingEnd',
    getEventReasons: 'CalendarioController/getEventReasons',
    registrarTransaccion: 'CalendarioController/registrarTransaccionPago',
    checkInvoice: 'CalendarioController/checkInvoice',
    mailEspecialista: 'CalendarioController/sendMail',
    updateDetallePaciente: 'CalendarioController/updateDetallePaciente',
    insertGoogleEvent: 'CalendarioController/insertGoogleEvent',
    insertGoogleId: 'CalendarioController/insertGoogleId',
    updateGoogleEvent: 'CalendarioController/updateGoogleEvent',
    deleteGoogleEvent: 'CalendarioController/deleteGoogleEvent',
  },
  calendarioColaborador: {
    isPrimeraCita: 'CalendarioController/isPrimeraCita',
    getOficina: 'CalendarioController/getOficinaByAtencion',
    getCitasExtras: 'CalendarioController/getCitasExtrasUsuario',
    getHorarioBeneficio: 'CalendarioController/getHorarioBeneficio',
    getAllEventsWithRange: 'CalendarioController/getAllEventsWithRange',
    getAppointmentsByUser: 'CalendarioController/getAppointmentsByUser',
    getCitasFinalizadas: 'CalendarioController/getCitasFinalizadasUsuario',
    getCitasSinFinalizar: 'CalendarioController/getCitasSinFinalizarUsuario',
    getCitasSinEvaluar: 'CalendarioController/getCitasSinEvaluarUsuario',
    getAtencionPorSede: 'CalendarioController/getAtencionPorSede',
    createAppointment: 'CalendarioController/createAppointmentByColaborator',
    registrarDetallePago: 'CalendarioController/registrarTransaccionPago',
    getLastAppointment: 'CalendarioController/getLastAppointment',
    updateAppointment: 'CalendarioController/updateAppointmentData',
    getPendientes: 'CalendarioController/getPendientes',
    updateDetail: 'CalendarioController/updateDetallePaciente',
    cancelAppointment: 'CalendarioController/cancelAppointmentUser',
    getCitaById: 'CalendarioController/getCitaById',
    insertGoogleEvent: 'CalendarioController/insertGoogleEvent',
    updateGoogleEvent: 'CalendarioController/updateGoogleEvent',
    deleteGoogleEvent: 'CalendarioController/deleteGoogleEvent',
  },
  reportes: {
    lista: '/ReportesController/citas',
    especialistas: '/GeneralController/especialistas',
    observacion: '/ReportesController/observacion',
    pacientes: '/ReportesController/getPacientes',
    citas: '/GeneralController/getAppointmentHistory',
    getEstatusPaciente: '/GeneralController/getEstatusPaciente',
    updateEstatusPaciente: '/GeneralController/updateEstatusPaciente',
  },
  dashboard: {
    usersCount: '/GeneralController/usrCount',
    citasCount: '/GeneralController/citasCount',
    citasEstatus: '/DashboardController/citasCountStatus',
    estatusTotal: '/DashboardController/totalStatusCitas',
    fechaMinima: '/DashboardController/fechaMinima',
    fechaAsistencia: '/DashboardController/estatusFechaAsistencia',
    fechaCancelada: '/DashboardController/estatusFechaCancelada',
    fechaPenalizada: '/DashboardController/estatusFechaPenalizada',
    citasAnual: '/DashboardController/citasAnual',
    getPregunta: '/DashboardController/getPregunta',
    getRespuestas: '/DashboardController/getRespuestas',
    getCountRespuestas: '/DashboardController/getCountRespuestas',
    getPacientes: '/GeneralController/getPacientes',
    getCtAsistidas: '/GeneralController/getCtAsistidas',
    getCtCanceladas: '/GeneralController/getCtCanceladas',
    getCtPenalizadas: '/GeneralController/getCtPenalizadas',
    getMetas: '/DashboardController/getMetas',
  },
  encuestas: {
    encuestaInsert: '/EncuestasController/encuestaInsert',
    getRespuestas: '/EncuestasController/getRespuestas',
    encuestaCreate: '/EncuestasController/encuestaCreate',
    encuestaMinima: '/EncuestasController/encuestaMinima',
    getEncuesta: '/EncuestasController/getEncuesta',
    getResp1: '/EncuestasController/getResp1',
    getResp2: '/EncuestasController/getResp2',
    getResp3: '/EncuestasController/getResp3',
    getResp4: '/EncuestasController/getResp4',
    getEncNotificacion: '/EncuestasController/getEncNotificacion',
    getPuestos: '/EncuestasController/getPuestos',
    getEcuestaValidacion: '/EncuestasController/getEcuestaValidacion',
    getEncuestasCreadas: '/EncuestasController/getEncuestasCreadas',
    updateEstatus: '/EncuestasController/updateEstatus',
    updateVigencia: '/EncuestasController/updateVigencia',
    getEstatusUno: '/EncuestasController/getEstatusUno',
    getValidEncContestada: '/EncuestasController/getValidEncContestada',
    sendMail: '/EncuestasController/sendMail',
  },
  gestor: {
    getAtencionXsede: '/GeneralController/getAtencionXsede',
    getSedes: '/GeneralController/getSedes',
    getOficinas: '/GeneralController/getOficinas',
    getModalidades: '/GeneralController/getModalidades',
    getSinAsigSede: '/GeneralController/getSinAsigSede',
    getOficinasVal: '/GestorController/getOficinasVal',
    getEspecialistasVal: '/GestorController/getEspecialistasVal',
    getSedeNone: '/GestorController/getSedeNone',
    getSedeNoneEsp: '/GestorController/getSedeNoneEsp',
    insertAtxSede: '/GestorController/insertAtxSede',
    updateModalidad: '/GestorController/updateModalidad',
    updateEspecialista: '/GestorController/updateEspecialista',
    getEsp: '/GestorController/getEsp',
    getAtencionXsedeEsp: '/GestorController/getAtencionXsedeEsp',
    getOfi: '/GestorController/getOficinas',
    updateOficina: '/GestorController/updateOficina',
    insertOficinas: '/GestorController/insertOficinas',
    updateSede: '/GestorController/updateSede',
    insertSedes: '/GestorController/insertSedes'
  },
  avisosPrivacidad : {
    getEspecialidadToSelect : '/AvisosPrivacidadController/getEspecialidades',
    getAvisoDePrivacidad : '/AvisosPrivacidadController/getAvisoPrivacidad',
    actualizarArchivoPrivacidad: '/AvisosPrivacidadController/actualizarArchivoPrivacidad'
  }
};
