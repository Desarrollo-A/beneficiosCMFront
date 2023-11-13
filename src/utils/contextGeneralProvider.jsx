import React, { createContext, useState } from 'react';
import {Backdrop, Snackbar, IconButton} from '@material-ui/core';
import spinner from 'src/images/logo/spinner.gif';
import { Alert } from '@mui/lab';
import instance from './axiosBack';

// create a context, with createContext api
export const contextGeneral = createContext();

const ContextGeneralProvider = (props) => {
    const [cargando, setCargando] = React.useState(false);
    const [mensaje, setMensaje] = React.useState({});
    const cerrarMensaje = () => setMensaje({});

    const llamarServidor=(ruta)=>(setCtl,body)=>{
        setCargando(true);
        instance.post(ruta,body)
        .then(response=>{
            setCtl(response.data);
            setCargando(false);
        })
        .catch(error=>{
            setCtl([]);
            setCargando(false);
        });
    }
    
    
    const llamarServidorRespuesta=(ruta)=>(respuesta,body)=>{
        setCargando(true);
        instance.post(ruta,body)
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

    const llamarServidorRespuestaPDF=(ruta)=>(respuesta,body)=>{
        setCargando(true);
        instance.post(ruta,body,{
        responseType: 'arraybuffer',
        headers: {'Content-Type': 'application/json', Accept: 'application/pdf'
        }
      })
        .then(response=>{
            setCargando(false);
            if(response.status===200){
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    const date = new Date();
                    const newStringDate =('0' + date.getDate()).slice(-2) +('0' + (date.getMonth() + 1)).slice(-2) +date.getFullYear().toString();
                    link.setAttribute('download',newStringDate + '.pdf' ); 
                    document.body.appendChild(link);
                    setMensaje({ open: true, status: response.data.estatus, value: response.data.mensaje });
                    respuesta(link,response.data.estatus,response.data.mensaje); 
                }else{
                setMensaje({ open: true, status: -1, value: "ERROR DESCONOCIDO" });
                respuesta(-5,"ERROR DESCONOCIDO");
            }
        })
        .catch(error=>{
            //console.log(error);
            setMensaje({ open: true, status: -1, value: "ERROR DE SERVIDOR" });
            respuesta(-1,'Error de servidor');
            setCargando(false);
        });
    }

    return (
        <contextGeneral.Provider value={{llamarServidor,llamarServidorRespuesta,llamarServidorRespuestaPDF,setCargando,setMensaje}}>
            <Snackbar open={mensaje.open} autoHideDuration={10000} onClose={cerrarMensaje}>
                <Alert onClose={cerrarMensaje} variant="filled" severity={mensaje.status<0?'error':mensaje.status>0?'success':'info'}>
                {mensaje.value}
                </Alert>
            </Snackbar>
            <Backdrop id="cargando" open={cargando}>
                {/* <CircularProgress color="inherit" /> */}
                <img src={spinner} alt={'OOAM'} width="450" height="250" />
            </Backdrop>
            {props.children}
        </contextGeneral.Provider>
    );
};

export default ContextGeneralProvider;