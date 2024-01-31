import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { useSession } from 'src/hooks/use-session';

import { CalificarCita } from 'src/sections/overview/calendarioespecialista/view';

// ----------------------------------------------------------------------

export default function EvaluacionCitasPage() {

  useSession();

  const params = useParams();

  const { id } = params;
  console.log(id);

  return (
    <>
      <Helmet>
        <title> Calificar cita</title>
      </Helmet>

       <CalificarCita id={1} />
    </>
  );
}

