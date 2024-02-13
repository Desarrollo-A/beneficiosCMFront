import PropTypes from 'prop-types';
import {Snackbar} from '@material-ui/core';
import React, { useMemo, useState, createContext } from 'react';

import { Alert } from '@mui/lab';

import instance from './axiosBack';

// create a context, with createContext api
export const contextGeneral = createContext();

const status = {
    '-1' : 'error',
    '0' : 'info',
    '1' : 'success'
};

const ContextGeneralProvider = ({ children }) => {
    const [, setCargando] = useState(false); // cargando
    const [mensaje, setMensaje] = useState({});
    const cerrarMensaje = () => setMensaje({});

    const llamarServidor=(ruta)=>(setCtl,body)=>{
        setCargando(true);
        instance.post(ruta,body)
        .then(response=>{
            setCtl(response.data);
            setCargando(false);
        })
        .catch(error=> {
            setCtl([]);
            setCargando(false);
        });
    }
    
    const llamarServidorRespuesta=(ruta)=>(respuesta,body)=>{
        setCargando(true);
        instance.post(ruta,body, { headers: {'Content-Type' : 'application/x-www-form-urlencoded'}})
        .then(response=>{
            setCargando(false);
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
            setCargando(false);
        });
    }

    const memoizedValue = useMemo(
        () => ({
            llamarServidor,
            llamarServidorRespuesta,
            setCargando,
            setMensaje
        }),
        [setCargando, setMensaje]
    );

    console.log(mensaje)

    return (
        <contextGeneral.Provider value={memoizedValue}>
          <Snackbar open={mensaje.open} autoHideDuration={10000} onClose={cerrarMensaje}>
                <Alert onClose={cerrarMensaje} variant="filled" severity={status[mensaje.status]}>
                {mensaje.value}
                </Alert>
            </Snackbar>
            {children}
        </contextGeneral.Provider>
    );
};

ContextGeneralProvider.propTypes = {
    children: PropTypes.node,
};

export default ContextGeneralProvider;