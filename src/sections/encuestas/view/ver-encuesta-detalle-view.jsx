import { useLocation } from 'react-router-dom';

import Container from '@mui/material/Container';

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
          },
          {
            name: 'Listado de encuestas',
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
