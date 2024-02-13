import { useContext } from "react";

import { contextGeneral } from "src/utils/contextGeneralProvider";

const UserContext = () => {
    const context = useContext(contextGeneral);
    return {
        getUsers : context.llamarServidor('Usuario/getUsers'),
        getAreas : context.llamarServidor('Usuario/getAreas'),
        insertBatchUsers : context.llamarServidorRespuesta('Usuario/insertBatchUsers'),
        updateUser  : context.llamarServidorRespuesta('Usuario/updateUser')
    }
}
export default UserContext;