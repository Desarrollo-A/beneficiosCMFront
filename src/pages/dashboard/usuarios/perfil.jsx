import { Helmet } from 'react-helmet-async';

import { PerfilUsuarioView } from 'src/sections/usuarios/view';

// ----------------------------------------------------------------------

export default function PerfilPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Perfil de usuario</title>
      </Helmet>

      <PerfilUsuarioView />
    </>
  );
}
