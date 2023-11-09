import { Helmet } from 'react-helmet-async';

import { HistorialCitasView } from 'src/sections/citas/view';

// ----------------------------------------------------------------------

export default function HistorialCitasPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Historial Citas</title>
      </Helmet>

      < HistorialCitasView />
    </>
  );
}
