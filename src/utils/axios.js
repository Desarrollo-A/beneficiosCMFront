import axios from 'axios';

import { HOST, HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });
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
export {instance};

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

  const res = await instance.post(url, {dataValue},{
    headers: {'Content-Type' : 'application/x-www-form-urlencoded'}},
     { ...config });
  
  return res.data;
};
  
// ----------------------------------------------------------------------

export const endpoints = {
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
    areas: 'Usuario/getAreas',
    batch: 'Usuario/insertBatchUsers',
    names: 'Usuario/getNameUser'
  },
  benefits: {
    list: 'CalendarioController/getBeneficiosPorSede' 
  },
  especialistas: {
    list: 'CalendarioController/getEspecialistaPorBeneficioYSede',
    modalities: 'CalendarioController/getModalidadesEspecialista',
    
  },
  calendario: {
    get_occupied: 'calendarioController/get_occupied',
    save_occupied: 'calendarioController/save_occupied',
    update_occupied: 'calendarioController/update_occupied',
    delete_occupied: 'calendarioController/delete_occupied',
    delete_date: 'calendarioController/delete_date',
    create_appointment: 'calendarioController/create_appointment',
    update_on_drop: 'calendarioController/update_on_drop'
  }
};