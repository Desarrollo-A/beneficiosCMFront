import { Helmet } from 'react-helmet-async';

import { useSession } from 'src/hooks/use-session';

import { EstatusPuestosView } from 'src/sections/gestor/view';

// ----------------------------------------------------------------------

export default function EstatusPuestosPage() {
  useSession();
  return (
    <>
      <Helmet>
        <title>  Gestor | Gozo beneficios</title>
      </Helmet>

      < EstatusPuestosView />
    </>
  );
}