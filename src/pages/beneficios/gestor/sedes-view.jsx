import { Helmet } from 'react-helmet-async';

import { useSession } from 'src/hooks/use-session';

import { SedesView } from 'src/sections/gestor/view';

// ----------------------------------------------------------------------

export default function OficinasPage() {
  useSession();
  return (
    <>
      <Helmet>
        <title> Beneficios CDM | Sedes</title>
      </Helmet>

      < SedesView />
    </>
  );
}