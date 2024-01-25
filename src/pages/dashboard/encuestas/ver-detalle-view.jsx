import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { useSession } from 'src/hooks/use-session';

import { VerEncuestadetalleView } from 'src/sections/encuestas/view';

// ----------------------------------------------------------------------

export default function EncuestaDetallePage() {

  useSession();

  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Dashboard: Encuestas</title>
      </Helmet>

      < VerEncuestadetalleView id={`${id}`}/>
    </>
  );
}