// import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';

import { useGetSolicitudes } from 'src/api/fondoAhorro/solicitudes';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import '../../style.css';
import SolicitudesTable from '../../solicitudes-table';

// ----------------------------------------------------------------------

export default function SolicitudesView() {
  const settings = useSettingsContext();

  const { data: solicitudes, mutate } = useGetSolicitudes();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Solicitudes de fondos de ahorros"
        links={[{ name: '' }]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <SolicitudesTable solicitudes={solicitudes} solicitudesMutate={mutate} />
    </Container>
  );
}
