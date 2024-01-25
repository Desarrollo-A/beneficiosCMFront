import { Helmet } from 'react-helmet-async';

import { useSession } from 'src/hooks/use-session';

import { DashView } from 'src/sections/overview/dash/view';
import PendingModal from 'src/sections/overview/calendario/view/pendingModal';
import PendingModalUser from 'src/sections/overview/calendario/view/pendingModalUser';

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
