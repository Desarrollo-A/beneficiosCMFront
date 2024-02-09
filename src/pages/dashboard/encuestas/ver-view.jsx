import { Helmet } from 'react-helmet-async';

import { useSession } from 'src/hooks/use-session';

import { VerEncuestasView } from 'src/sections/encuestas/view';

// ----------------------------------------------------------------------

export default function CrearEncuestaPage() {
  useSession();
  return (
    <>
      <Helmet>
        <title> Encuestas: Ver Encuestas</title>
      </Helmet>

      < VerEncuestasView />
    </>
  );
}