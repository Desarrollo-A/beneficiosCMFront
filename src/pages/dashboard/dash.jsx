import { Helmet } from 'react-helmet-async';

import { useSession } from 'src/hooks/use-session';

import { DashView } from 'src/sections/overview/dash/view';
import PendingModalUser from 'src/sections/calendariobeneficiario/pendingModalUser';
import PendingModal from 'src/sections/overview/calendarioespecialista/view/pendingModal';

// ----------------------------------------------------------------------

export default function DashPage() {
  useSession();
  return (
    <>
      <Helmet>
        <title> Dashboard: Dash</title>
      </Helmet>

      <DashView />
      <PendingModal />
      <PendingModalUser />
    </>
  );
}
