import { Helmet } from 'react-helmet-async';

import { JwtVerificacionView } from 'src/sections/auth/jwt';

// ---------------------------------------------------------------------- 

export default function VerificacionPage() {
  return (
    <>
      <Helmet>
        <title> CDM: Verificacion</title>
      </Helmet>

      <JwtVerificacionView />
    </>
  );
}
