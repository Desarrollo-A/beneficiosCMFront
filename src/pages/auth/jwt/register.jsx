import { Helmet } from 'react-helmet-async';

import { JwtRegisterView } from 'src/sections/auth/jwt';

// ---------------------------------------------------------------------- 

export default function RegisterPage() {
  return (
    <>
      <Helmet>
        <title>Beneficios CDM | Register</title>
      </Helmet>

      <JwtRegisterView />
    </>
  );
}
