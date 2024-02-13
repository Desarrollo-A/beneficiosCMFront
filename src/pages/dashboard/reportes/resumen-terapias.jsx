import { Helmet } from 'react-helmet-async';

import { useSession } from 'src/hooks/use-session';

import { ResumenTerapiasView } from 'src/sections/reportes/view';

// ----------------------------------------------------------------------

export default function ResumenTerapiasPage() {
  useSession();
  return (
    <>
      <Helmet>
        <title> Dashboard: Reporte de Pacientes</title>
      </Helmet>

      < ResumenTerapiasView />
    </>
  );
}