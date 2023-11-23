import { Helmet } from 'react-helmet-async';

import { HistorialReportesView } from 'src/sections/reportes/view';

// ----------------------------------------------------------------------

export default function HistorialReportesPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Historial Reportes</title>
      </Helmet>

      < HistorialReportesView />
    </>
  );
}
