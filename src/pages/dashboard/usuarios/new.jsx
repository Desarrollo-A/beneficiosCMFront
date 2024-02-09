import { Helmet } from 'react-helmet-async';

import { TestCreateView } from 'src/sections/usuarios/view';

// ----------------------------------------------------------------------

export default function TourCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Listado de usuarios</title>
      </Helmet>

      <TestCreateView />
    </>
  );
}
