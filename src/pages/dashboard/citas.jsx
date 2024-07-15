import { Helmet } from 'react-helmet-async';

import { CitasView } from 'src/sections/citas/view';

// ----------------------------------------------------------------------

export default function CitasPage() {
  return (
    <>
      <Helmet>
        <title> Citas</title>
      </Helmet>

      <CitasView />
    </>
  );
}