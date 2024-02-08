import { Helmet } from 'react-helmet-async';

import { useSession } from 'src/hooks/use-session';

import { SedesView } from 'src/sections/gestor/view';

// ----------------------------------------------------------------------

export default function OficinasPage() {
  useSession();
  return (
    <>
      <Helmet>
        <title> Gestor: Sedes</title>
      </Helmet>

      < SedesView />
    </>
  );
}