import { Helmet } from 'react-helmet-async';

import { EncuestasView } from 'src/sections/encuestas/view';

// ----------------------------------------------------------------------

export default function EncuestasPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Encuestas</title>
      </Helmet>

      < EncuestasView />
    </>
  );
}

