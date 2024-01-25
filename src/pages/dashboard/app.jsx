import { Base64 } from 'js-base64';
import { Helmet } from 'react-helmet-async';

import { OverviewAppView } from 'src/sections/overview/app/view';
import PendingModal from 'src/sections/overview/calendario/view/pendingModal';
import PendingModalUser from 'src/sections/overview/calendario/view/pendingModalUser';

// ----------------------------------------------------------------------

export default function OverviewAppPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: App</title>
      </Helmet>

      <OverviewAppView />
    </>
  );
}
