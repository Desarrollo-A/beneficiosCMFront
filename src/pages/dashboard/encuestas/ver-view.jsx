import { Helmet } from 'react-helmet-async';

import { VerEncuestasView } from 'src/sections/encuestas/view';

// ----------------------------------------------------------------------

export default function CrearEncuestaPage() {
  return (
    <>
      <Helmet>
        <title> Encuestas: Ver Encuestas</title>
      </Helmet>

      < VerEncuestasView />
    </>
  );
}