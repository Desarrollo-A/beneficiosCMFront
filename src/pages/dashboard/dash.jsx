import { Helmet } from 'react-helmet-async';

import { DashView } from 'src/sections/overview/dash/view';

// ----------------------------------------------------------------------

export default function DashPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Dash</title>
      </Helmet>

      <DashView />
    </>
  );
}
