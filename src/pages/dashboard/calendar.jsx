import { Helmet } from 'react-helmet-async';

import { useSession } from 'src/hooks/use-session';

import { CalendarView } from 'src/sections/calendariobeneficiario/view';

// ----------------------------------------------------------------------

export default function CalendarPage() {
  useSession();
  return (
    <>
      <Helmet>
        <title> Dashboard: Calendario colaborador</title>
      </Helmet>

      <CalendarView />
    </>
  );
}
