import { Helmet } from 'react-helmet-async';

import { useSession } from 'src/hooks/use-session';

import { SolicitudesView } from 'src/sections/fondo-ahorro/solicitudes/view';

// ----------------------------------------------------------------------

export default function SolicitudesPage() {
  useSession();

  return (
    <>
      <Helmet>
        <title> Solicitudes de fondo de ahorro</title>
      </Helmet>

      <SolicitudesView />
    </>
  );
}
