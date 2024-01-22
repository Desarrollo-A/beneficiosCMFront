import { Base64 } from 'js-base64';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import InvoiceNewEditForm from '../crear-nueva-encuesta-formulario';


// ----------------------------------------------------------------------

export default function InvoiceCreateView() {
  const settings = useSettingsContext();

  /* const user = JSON.parse(Base64.decode(sessionStorage.getItem('accessToken').split('.')[2])); */

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Encuesta"
        links={[
          {
            name: 'Encuestas',
            href: paths.dashboard.root,
          },
          {
            name: 'Crear encuesta',
            href: paths.dashboard.invoice.root,
          },
         /*  {
            name: 'New Invoice',
          }, */
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <InvoiceNewEditForm />
    </Container>
  );
}
