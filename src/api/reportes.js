import { useContext } from "react";

import { contextGeneral } from "src/utils/contextGeneralProvider";

const Reportes = () => {
    const context = useContext(contextGeneral);
    return {
        getReportes: context.llamarServidorRespuesta('reportesController/citas'),
        getEspecialistas: context.llamarServidor('generalController/especialistas'),
        getObservacion: context.llamarServidorRespuesta('reportesController/observacion')
    }
}
export default Reportes
