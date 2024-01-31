import {Snackbar} from '@material-ui/core';
import React, { useState, createContext } from 'react';

import { Alert } from '@mui/lab';

import instance from './axiosBack';

// create a context, with createContext api
export const contextGeneral = createContext();

const ContextGeneralProvider = (props) => {
    const [mensaje, setMensaje] = useState({});
    const cerrarMensaje = () => setMensaje({});

    const llamarServidor=(ruta)=>(setCtl,body)=>{
        instance.post(ruta,body)
        .then(response=>{
            setCtl(response.data);
        })
        .catch(error=> {
            setCtl([]);
        });
    }
    
    const llamarServidorRespuesta=(ruta)=>(respuesta,body)=>{
        instance.post(ruta,body, { headers: {'Content-Type' : 'application/x-www-form-urlencoded'}})
        .then(response=>{
            if(response.status===200){
                setMensaje({ open: true, status: response.data.estatus, value: response.data.mensaje });
                respuesta(response.data,response.data.estatus,response.data.mensaje);
            }else{
                setMensaje({ open: true, status: -1, value: "ERROR DESCONOCIDO" });
                respuesta(-5,"ERROR DESCONOCIDO");
            }
        })
        .catch(error=>{
            setMensaje({ open: true, status: -1, value: "ERROR DE SERVIDOR" });
            respuesta(-1,'Error de servidor');
        });
    }

    return (
        <contextGeneral.Provider value={{llamarServidor,llamarServidorRespuesta,setMensaje}}>
          <Snackbar open={mensaje.open} autoHideDuration={10000} onClose={cerrarMensaje}>
                <Alert onClose={cerrarMensaje} variant="filled" severity='error'>
                {mensaje.value}
                </Alert>
            </Snackbar>
            {props.children}
        </contextGeneral.Provider>
    );
};

export default ContextGeneralProvider;