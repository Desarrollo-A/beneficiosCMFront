import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { useSession } from 'src/hooks/use-session';

import { EncuestasView } from 'src/sections/encuestas/view';

// ----------------------------------------------------------------------

export default function EncuestasPage() {

  useSession();

  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Beneficios CDM | Encuestas</title>
      </Helmet>

      < EncuestasView id={`${id}`}/>
    </>
  );
}

