import { Helmet } from 'react-helmet-async';

import { useSession } from 'src/hooks/use-session';

import { ReportePacientesView } from 'src/sections/reportes/view';

// ----------------------------------------------------------------------

export default function ReportePacientesPage() {
  useSession();
  return (
    <>
      <Helmet>
        <title> Dashboard: Reporte de Pacientes</title>
      </Helmet>

      < ReportePacientesView />
    </>
  );
}