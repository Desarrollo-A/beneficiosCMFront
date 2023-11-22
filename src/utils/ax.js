import axios from 'axios';

import { BACK_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axIns = axios.create({ baseURL: BACK_API });

axIns.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axIns;

// ----------------------------------------------------------------------

export const fetcher_cx = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axIns.get(url, { ...config });
    
  return res.data;
};
  
// ----------------------------------------------------------------------

export const rutas = {
  reportes: {
    lista: '/reportesController/citas',
    especialistas: '/generalController/especialistas',
  }
};