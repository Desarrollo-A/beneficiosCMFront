import { Helmet } from 'react-helmet-async';

import { useSession } from 'src/hooks/use-session';

import { CrearEncuestaView } from 'src/sections/encuestas/view';

// ----------------------------------------------------------------------

export default function CrearEncuestaPage() {
  useSession();
  return (
    <>
      <Helmet>
        <title>Beneficios CDM | Crear</title>
      </Helmet>

      < CrearEncuestaView />
    </>
  );
}