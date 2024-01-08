import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { VerEncuestadetalleView } from 'src/sections/encuestas/view';

// ----------------------------------------------------------------------

export default function EncuestaDetallePage() {

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