
import { useContext } from "react";

import { contextGeneral } from "src/utils/contextGeneralProvider";

const Calendario = () => {
    const context = useContext(contextGeneral);

    return {
        getOccupied: context.llamarServidorRespuesta('calendarioController/get_occupied')
    }
}

export default Calendario;