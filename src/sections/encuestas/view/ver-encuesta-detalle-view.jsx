import { useLocation } from 'react-router-dom';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import DetalleEncuesta from '../encuesta-detalle';

// ----------------------------------------------------------------------

export default function VerEncuestaDetalleView() {
  const settings = useSettingsContext();

  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const idEncuesta = searchParams.get('idEncuesta');

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Encuesta"
        links={[
          {
             name: 'Encuesta',
            /* href: paths.dashboard.root, */
          },
          {
            name: 'Listado de encuestas',
            href: paths.dashboard.encuestas.ver,
          },
          { name: 'Detalle' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <DetalleEncuesta 
        idEncuesta={idEncuesta}
      />
    </Container>
  );
}
