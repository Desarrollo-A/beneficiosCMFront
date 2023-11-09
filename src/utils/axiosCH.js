import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://prueba.gphsis.com/RHCV/index.php/WS/',
});
if(localStorage.getItem('token'))
  instance.defaults.headers.common = {'authorization': localStorage.getItem('token')}



  
export default instance;