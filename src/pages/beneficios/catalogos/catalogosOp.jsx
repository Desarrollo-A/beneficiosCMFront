
import { Helmet } from 'react-helmet-async';

import { useSession } from 'src/hooks/use-session';
      
import { CatalogosOpView } from 'src/sections/Catalogos/view';


export default function CatalogosOpPage() {

  useSession();

  return (
    <>
      <Helmet>
        <title>Catálogos|Edit</title>
      </Helmet>

      <CatalogosOpView />
    </>
  );
}

