import { Helmet } from 'react-helmet-async';

import { useSession } from 'src/hooks/use-session';

import { HorariosEspeView } from 'src/sections/gestor/view';

// ----------------------------------------------------------------------

export default function HorariosEspePage() {
  useSession();
  return (
    <>
      <Helmet>
        <title> Gestor | Horario especificos</title>
      </Helmet>

      < HorariosEspeView />
    </>
  );
}