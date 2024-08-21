import { Helmet } from 'react-helmet-async';

import { FondoAhorroView } from 'src/sections/fondo-ahorro/view';

// ----------------------------------------------------------------------

export default function FondoAhorroPage() {
  return (
    <>
      <Helmet>
        <title> Fondo de ahorro</title>
      </Helmet>

      <FondoAhorroView />
    </>
  );
}