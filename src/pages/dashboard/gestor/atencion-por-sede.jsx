import { Helmet } from 'react-helmet-async';

import { useSession } from 'src/hooks/use-session';

import { AtencionPorSede } from 'src/sections/gestor/view';

// ----------------------------------------------------------------------

export default function AtencionPorSedePage() {
  useSession();
  return (
    <>
      <Helmet>
        <title> Gestor: Atención por sede</title>
      </Helmet>

      <AtencionPorSede />
    </>
  );
}
