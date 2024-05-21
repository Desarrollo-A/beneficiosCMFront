import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

// import CollapsibleTable from './collapsible-table';
import CollapsibleTable from '../atencion-por-sede-components/collapsible-table';

// import AtencionesContent from './atenciones-content';
// ----------------------------------------------------------------------

export default function AtencionPorSede() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Atención por sede"
        links={[{ name: 'Gestor' }, { name: 'Atención por sede' }]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Card sx={{ width: 1 }}>
        <CardHeader title="Registrar atención por sede" />
        <CardContent>
          <CollapsibleTable />
        </CardContent>
      </Card>
    </Container>
  );
}

// ----------------------------------------------------------------------
