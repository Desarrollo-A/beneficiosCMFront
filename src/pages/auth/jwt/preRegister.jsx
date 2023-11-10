import { Helmet } from 'react-helmet-async';

import JwtpreRegisterView from 'src/sections/auth/jwt/jwt-preRegister-view';
// ---------------------------------------------------------------------- 

export default function preRegisterPage() {
  return (
    <>
      <Helmet>
        <title> Beneficios CDM Registro</title>
      </Helmet>
      <JwtpreRegisterView />
    </>
  );
}
