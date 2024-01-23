import { Helmet } from 'react-helmet-async';

import { OverviewAppView } from 'src/sections/overview/app/view';
import PendingModal from 'src/sections/overview/calendario/view/pendingModal';

// ----------------------------------------------------------------------

export default function OverviewAppPage() {

  return (
    <>
      <Helmet>
        <title> Dashboard: App</title>
      </Helmet>

      <OverviewAppView />
      <PendingModal />
    </>
  );
}