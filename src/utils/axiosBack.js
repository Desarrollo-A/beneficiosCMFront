import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost/beneficiosCMBack/beneficiosCMBack/',
    port: 80,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
}

});
if(localStorage.getItem('token'))
  instance.defaults.headers.common = {'authorization': localStorage.getItem('token')}

export default instance;