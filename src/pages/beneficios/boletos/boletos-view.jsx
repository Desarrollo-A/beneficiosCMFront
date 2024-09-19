import { Helmet } from 'react-helmet-async';

import { useSession } from 'src/hooks/use-session';

import { BoletosView } from 'src/sections/beneficios/boletos/view';

// ----------------------------------------------------------------------

export default function BoletosPage() {
  useSession();
  return (
    <>
      <Helmet>
        <title> Boletos </title>
      </Helmet>

      < BoletosView />
    </>
  );
}