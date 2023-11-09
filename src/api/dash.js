import axios from 'axios';

const base_url = "http://localhost/beneficiosCMBack/welcome/";

export function GetDash(name){
    return axios.get(base_url + name).then((response) => response.data.data);
}

export function PostDash(name, dt){
    return axios.post(base_url + name, {
        dt
    },
    {
        headers: {'Content-Type' : 'application/x-www-form-urlencoded'}
    }
    ).then((response) => response.data.data);
}