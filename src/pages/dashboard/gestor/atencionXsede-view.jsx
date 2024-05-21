import { Helmet } from 'react-helmet-async';

import { useSession } from 'src/hooks/use-session';

import { AtencionXsedeView } from 'src/sections/gestor/view';

// ----------------------------------------------------------------------

export default function AtencionXsedePage() {
  useSession();
  return (
    <>
      <Helmet>
        <title> Beneficios CDM | Atención por sede</title>
      </Helmet>

      < AtencionXsedeView />
    </>
  );
}