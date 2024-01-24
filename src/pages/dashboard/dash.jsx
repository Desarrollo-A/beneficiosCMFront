import { Helmet } from 'react-helmet-async';

import { useSession } from 'src/hooks/use-session';

import { DashView } from 'src/sections/overview/dash/view';

// ----------------------------------------------------------------------

export default function DashPage() {
  useSession();
  return (
    <>
      <Helmet>
        <title> Dashboard: Dash</title>
      </Helmet>

      <DashView />
    </>
  );
}
