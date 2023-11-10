import { Helmet } from 'react-helmet-async';

import JwtpreRegisterView from 'src/sections/auth/jwt/jwt-preRegister-view';
import { useLocation,useNavigate } from 'react-router-dom';
// ---------------------------------------------------------------------- 

export default function preRegisterPage() {
  const state = useLocation();
  const {options} = useNavigate();
  return (
    <>
      <Helmet>
        <title> Beneficios CDM Registro</title>
      </Helmet>
      <JwtpreRegisterView />
    </>
  );
}
