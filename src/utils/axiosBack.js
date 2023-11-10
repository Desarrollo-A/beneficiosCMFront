import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost/beneficiosCMBack/beneficiosCMBack/',

});
if(localStorage.getItem('token'))
  instance.defaults.headers.common = {'authorization': localStorage.getItem('token')}

export default instance;