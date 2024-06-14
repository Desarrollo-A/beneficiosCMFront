import { Helmet } from 'react-helmet-async';

import { useSession } from 'src/hooks/use-session';

import { UsuariosView } from 'src/sections/gestor/view';

// ----------------------------------------------------------------------

export default function UsuariosPage() {
  useSession();
  return (
    <>
      <Helmet>
        <title> Beneficios CDM | Usuarios</title>
      </Helmet>

      < UsuariosView />
    </>
  );
}