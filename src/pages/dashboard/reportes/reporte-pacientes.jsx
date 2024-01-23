import { Helmet } from 'react-helmet-async';

import { ReportePacientesView } from 'src/sections/reportes/view';

// ----------------------------------------------------------------------

export default function ReportePacientesPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Reporte de Pacientes</title>
      </Helmet>

      < ReportePacientesView />
    </>
  );
}