import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { endpoints } from 'src/utils/axios';

import { useAuthContext } from 'src/auth/hooks';
import { usePostGeneral } from 'src/api/general';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import EncuestasLista from '../encuestasLista';

// ----------------------------------------------------------------------

export default function VerEncuestasView() {
  const settings = useSettingsContext();

  const { user } = useAuthContext();

  const { getData } = usePostGeneral(user.idPuesto, endpoints.encuestas.getEncuestasCreadas, "getData");

  const { EstatusData } = usePostGeneral(user.idPuesto, endpoints.encuestas.getEstatusUno, "EstatusData");

  return (
    
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Encuestas"
          links={[
            {
              name: 'Encuestas',
              href: paths.dashboard.root,
            },/* 
            {
              name: 'User',
              href: paths.dashboard.usuarios.root,
            }, */
            { name: 'Listado de encuestas' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <EncuestasLista encuestas={getData} estatusCt={EstatusData}/>
      </Container>
  );
}