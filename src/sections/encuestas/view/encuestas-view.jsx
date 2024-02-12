import { useLocation } from 'react-router-dom';

import Container from '@mui/material/Container';

// import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import FormularioEncuesta from '../formulario-encuesta';

// ----------------------------------------------------------------------

export default function EncuestasView() {
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
            /* name: 'Encuesta',
            href: paths.dashboard.root, */
          },
          /* {
            name: 'User',
            href: paths.dashboard.user.root,
          },
          { name: 'New user' }, */
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <FormularioEncuesta 
        idEncuesta={idEncuesta}
      />
    </Container>
  );
}
