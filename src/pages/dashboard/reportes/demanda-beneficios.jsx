import { Helmet } from 'react-helmet-async';

import { useSession } from 'src/hooks/use-session';

import { DemandaBeneficiosView } from 'src/sections/reportes/view';


// ----------------------------------------------------------------------

export default function DemandaBeneficiosPage() {

  useSession();

  return (
    <>
      <Helmet>
        <title>Beneficios CDM | demanda beneficios</title>
      </Helmet>

      < DemandaBeneficiosView />
    </>
  );
}