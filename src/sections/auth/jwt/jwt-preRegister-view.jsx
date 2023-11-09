import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import IconButton from '@mui/material/IconButton';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { useBoolean } from 'src/hooks/use-boolean';
import { useRouter } from 'src/routes/hooks';
import { useLocation } from 'react-router-dom';

import { countries } from 'src/assets/data';
import { USER_STATUS_OPTIONS } from 'src/_mock';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import Servicios from 'src/utils/servicios';
// ----------------------------------------------------------------------

export default function preRegisterUser({ currentUser, open, onClose }) {

  const { enqueueSnackbar } = useSnackbar();
  const password = useBoolean();
  const router = useRouter();
  const  location  = useLocation();
  const datosEmpleado = location.state.data[0];
  console.log(datosEmpleado);
const servicios = Servicios();
  const NewUserSchema = Yup.object().shape({
    numEmpleado: Yup.string(),
    name: Yup.string(),
    email: Yup.string(),
    telPersonal: Yup.string(),
    telOficina: Yup.string(),
    puesto: Yup.string(),
    area: Yup.string(),
    nom_oficina: Yup.string(),
    sede: Yup.string(),
    password: Yup.string().required('La contraseña es requerida'),
  });

  const defaultValues = useMemo(
    () => ({
      numEmpleado: currentUser?.numEmpleado || '',
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      telPersonal: currentUser?.telPersonal || '',
      telOficina: currentUser?.telOficina || '',
      puesto: currentUser?.puesto || '',
      area: currentUser?.area || '',
      nom_oficina: currentUser?.nom_oficina || '',
      sede: currentUser?.sede || '',
      password: currentUser?.password || '',
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    console.log('datos formulario')
    console.log(data);
    datosEmpleado.password = data.password;
    console.log(datosEmpleado);
    JSON.stringify(datosEmpleado);
    await servicios.addRegistroEmpleado(data => {
      console.log(data);
    },{
      params : datosEmpleado
    }
    );
    return false;
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      onClose();
      enqueueSnackbar('Update success!');
      console.info('DATA', data);
    } catch (error) {
      console.error(error);1
    }
  });

  return (
    
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Registro de usuario</DialogTitle>

        <DialogContent>
          <Alert variant="outlined" severity="info" sx={{ mb: 3 }}>
            Es necesario ingresar una constraseña
          </Alert>

          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          >

           
            <RHFTextField name="numEmpleado" value={datosEmpleado.num_empleado} disabled label="Número de empleado" />
            <RHFTextField name="name"  value={datosEmpleado.nombre_completo}  label="Nombre completo" />
            <RHFTextField name="email" value={datosEmpleado.email_empresarial} disabled label="Correo empresarial" />
            <RHFTextField name="telPersonal" value={datosEmpleado.tel_personal} disabled  label="Teléfono personal" />
            <RHFTextField name="telOficina" value={datosEmpleado.tel_oficina} disabled label="Teléfono oficina" />
            <RHFTextField name="puesto" value={datosEmpleado.puesto} disabled label="Puesto" />
            <RHFTextField name="area" value={datosEmpleado.area} disabled label="Área" />
            <RHFTextField name="nom_oficina" value={datosEmpleado.nom_oficina} disabled label="Oficina" />
            <RHFTextField name="sede" value={datosEmpleado.sede} disabled label="Sede" />

            <RHFTextField name="password"
            label="Contraseña"
            type={password.value ? 'text' : 'password'}
            InputProps={{
            endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
            ),
            }} />
            
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancelar
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Registrarse
          </LoadingButton>
        </DialogActions>
      </FormProvider>
  );
}
