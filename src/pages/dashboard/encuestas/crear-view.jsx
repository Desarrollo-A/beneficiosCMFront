import { Helmet } from 'react-helmet-async';

import { CrearEncuestaView } from 'src/sections/encuestas/view';

// ----------------------------------------------------------------------

export default function CrearEncuestaPage() {
  return (
    <>
      <Helmet>
        <title> Encuestas: Crear Encuesta</title>
      </Helmet>

      < CrearEncuestaView />
    </>
  );
}