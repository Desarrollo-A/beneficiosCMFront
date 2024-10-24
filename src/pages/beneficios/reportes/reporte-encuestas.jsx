import { Helmet } from 'react-helmet-async';

import { ReporteEncuestasView } from 'src/sections/reportes/view';

// ----------------------------------------------------------------------

export default function ReporteEncuestasPage() {
  return (
    <>
      <Helmet>
        <title>Reportes | Encuestas</title>
      </Helmet>

      <ReporteEncuestasView />
    </>
  );
}
