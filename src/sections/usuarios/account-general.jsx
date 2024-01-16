import { Base64 } from 'js-base64';
import { useForm } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';

import { endpoints } from 'src/utils/axios';

import { usePostGeneral } from 'src/api/general';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField
} from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function AccountGeneral() {

  const datosUser = JSON.parse(Base64.decode(sessionStorage.getItem('accessToken').split('.')[2]));

  const { puestoData } = usePostGeneral(datosUser.idUsuario, endpoints.user.puesto, "puestoData");

  const { sedeData } = usePostGeneral(datosUser.sede, endpoints.user.sede, "sedeData");

  const methods = useForm({
  });

  return (
    <FormProvider methods={methods} >
      <Grid container spacing={3}>

        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              
              <RHFTextField name="nombre" label="Nombre" defaultValue={datosUser.nombre} disabled/>
              <RHFTextField name="numEmpleado" label="Número de empleado" defaultValue={datosUser.numEmpleado} disabled/>
              <RHFTextField name="correo" label="Correo" defaultValue={datosUser.correo} disabled/>
              <RHFTextField name="telPersonal" label="Teléfono" defaultValue={datosUser.telPersonal} disabled/>

              {puestoData.flatMap((u) => (
              <RHFTextField name="puesto" label="Puesto" defaultValue={u.puesto} disabled/>
              ))}

              {sedeData.flatMap((u) => (
              <RHFTextField name="sede" label="Sede" defaultValue={u.sede} disabled/>
              ))}

            </Box>

          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
