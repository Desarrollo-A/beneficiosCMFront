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

  const accessToken = localStorage.getItem('accessToken');

  /* const accessToken = localStorage.getItem('accessToken'); */
  /* const fetchConfig = {
    ...config,
    headers: {
      token: accessToken,
    },
  }; */

  const res = await axiosInstance.get(url, data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Token: accessToken,
    },
    ...config,
  });

  return res.data;
};

export const fetcherGet = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];
  /* const accessToken = localStorage.getItem('accessToken'); */
  /* const fetchConfig = {
    ...config,
    headers: {
      token: accessToken,
    },
  }; */

  const accessToken = localStorage.getItem('accessToken');

  const res = await instance.get(url, {
    headers: {
      Token: accessToken,
    },
    ...config,
  });

  return res.data;
};

export const fetcherPost = async (args, dataValue) => {
  const [url, config] = Array.isArray(args) ? args : [args];
  const accessToken = localStorage.getItem('accessToken');

  const res = await instance.post(
    url,
    { dataValue },
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Token: accessToken,
      },
      ...config,
    }
  );

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  api: {
    encodedHash: '/Api/encodedHash',
  },
  auth: {
    me: '/LoginController/check',
    me2: '/LoginController/me',
    getUser: '/Usuario/getUserByNumEmp',
    login: '/LoginController/login',
    login2: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/LoginController/logout',
    registerUser: 'LoginController/addRegistroEmpleado',
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
    updateExternal: 'Usuario/updateExternalUser',
    authorized: 'Usuario/authorized',
    update: 'Usuario/updateUser',
    areas: 'Usuario/getAreas',
    batch: 'Usuario/insertBatchUsers',
    names: 'Usuario/getNameUser',
    decodePass: '/Usuario/decodePass',
    updatePass: '/Usuario/updatePass',
    menu: 'Usuario/menu',
    verificacion: 'Usuario/sendMail',
    token: 'Usuario/GetToken',
  },
  benefits: {
    list: 'CalendarioController/getBeneficiosPorSede',
  },
  especialistas: {
    list: 'CalendarioController/getEspecialistaPorBeneficioYSede',
    modalities: 'CalendarioController/getModalidadesEspecialista',
    sedes: 'Especialistas/sedes',
    horario: 'Especialistas/horario',
    horarios: 'Especialistas/horarios',
    disponibles: 'Especialistas/disponibles',
    meta: 'Especialistas/meta',
  },
  areas: {
    citas: 'Areas/citas',
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
    getCitasSinPagar: 'CalendarioController/getCitasSinPagarUsuario',
    getAtencionPorSede: 'CalendarioController/getAtencionPorSede',
    createAppointment: 'CalendarioController/createAppointmentByColaborator',
    registrarDetallePago: 'CalendarioController/registrarTransaccionPago',
    getLastAppointment: 'CalendarioController/getLastAppointment',
    updateAppointment: 'CalendarioController/updateAppointmentData',
    updateStatusAppointment: 'CalendarioController/updateStatusAppointmentData',
    updateDetail: 'CalendarioController/updateDetallePaciente',
    getPendientes: 'CalendarioController/getPendientes',
    cancelAppointment: 'CalendarioController/cancelAppointmentUser',
    getCitaById: 'CalendarioController/getCitaById',
    insertGoogleEvent: 'CalendarioController/insertGoogleEvent',
    updateGoogleEvent: 'CalendarioController/updateGoogleEvent',
    actualizaFechaIntentoPago: 'CalendarioController/actualizaFechaIntentoPago',
    deleteGoogleEvent: 'CalendarioController/deleteGoogleEvent',
    getSedesEspecialista: 'CalendarioController/getSedesDeAtencionEspecialista',
    getDisponibilidadEspecialista: 'CalendarioController/getDiasDisponiblesAtencionEspecialista',
    getBeneficioActivo: 'CalendarioController/getBeneficioActivo',
    getDocumento: 'CalendarioController/getDocumento',
    getSedeEsp: 'CalendarioController/getSedeEsp',
  },
  reportes: {
    lista: '/ReportesController/citas',
    especialistas: '/GeneralController/especialistas',
    observacion: '/ReportesController/observacion',
    pacientes: '/ReportesController/getPacientes',
    citas: '/ReportesController/getAppointmentHistory',
    getEstatusPaciente: '/GeneralController/getEstatusPaciente',
    updateEstatusPaciente: '/GeneralController/updateEstatusPaciente',
    getCierrePacientes: '/ReportesController/getCierrePacientes',
    getCierreIngresos: '/ReportesController/getCierreIngresos',
    getSelectEspe: '/ReportesController/getSelectEspe',
    getEspeUser: '/ReportesController/getEspeUser',
    demandaDepartamentos: '/ReportesController/demandaDepartamentos',
    allDemandaAreas: '/ReportesController/allDemandaAreas',
    demandaAreas: '/ReportesController/demandaAreas',
    demandaPuestos: '/ReportesController/demandaPuestos'
  },
  dashboard: {
    citasAnual: '/DashboardController/citasAnual',
    getPregunta: '/DashboardController/getPregunta',
    getRespuestas: '/DashboardController/getRespuestas',
    getCountRespuestas: '/DashboardController/getCountRespuestas',
    getPacientes: '/DashboardController/getPacientes',
    getCtAsistidas: '/DashboardController/getCtAsistidas',
    getCtCanceladas: '/DashboardController/getCtCanceladas',
    getCtPenalizadas: '/DashboardController/getCtPenalizadas',
    getMetas: '/DashboardController/getMetas',
    getEsp: '/DashboardController/getEsp',
    getEstatusCitas: '/GeneralController/getEstatusCitas',
    getCountModalidades: '/DashboardController/getCountModalidades',
    getCountEstatusCitas: '/DashboardController/getCountEstatusCitas',
    getCountPacientes: '/DashboardController/getCountPacientes',
    getCtDisponibles: '/DashboardController/getCtDisponibles',
    getCarrusel: '/DashboardController/getCarrusel',
    getDemandaBeneficio: '/DashboardController/getDemandaBeneficio',
    getPuestos: '/DashboardController/getPuestos',
    getAreas: '/DashboardController/getAreas',
    getDepartamentos: '/DashboardController/getDepartamentos',
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
    updateArea: '/GestorController/updateArea',
    updateEstatus: '/GestorController/updateEstatus',
    getEsp: '/GestorController/getEsp',
    getAtencionXsedeEsp: '/GestorController/getAtencionXsedeEsp',
    getHorariosEspecificos: '/GestorController/getHorariosEspecificos',
    updateOficina: '/GestorController/updateOficina',
    insertOficinas: '/GestorController/insertOficinas',
    updateSede: '/GestorController/updateSede',
    insertSedes: '/GestorController/insertSedes',
    checkModalidades: '/GestorController/checkModalidades',
    getAreas: '/GestorController/getAreas',
    updateHorario: '/GestorController/updateHorario',
    updateEstatusHorario: '/GestorController/updateEstatusHorario',
    insertHorario: '/GestorController/insertHorario',
    especialistas: '/GestorController/especialistas',
    getDepartamentos: '/GestorController/getDepartamentos',
    getAllAreas: '/GeneralController/getAllAreas',
    getAreasPs: '/GestorController/getAreasPs',
    getPuestos: '/GestorController/getPuestos',
    updateEstatusPuestos: '/GestorController/updateEstatusPuestos',
    updateEstatusAreas: '/GestorController/updateEstatusAreas',
    updateEstatusDepartamentos: '/GestorController/updateEstatusDepartamentos'
  },
  avisosPrivacidad: {
    getEspecialidadToSelect: '/AvisosPrivacidadController/getEspecialidades',
    getAvisoDePrivacidad: '/AvisosPrivacidadController/getAvisoPrivacidad',
    actualizarArchivoPrivacidad: '/AvisosPrivacidadController/actualizarArchivoPrivacidad',
  },
  citas: {
    getCitas: '/GeneralController/getCitas',
  },
};
