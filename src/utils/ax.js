import axios from 'axios';

import { HOST } from 'src/config-global';

// ----------------------------------------------------------------------

const axIns = axios.create({ baseURL: HOST });

axIns.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axIns;

// ----------------------------------------------------------------------

export const fetcherGet = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axIns.get(url, { ...config });
    
  return res.data;
};

export const fetcherPost = async (args, ReportData) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axIns.post(url, {ReportData},{
    headers: {'Content-Type' : 'application/x-www-form-urlencoded'}},
     { ...config });
  
  return res.data;
};

export const fetcherUpdate = async (args) => {
  const [url, data, config] = Array.isArray(args) ? args : [args];

  const res = await axIns.post(url, data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    ...config,
  });

  return res.data;
};
  
// ----------------------------------------------------------------------

export const rutas = {
  reportes: {
    lista: '/reportesController/citas',
    especialistas: '/generalController/especialistas',
    observacion: '/reportesController/observacion',
  }
};