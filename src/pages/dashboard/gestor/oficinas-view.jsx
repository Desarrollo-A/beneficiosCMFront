import { Helmet } from 'react-helmet-async';

import { useSession } from 'src/hooks/use-session';

import { OficinasView } from 'src/sections/gestor/view';

// ----------------------------------------------------------------------

export default function OficinasPage() {
  useSession();
  return (
    <>
      <Helmet>
        <title> Gestor: Oficinas</title>
      </Helmet>

      < OficinasView />
    </>
  );
}