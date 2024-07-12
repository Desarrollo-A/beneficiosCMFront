import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import { useTheme, createTheme, ThemeProvider } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { useAuthContext } from 'src/auth/hooks';
import { useInsert } from 'src/api/verificacion';
import { registrarColaborador } from 'src/api/register';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import Verificacion from './jwt-verificacion-view';

// ----------------------------------------------------------------------

export default function PreRegisterUser({ currentUser }) {
  const lightTheme = createTheme({
    palette: {
      mode: 'light',
    },
    components: {
      MuiPickersDay: {
        // Sobrescribe los estilos del día del calendario
        styleOverrides: {
          root: {
            color: 'black', // Establece el color del día a negro
          },
        },
      },
    },
  });

  const theme = useTheme();

  const { enqueueSnackbar } = useSnackbar();
  const { login } = useAuthContext();
  const password = useBoolean();
  const passwordConfirm = useBoolean();
  const router = useRouter();
  const location = useLocation();

  const insertData = useInsert(endpoints.user.verificacion);

  const [btnLoad, setBtnLoad] = useState(false);

  const [mail, setMail] = useState(true);

  const [valida, setValida] = useState(false);

  const [registroForm, setRegistroForm] = useState(false);

  const form = useForm({});

  // const email = location.state.data[0]?.correo; 

  const [mailForm, setMailForm] = useState(location.state.data[0]?.correo);

  const handleChange = async (data) => {

    const generalRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const domainRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|ciudadmaderas\.com|fundacionlamat\.com.mx|fundacionlamat\.com|gph\.com.mx|ooam\.com.mx|nyssa\.lat|seguromaderas\.com)$/;

    if (!generalRegex.test(data)) {
      setBtnLoad(false);
      enqueueSnackbar('Correo inválido', { variant: 'error' });
    } else if (!domainRegex.test(data)) {
      setBtnLoad(false);
      enqueueSnackbar('Dominio no permitido',
        { variant: 'warning', autoHideDuration: 7000 });
    } else {
      try {
        const insert = await insertData(data);

        if (insert.estatus === true) {
          enqueueSnackbar(insert.msj, { variant: 'success' });

          /* mutate(endpoints.gestor.getOfi); */

          setBtnLoad(false);
          setValida(true);
          setMail(false);
        } else {
          enqueueSnackbar(insert.msj, { variant: 'error' });

          setBtnLoad(false);
          setValida(false);
          setMail(true);
        }
      } catch (error) {
        setBtnLoad(false);
        console.error('Error en handleEstatus:', error);
        enqueueSnackbar(`¡No se pudo enviar el código!`, { variant: 'danger' });
      }
    }
  };

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

  const onSubmit = handleSubmit(async (data) => {

    const temDatos = { ...location.state.data[0], password: data.confirmNewPassword, mailForm };

    const registro = await registrarColaborador(temDatos);
    if (!registro.result) {
      enqueueSnackbar(registro.msg, {
        variant: 'warning',
      });
      return false;
    }
    enqueueSnackbar(registro.msg, {
      variant: 'success',
    });
    // Redirect con inicio de sesión
    login?.(temDatos.num_empleado, temDatos.password).then((response) => {
      if (response.result === 0) {
        enqueueSnackbar(response.message, {
          variant: 'danger',
        });
      } else {
        router.push(paths.dashboard.general.dash);
      }
    });
    return true;
  });

  const formReg = (newFormReg) => {
    setRegistroForm(newFormReg);
  };

  const styles = {
    background:
      'linear-gradient(135deg, #f5f5f8 22px,#0000000a 22px,#0000000a 24px,transparent 24px,transparent 67px,#0000000a 67px,#0000000a 69px,transparent 69px),linear-gradient(225deg, #f5f5f8 22px,#0000000a 22px,#0000000a 24px,transparent 24px,transparent 67px,#0000000a 67px,#0000000a 69px,transparent 69px) 0 64px',
    backgroundColor: 'rgb(245,245,248)',
    backgroundSize: '64px 128px',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  return (
    <Grid container sx={styles}>
      <Grid xl={3} sx={{ color: theme.palette.mode === 'dark' ? '#25303d' : '#f7f7f7' }}>
        <div style={{
          height: '70%', backgroundColor: 'white', borderRadius: '25px', border: '1px solid #ddd',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)', margin:'15px'
        }}>
          {mail !== false && registroForm === false ? (
            <FormProvider methods={form}>
              <DialogContent>
                <Box
                  rowGap={3}
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(1, 1fr)',
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                >
                  <Box mb={2} />
                  <Box
                    component="img"
                    alt="auth"
                    src={`${import.meta.env.BASE_URL}assets/img/logo.svg`}
                    sx={{
                      maxWidth: '100%',
                      position: 'center',
                    }}
                  />
                  <>
                  <Typography variant="body1" style={{ color: 'black', fontWeight: 'bold' }}>Registro de usuario</Typography>
                    <ThemeProvider theme={lightTheme}>

                      <Tooltip
                        title={
                          <>
                            <Typography color="inherit">Dominios aceptados:</Typography>
                            <em>@ciudadmaderas.com, @gmail.com, @fundacionlamat.com.mx, @fundacionlamat.com,
                              @gph.com.mx, @ooam.com.mx, @nyssa.lat, @seguromaderas.com</em>
                          </>}
                        placement="right" arrow>
                          <Typography variant="body2" style={{ color: 'black' }} mb={1}>Ingresa el correo con el cual deseas registrarte</Typography>
                        <RHFTextField name="correo" label="Correo" />
                      </Tooltip>
                    </ThemeProvider>
                    <DialogActions>
                      <LoadingButton
                        variant="contained"
                        loading={btnLoad}
                        onClick={() => {
                          setBtnLoad(true);
                          const dataMail = document.querySelector('[name="correo"]');
                          handleChange(dataMail.value);
                          setMailForm(dataMail.value);
                        }}
                      >
                        Enviar código de verificación
                      </LoadingButton>
                    </DialogActions>
                  </>
                </Box>
              </DialogContent>
            </FormProvider>
          ) : null}

          {valida !== false && registroForm === false ? (
            <Verificacion email={mailForm} formReg={formReg} />
          ) : null}

          {registroForm !== false ? (
            <FormProvider methods={methods} onSubmit={onSubmit}>
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
                  <Box mb={2} />
                  <Box
                    component="img"
                    alt="auth"
                    src={`${import.meta.env.BASE_URL}assets/img/logo.svg`}
                    sx={{
                      maxWidth: '100%',
                      position: 'center',
                    }}
                  />
                  <DialogTitle style={{ paddingLeft: '0px', color: 'black' }}>Registro de usuario</DialogTitle>
                  <RHFTextField
                    name="numEmpleado"
                    value={location.state.data[0].num_empleado}
                    disabled
                    label="Número de empleado"
                  />
                  <RHFTextField
                    name="name"
                    value={`${location.state.data[0].nombre_persona} ${location.state.data[0].pri_apellido} ${location.state.data[0].sec_apellido}`}
                    label="Nombre completo"
                    disabled
                  />
                  <ThemeProvider theme={lightTheme}>
                    <RHFTextField
                      name="newPassword"
                      label="Contraseña"
                      type={password.value ? 'text' : 'password'}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={password.onToggle} edge="end">
                              <Iconify
                                icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                              />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <RHFTextField
                      name="confirmNewPassword"
                      type={passwordConfirm.value ? 'text' : 'password'}
                      label="Confirmar nueva contraseña"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={passwordConfirm.onToggle} edge="end">
                              <Iconify
                                icon={
                                  passwordConfirm.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'
                                }
                              />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </ThemeProvider>
                </Box>
              </DialogContent>

              <DialogActions>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  Registrarse
                </LoadingButton>
              </DialogActions>
            </FormProvider>
          ) : null}
        </div>
      </Grid>
    </Grid>
  );
}

PreRegisterUser.propTypes = {
  currentUser: PropTypes.object,
};
