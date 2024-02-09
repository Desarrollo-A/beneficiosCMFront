import { Helmet } from 'react-helmet-async';

import { useSession } from 'src/hooks/use-session';

import { CalendarView } from 'src/sections/calendariobeneficiario/view';
import PendingModalUser from 'src/sections/calendariobeneficiario/pendingModalUser';

// ----------------------------------------------------------------------

export default function CalendarPage() {
  useSession();
  return (
    <>
      <Helmet>
        <title> Calendario colaborador</title>
      </Helmet>

      <CalendarView />
      <PendingModalUser />
    </>
  );
}
