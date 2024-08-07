import { Helmet } from 'react-helmet-async';

import { useSession } from 'src/hooks/use-session';

import { HistorialReportesView } from 'src/sections/reportes/view';


// ----------------------------------------------------------------------

export default function HistorialReportesPage() {

  useSession();

  return (
    <>
      <Helmet>
        <title>Reportes | Historial</title>
      </Helmet>

      < HistorialReportesView />
    </>
  );
}