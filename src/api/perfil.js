import axios from 'axios';

import { endpoints } from 'src/utils/axios';

import { HOST } from 'src/config-global';


export async function getDecodedPass() {
    const URL = endpoints.user.decodePass;

    const accessToken = localStorage.getItem('accessToken');

    const instance = axios.create({
        baseURL: HOST,
        headers: {
            Token: accessToken
        }
    })

    const response = await instance.get(URL);
  
    return response.data;
}

export async function getDecodedPassAdmin() {
    const URL = endpoints.user.decodePassAdmin;

    const accessToken = localStorage.getItem('accessToken');

    const instance = axios.create({
        baseURL: HOST,
        headers: {
            Token: accessToken
        }
    })

    const response = await instance.get(URL);
  
    return response.data;
}