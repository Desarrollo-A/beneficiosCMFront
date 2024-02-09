import axios from 'axios';

import { HOST } from 'src/config-global';

const instance = axios.create({
    // baseURL: 'http://localhost/beneficiosCMBack/',
    baseURL: HOST
    // baseURL: 'https://prueba.gphsis.com/beneficiosmaderas/',

});
if(localStorage.getItem('token'))
  instance.defaults.headers.common = {'authorization': localStorage.getItem('token')}

export default instance;