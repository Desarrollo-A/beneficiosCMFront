import React, { useContext } from "react";

import { contextGeneral } from "src/utils/contextGeneralProvider";

const Servicios = () => {
    const context = useContext(contextGeneral);
    return {
        getInfoCliente: context.llamarServidor('loginController/usuarios'),
        getServiciosDisponibles: context.llamarServidorRespuesta('CalendarioController/getBeneficiosDisponibles'),
        addRegistroEmpleado: context.llamarServidorRespuesta('loginController/addRegistroEmpleado'),

/*
        getInitialData: context.llamarServidor('Clientes/getInitialData'),
        addBlacklist: context.llamarServidorRespuesta('Clientes/addBlacklist'),
        guardarSolicitud: context.llamarServidorRespuesta('Solicitud/guardarSolicitud'),
        getInfoAntenas: context.llamarServidor('Solicitud/getInfoAntenas'),
        guardarAntena: context.llamarServidorRespuesta('Solicitud/guardarAntena'),
        getInfoCliente: context.llamarServidor('loginController/usuarios'),
        addCuentasContables: context.llamarServidorRespuesta('Cuentas/new_cuentaContablePOST'),
    
        // Servicios Cesion de derechos
        getPropietario: context.llamarServidorRespuesta('CesionDerechos/get_nuevo_propietario'),
        getValidacionAdeudos: context.llamarServidorRespuesta('CesionDerechos/getValidacionAdeudos'),//Servicio para validar si el usuario tiene adeudos o ya no 
        getDocConvenioTerminacion: context.llamarServidorRespuesta('CesionDerechos/get_doc_convenio_terminacion'),//Servicio para traer los documentos de convenio de terminacion
        sociedadMercantil: context.llamarServidor('CPcontratacion/getSociedadMercantil'),//Servicio para poder traer los tipos de sociedad
        insertNewClient: context.llamarServidor('CesionDerechos/insert_new_client'),//servicio para crear el nuevo usuario
        modificacionContrato: context.llamarServidor('CesionDerechos/modificacionContrato'),

        // Servicios cancelación
        validarCancelacion: context.llamarServidorRespuesta('DCancelacion/facturacion'),
        procesoCancelacion: context.llamarServidorRespuesta('DCancelacion/procesoCancelacion'),
        procesoDeclinarCancelacion: context.llamarServidorRespuesta('DCancelacion/declinarCancelacion'),
        rechazarCancelacion: context.llamarServidorRespuesta('DCancelacion/rechazarCancelacion'),
        steps: context.llamarServidor('DCancelacion/get_cliente_by_lote'),
        solicitudCancelacion: context.llamarServidorRespuesta('DCancelacion/solicitudCancelacion'),
        verDocumentos: context.llamarServidor('CPcontratacion/verDocumentos'),
        procesoCesion: context.llamarServidorRespuesta('CesionDerechos/procesoCesion'),
        gastoAdmonC: context.llamarServidorRespuesta('CesionDerechos/gastoAdmonC'),
       
        // solicitudCancelacion: context.llamarServidorRespuesta('DCancelacion/solicitudCancelacion'),

*/

        
    }
    
}
export default Servicios
