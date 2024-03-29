import * as Yup from 'yup';
import { useState } from 'react';
import { Base64 } from 'js-base64';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useLocation } from 'react-router';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import instance from 'src/utils/axiosCH';

import { useAuthContext } from 'src/auth/hooks';
import { PATH_AFTER_LOGIN, PATH_AFTER_REGISTRO } from 'src/config-global';

import FormProvider, { RHFTextField } from 'src/components/hook-form';
// ----------------------------------------------------------------------

export default function JwtRegisterView() {
  const [numEmpleado, setnumEmpleado] = useState('');

  const { register } = useAuthContext();

  const router = useRouter();
  const navigate = useNavigate();
  const location = useLocation();

  const [errorMsg, setErrorMsg] = useState('');

  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo');

  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().required('First name required'),
    lastName: Yup.string().required('Last name required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
  });

  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await register?.(data.email, data.firstName, data.lastName);

      router.push(returnTo || PATH_AFTER_LOGIN, { state: { userdata: data } });
    } catch (error) {
      console.error(error);
      reset();
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  const validarNumEmpleado = () => {
    if (numEmpleado.trim() === '') {
      //  console.log('Ingresar número de empleado válido');
    } else {
      // Conectar axios con CH
      const datos = Base64.encode(JSON.stringify({ num_empleado: numEmpleado }));
      // console.log(datos);

      const config = {
        headers: {
          Authorization: '41EgSP8+YSqsyT1ZRuxTK3CYR11LOcyqopI2TTNJd3EL+aU3MUdJNsKGx8xOK+HH',
          Accept: '*/*',
          Origin: 'https://prueba.gphsis.com/auth/jwt/register',
        },
      };

      instance
        .post('https://rh.gphsis.com/index.php/WS/data_colaborador_consultas', datos, config)
        .then((response) => {
          let datosResponse = Base64.decode(JSON.stringify(response.data));
          datosResponse = JSON.parse(datosResponse);
          // if(datosResponse.resultado === 0){ // se cambio ya que este no daba el resultado
          if (datosResponse.data.length === 0) {
            setErrorMsg('Número de empleado no encontrado');
          } else {
            navigate(PATH_AFTER_REGISTRO, { state: datosResponse });
            location(PATH_AFTER_REGISTRO, { state: datosResponse });
            router.push(returnTo || PATH_AFTER_REGISTRO);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const renderHead = (
    <Stack spacing={1} sx={{ mb: 0 }}>´
      <Box
        component="img"
        alt="auth"
        src={`${import.meta.env.BASE_URL}assets/img/logoBeneficios.svg`}
        sx={{
          maxWidth: { xs: 480, lg: 560, xl: 720 },
          position: 'absolute',
          width: { xs: '25%', md: '16%' },
          left: '64%',
          top: { xs: '10%', md: '-9%' }
        }}
      />
      <Box
          component="img"
          alt="auth"
          src={`${import.meta.env.BASE_URL}assets/img/beneficiosBrand.svg`}
          sx={{
            maxWidth: {
              xs: 480,
              lg: 560,
              xl: 720,
            }
          }}
        />
      <Typography variant="h4">Registro de usuarios</Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2"> ¿Ya tienes una cuenta? </Typography>

        <Link href={import.meta.env.BASE_URL} component={RouterLink} variant="subtitle2">
          Iniciar sesión
        </Link>
        <Box mb={7} />
      </Stack>
    </Stack>
  );

  const renderTerms = (
    <Typography
      component="div"
      sx={{
        color: 'text.secondary',
        mt: 2.5,
        typography: 'caption',
        textAlign: 'center',
      }}
    >
      {'Al registrarme, acepto '}
      {' las '}
      <Link underline="always" color="text.primary" onclick="">
        Políticas de privacidad
      </Link>
      .
    </Typography>
  );

  const renderForm = (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack spacing={2.5}>
        {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
        <RHFTextField
          name="numEmpleado"
          value={numEmpleado}
          onChange={(e) => setnumEmpleado(e.target.value)}
          label="Número de empleado"
        />
        <LoadingButton
          fullWidth
          color="inherit"
          size="large"
          type="submit"
          variant="contained"
          autoComplete="off"
          loading={isSubmitting}
          onClick={() => validarNumEmpleado()}
        >
          Consultar
        </LoadingButton>
      </Stack>
    </FormProvider>
  );

  return (
    <>
      {renderHead}

      {renderForm}

      {renderTerms}

      {/* <Dialog
        open={open}
        onClose={handleClose}
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">Subscribe</DialogTitle>
        <DialogContent dividers={scroll === 'paper'}>
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
          >
            {[...new Array(50)]
              .map(
                () => `Cras mattis consectetur purus sit amet fermentum.
Cras justo odio, dapibus ac facilisis in, egestas eget quam.
Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
Praesent commodo cursus magna, vel scelerisque nisl consectetur et.`,
              )
              .join('\n')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleClose}>Subscribe</Button>
        </DialogActions>
      </Dialog> */}
    </>
  );
}
