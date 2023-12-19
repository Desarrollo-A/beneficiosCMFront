import axios from 'axios';

import { HOST } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST });
axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });
  console.log(res)
  return res.data;
};

export const fetcher_custom = async (args, year, month) => {
  const [url, config] = Array.isArray(args) ? args : [args];
  
  const res = await axiosInstance.post(url, {year, month}, { 
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }}, {...config});

  return res.data;
};

export const fetcherGet = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });
    
  return res.data;
};

export const fetcherPost = async (args, dataValue) => {
  
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.post(url, {dataValue},{
    headers: {'Content-Type' : 'application/x-www-form-urlencoded'}},
     { ...config });
  
  return res.data;
};

export const fetcherInsert = async (args) => {
  const [url, data, config] = Array.isArray(args) ? args : [args];
 
  const res = await axiosInstance.post(url, {"dat": JSON.stringify(data)}, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    ...config,
  });

  return res.data;
};

export const fetcherUpdate = async (args) => {
  const [url, data, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.post(url, data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    ...config,
  });

  return res.data;
};
  
// ----------------------------------------------------------------------

export const endpoints = {
  extra: 'http://localhost/beneficiosCMBack/calendarioController/get_occupied',
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/auth/me',
    me2: 'loginController/me',
    login: 'loginController/login',
    login2: '/api/auth/login',
    register: '/api/auth/register',
    logout: 'loginController/logout',
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
    list: 'Usuario/getUsers',
    update: 'Usuario/updateUser',
  },
  reportes: {
    lista: '/reportesController/citas',
    especialistas: '/generalController/especialistas',
    observacion: '/reportesController/observacion',
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
    citasAnual: '/dashboardController/citasAnual'
  },
  calendario: {
    ServiciosDisp: '/CalendarioController/getBeneficiosDisponibles',
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
    getEncNotificacion:'/encuestasController/getEncNotificacion',
    getPuestos:'/encuestasController/getPuestos',
    getEcuestaValidacion: '/encuestasController/getEcuestaValidacion',
  }
};