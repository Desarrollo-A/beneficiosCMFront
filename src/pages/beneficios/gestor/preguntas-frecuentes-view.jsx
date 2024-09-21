import { Helmet } from 'react-helmet-async';

import { useSession } from 'src/hooks/use-session';

import { GestionPreguntasFrecuentes } from 'src/sections/gestor/view';

// ----------------------------------------------------------------------

export default function PreguntasFrecuentesPage() {
  useSession();
  return (
    <>
      <Helmet>
        <title> Gestor | Preguntas frecuentes</title>
      </Helmet>

      < GestionPreguntasFrecuentes />
    </>
  );
}