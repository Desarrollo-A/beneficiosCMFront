import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useMemo , useState } from 'react';
import { useLocation } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import Servicios from 'src/utils/servicios';

import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {  RHFTextField } from 'src/components/hook-form';
// ----------------------------------------------------------------------

export default function preRegisterUser({ currentUser }) {
  const { login } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();
  const password = useBoolean();
  const passwordConfirm = useBoolean();
  const router = useRouter();
  const  location  = useLocation();
  const [datosEmpleado,setDatosEmpleado] = useState( location.state.data[0]);


const servicios = Servicios();
const NewUserSchema = Yup.object().shape({
  numEmpleado: Yup.string(),
  name: Yup.string(),
  newPassword: Yup.string()
      .required('Campo requerido')
      .min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmNewPassword: Yup.string().oneOf([Yup.ref('newPassword')], 'No coicide la contraseña'),
});

  const defaultValues = useMemo(
    () => ({
      numEmpleado: currentUser?.numEmpleado || '',
      name: currentUser?.name || '',
      confirmNewPassword: currentUser?.confirmNewPassword || '',
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit( (data) => {
    const temDatos = {...datosEmpleado,password:data.confirmNewPassword}
    setDatosEmpleado(temDatos);
     servicios.addRegistroEmpleado(data => {
      if(data.estatus === 1){
        login?.(datosEmpleado.num_empleado, temDatos.confirmNewPassword)
        .then(response=>{
          console.log(response);
          if(response.result === 0){
            setErrorMsg(typeof error === 'string' ? error : response.message);
          }else{
              router.push(returnTo || PATH_AFTER_LOGIN);
          }
        })
      }
    },{
      params:temDatos
    }
    );
  });

  const styles = {
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    backgroundImage: 'url(/assets/background/bgRegister.jpg)',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  return (
    <Grid container sx={styles}>
      <Grid xs={12} sm={12} md={3}>
          <FormProvider methods={methods} onSubmit={onSubmit}>
            <div style={{height: '50%', backgroundColor:'white', borderRadius: '25px'}}>
              <DialogContent>
                <Box
                  rowGap={3}
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(1, 1fr)',
                  }}
                >
                  <DialogTitle style={{paddingLeft:'0px'}}>Registro de usuario</DialogTitle>
                  <RHFTextField name="numEmpleado" value={datosEmpleado.num_empleado} disabled label="Número de empleado" />
                  <RHFTextField name="name" value={`${datosEmpleado.nombre_persona} ${datosEmpleado.pri_apellido} ${datosEmpleado.sec_apellido}`} label="Nombre completo" disabled/>
                  <RHFTextField name="newPassword"
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
                  <RHFTextField name="confirmNewPassword"
                  type={passwordConfirm.value ? 'text' : 'password'}
                  label="Confirmar nueva contraseña"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={passwordConfirm.onToggle} edge="end">
                          <Iconify icon={passwordConfirm.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                </Box>
              </DialogContent>

              <DialogActions>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  Registrarse
                </LoadingButton>
              </DialogActions>
            </div>
          </FormProvider>
        </Grid>
      </Grid>
  );
}
