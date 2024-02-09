import axios from 'axios';

const instance = axios.create({
     // baseURL: 'https://prueba.gphsis.com/RHCV/index.php/WS/'
    // baseURL: 'https://rh.gphsis.com/index.php/WS/' // data_colaborador_consultas
});

/*
  instance.defaults.headers.common = {'authorization': '41EgSP8+YSqsyT1ZRuxTK3CYR11LOcyqopI2TTNJd3EL+aU3MUdJNsKGx8xOK+HH'}
*/


export default instance;