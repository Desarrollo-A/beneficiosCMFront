import { Helmet } from 'react-helmet-async';

import { useSession } from 'src/hooks/use-session';

import { AyudaView } from 'src/sections/ayuda/view';

// ----------------------------------------------------------------------

export default function AyudaPage() {
  useSession();
  return (
    <>
      <Helmet>
        <title> Ayuda</title>
      </Helmet>

      < AyudaView />
    </>
  );
}