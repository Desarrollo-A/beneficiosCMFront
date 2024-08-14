import { Helmet } from 'react-helmet-async';

import { CalendarView } from 'src/sections/calendariobeneficiario-YANOES/view';

// ----------------------------------------------------------------------

export default function CalendarPage() {
  return (
    <>
      <Helmet>
        <title>Calendario</title>
      </Helmet>

      <CalendarView />
    </>
  );
}
