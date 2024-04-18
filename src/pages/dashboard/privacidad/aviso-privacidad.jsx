import { Helmet } from 'react-helmet-async';

// import { useParams } from 'src/routes/hooks';

import { AvisoPrivacidadGeneral } from 'src/sections/privacidad';

// ----------------------------------------------------------------------

export default function AvisosDePrivacidad() {
  // const params = useParams();

  // const { id } = params;

  return (
    <>
      <Helmet>
        <title> Políticas de privacidad</title>
      </Helmet>

      <AvisoPrivacidadGeneral/>
    </>
  );
}
