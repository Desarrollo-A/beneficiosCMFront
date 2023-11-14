import { useContext } from "react";

import { contextGeneral } from "src/utils/contextGeneralProvider";

const Dashbord = () => {
    const context = useContext(contextGeneral);
    return {
        getUsersCount: context.llamarServidor('generalController/usr_count'),
        getCitasCount: context.llamarServidor('generalController/citas_count'),
        getCitasEstatus: context.llamarServidor('dashboardController/citas_count_status'),
        getEstatusTotal: context.llamarServidor('dashboardController/total_status_citas'),
        getFechaMinima: context.llamarServidor('dashboardController/fecha_minima'),
        getFechaAsistencia: context.llamarServidorRespuesta('dashboardController/estatus_fecha_asistencia'),
        getFechaCancelada: context.llamarServidorRespuesta('dashboardController/estatus_fecha_cancelada'),
        getFechaPenalizada: context.llamarServidorRespuesta('dashboardController/estatus_fecha_penalizada'),
        getCitasAnual: context.llamarServidor('dashboardController/citas_anual'),
    }
}
export default Dashbord