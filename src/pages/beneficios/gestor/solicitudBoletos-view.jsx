import { Helmet } from 'react-helmet-async';

import { useSession } from 'src/hooks/use-session';

import { SolicitudBoletosView } from 'src/sections/gestor/view';

// ----------------------------------------------------------------------

export default function SolicitudBoletosPage() {
  useSession();
  return (
    <>
      <Helmet>
        <title>  Gestor | Solicitud Boletos</title>
      </Helmet>

      < SolicitudBoletosView />
    </>
  );
}