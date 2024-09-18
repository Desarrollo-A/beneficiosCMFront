import { Helmet } from 'react-helmet-async';

import { useSession } from 'src/hooks/use-session';
      
import { AsistenciaEvView } from 'src/sections/asistenciaEv/view';


export default function AsistenciaEvPage() {
  useSession();

  return (
    <>
      <Helmet>
        <title>Asistencia|Colaboradores</title>
      </Helmet>

      <AsistenciaEvView/>
    </>
  );
}

