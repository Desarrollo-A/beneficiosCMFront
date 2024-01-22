import { Helmet } from 'react-helmet-async';

import { HistorialReportesView } from 'src/sections/reportes/view';

import { useSession } from 'src/hooks/use-session';

// ----------------------------------------------------------------------

export default function HistorialReportesPage() {

  useSession();

  return (
    <>
      <Helmet>
        <title> Dashboard: Historial Reportes</title>
      </Helmet>

      < HistorialReportesView />
    </>
  );
}