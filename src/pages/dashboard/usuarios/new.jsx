import { Helmet } from 'react-helmet-async';

import { useSession } from 'src/hooks/use-session';

import { TestCreateView } from 'src/sections/usuarios/view';

// ----------------------------------------------------------------------

export default function TourCreatePage() {
  useSession();

  return (
    <>
      <Helmet>
        <title> Dashboard: Listado de usuarios</title>
      </Helmet>

      <TestCreateView />
    </>
  );
}
