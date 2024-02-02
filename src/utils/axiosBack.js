import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost/beneficiosCMBack/',
    // baseURL: import.meta.env
    // baseURL: 'https://prueba.gphsis.com/beneficiosmaderas/',

});
if(localStorage.getItem('token'))
  instance.defaults.headers.common = {'authorization': localStorage.getItem('token')}

export default instance;