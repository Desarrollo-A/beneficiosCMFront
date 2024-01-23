import { Base64 } from 'js-base64';
import { Helmet } from 'react-helmet-async';

import { OverviewAppView } from 'src/sections/overview/app/view';
import PendingModal from 'src/sections/overview/calendario/view/pendingModal';
import PendingModalUser from 'src/sections/overview/calendario/view/pendingModalUser';

// ----------------------------------------------------------------------

const datosUser = JSON.parse(Base64.decode(sessionStorage.getItem('accessToken').split('.')[2]));

export default function OverviewAppPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: App</title>
      </Helmet>

      <OverviewAppView />
      {datosUser.rol === 3 && <PendingModal />}
      {datosUser.rol === 2 && <PendingModalUser />}
    </>
  );
}
