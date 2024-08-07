import { Helmet } from 'react-helmet-async';

import { useSession } from 'src/hooks/use-session';

import { GestorAyudaView } from 'src/sections/ayuda/view';

// ----------------------------------------------------------------------

export default function GestorAyudaPage() {
  useSession();
  return (
    <>
      <Helmet>
        <title> Ayuda | Gestor ayuda</title>
      </Helmet>

      < GestorAyudaView />
    </>
  );
}