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
    me: '/loginController/check',
    me2: '/loginController/me',
    login: '/loginController/login',
    login2: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/loginController/logout',
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
    session: 'usuario/session',
    list: 'Usuario/getUsers',
    update: 'Usuario/updateUser',
    areas: 'Usuario/getAreas',
    batch: 'Usuario/insertBatchUsers',
    names: 'Usuario/getNameUser',
    puesto: '/generalController/getPuesto',
    sede: '/generalController/getSede',
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
    contact: 'Usuario/getSpecialistContact',
  },
  calendario: {
    getAllEvents: 'calendarioController/getAllEvents',
    saveOccupied: 'calendarioController/saveOccupied',
    updateOccupied: 'calendarioController/updateOccupied',
    updateAppointment: 'calendarioController/updateAppointment',
    deleteOccupied: 'calendarioController/deleteOccupied',
    cancelAppointment: 'calendarioController/cancelAppointment',
    createAppointment: 'calendarioController/createAppointment',
    appointmentDrop: 'calendarioController/appointmentDrop',
    occupiedDrop: 'calendarioController/occupiedDrop',
    endAppointment: 'calendarioController/endAppointment',
    getReasons: 'calendarioController/getReasons',
    getPendingEnd: 'calendarioController/getPendingEnd',
    getEventReasons: 'calendarioController/getEventReasons',
    registrarTransaccion: 'calendarioController/registrarTransaccionPago',
    checkInvoice: 'calendarioController/checkInvoice',
    mailEspecialista: 'calendarioController/sendMail',
    updateDetallePaciente: 'calendarioController/updateDetallePaciente'
  },
  calendarioColaborador: {
    isPrimeraCita: 'calendarioController/isPrimeraCita',
    getOficina: 'calendarioController/getOficinaByAtencion',
    getCitasExtras: 'calendarioController/getCitasExtrasUsuario',
    getHorarioBeneficio: 'calendarioController/getHorarioBeneficio',
    getAllEventsWithRange: 'calendarioController/getAllEventsWithRange',
    getAppointmentsByUser: 'calendarioController/getAppointmentsByUser',
    getCitasFinalizadas: 'calendarioController/getCitasFinalizadasUsuario',
    getCitasSinFinalizar: 'calendarioController/getCitasSinFinalizarUsuario',
    getAtencionPorSede: 'calendarioController/getAtencionPorSede',
    createAppointment: 'calendarioController/createAppointmentByColaborator',
    registrarDetallePago: 'calendarioController/registrarTransaccionPago',
    getLastAppointment: 'calendarioController/getLastAppointment',
    updateAppointment: 'calendarioController/updateAppointmentData',
    getPendientes: 'calendarioController/getPendientes',
    updateDetail: 'calendarioController/updateDetallePaciente',
  },
  reportes: {
    lista: '/reportesController/citas',
    especialistas: '/generalController/especialistas',
    observacion: '/reportesController/observacion',
    pacientes: '/reportesController/getPacientes',
    citas: '/generalController/getAppointmentHistory',
    getEstatusPaciente: '/generalController/getEstatusPaciente',
    updateEstatusPaciente: '/generalController/updateEstatusPaciente',
  },
  dashboard: {
    usersCount: '/generalController/usrCount',
    citasCount: '/generalController/citasCount',
    citasEstatus: '/dashboardController/citasCountStatus',
    estatusTotal: '/dashboardController/totalStatusCitas',
    fechaMinima: '/dashboardController/fechaMinima',
    fechaAsistencia: '/dashboardController/estatusFechaAsistencia',
    fechaCancelada: '/dashboardController/estatusFechaCancelada',
    fechaPenalizada: '/dashboardController/estatusFechaPenalizada',
    citasAnual: '/dashboardController/citasAnual',
    getPregunta: '/dashboardController/getPregunta',
    getRespuestas: '/dashboardController/getRespuestas',
    getCountRespuestas: '/dashboardController/getCountRespuestas',
    getPacientes: '/generalController/getPacientes',
    getCtAsistidas: '/generalController/getCtAsistidas',
    getCtCanceladas: '/generalController/getCtCanceladas',
    getCtPenalizadas: '/generalController/getCtPenalizadas',
    getMetas: '/dashboardController/getMetas',
  },
  encuestas: {
    encuestaInsert: '/encuestasController/encuestaInsert',
    getRespuestas: '/encuestasController/getRespuestas',
    encuestaCreate: '/encuestasController/encuestaCreate',
    encuestaMinima: '/encuestasController/encuestaMinima',
    getEncuesta: '/encuestasController/getEncuesta',
    getResp1: '/encuestasController/getResp1',
    getResp2: '/encuestasController/getResp2',
    getResp3: '/encuestasController/getResp3',
    getResp4: '/encuestasController/getResp4',
    getEncNotificacion: '/encuestasController/getEncNotificacion',
    getPuestos: '/encuestasController/getPuestos',
    getEcuestaValidacion: '/encuestasController/getEcuestaValidacion',
    getEncuestasCreadas: '/encuestasController/getEncuestasCreadas',
    updateEstatus: '/encuestasController/updateEstatus',
    updateVigencia: '/encuestasController/updateVigencia',
    getEstatusUno: '/encuestasController/getEstatusUno',
    getValidEncContestada: '/encuestasController/getValidEncContestada',
    sendMail: '/encuestasController/sendMail',
  },
};
