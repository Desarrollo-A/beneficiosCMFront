import * as Yup from 'yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { enqueueSnackbar } from 'notistack';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { Button } from '@mui/material';
// import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { useAuthContext } from 'src/auth/hooks';
import { PATH_AFTER_LOGIN } from 'src/config-global';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import ModalPoliticas from './modal-politicas';

//---------------------------------------------------------

export default function JwtLoginView() {
  const { login } = useAuthContext();
  const theme = useTheme();

  const router = useRouter();

  const quickEdit = useBoolean();

  // const [errorMsg] = useState('');
  const [numEmpleado, setnumEmpleado] = useState('');
  const [passwd, setPasswd] = useState('');
  const [ isSubmitting, setSubmitting ] = useState(false)

  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo');

  const password = useBoolean();

  const LoginSchema = Yup.object().shape({
    numEmpleado: Yup.string().required('Número de empleado requerido'),
    password: Yup.string().required('Contraseña requerida'),
  });

  const defaultValues = {
    'numEmpleado': numEmpleado,
    'password': passwd,
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const onSubmit = (e) => {
    setSubmitting(true)

    e.preventDefault();
    login?.(numEmpleado, passwd)
      .then(response => {
        if (response === undefined) {
          router.push(returnTo || PATH_AFTER_LOGIN);
        }
        else if (response.result === 2) {
          enqueueSnackbar(response.message, { variant: "error" });
        }
        else if (response !== undefined && response.result === 0) {
          enqueueSnackbar(response.message, { variant: "error" });
        }

        setSubmitting(false)
      })
  }

  const isMobile = useMediaQuery('(max-width: 960px)');

  let colorDist = '#25303d'; // colores sobre el tema que tenga

  if (!isMobile && theme.palette.mode === 'dark') {
    colorDist = '#f7f7f7';
  }

  const renderHead = (
    <Stack spacing={1} sx={{ mb: 0 }}>
      <Box mb={-5} />
      <Box
        component="img"
        alt="auth"
        src={`${import.meta.env.BASE_URL}assets/img/logo.svg`}
        sx={{
          maxWidth: '100%',
          position: 'center',
        }}
      />
      <Typography variant="h4">Iniciar sesión</Typography>

      <Stack direction="row" spacing={1}>
        <Typography variant="body2">¿Aún no tienes una cuenta? Puedas crearla &nbsp;

          <Link component={RouterLink} href={paths.auth.jwt.register} variant="subtitle2">
            aquí
          </Link>
        </Typography>
        <Box mb={7} />
      </Stack>
    </Stack>

  );

  const renderForm = (
    <Stack spacing={2.5}>
      {/* {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>} */}

      <RHFTextField name="numEmpleado" value={numEmpleado} onChange={(e) => setnumEmpleado(e.target.value)} label="Número de empleado" autoComplete="off" color={colorDist} />

      <RHFTextField
        name="password"
        label="Contraseña"
        autoComplete="off"
        color={colorDist}
        type={password.value ? 'text' : 'password'}
        value={passwd} onChange={(e) => setPasswd(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        Iniciar
      </LoadingButton>
    </Stack >
  );

  const logoMd = (
    <Stack>
      {isMobile && (
        <Box
          component="img"
          alt="auth"
          src={`${import.meta.env.BASE_URL}assets/img/logoMaderas.svg`}
          sx={{
            maxWidth: { xs: 480, lg: 560, xl: 720 },
            position: 'absolute',
            width: { xs: '50%', md: '21%' },
            left: { xs: '25%', md: '40%' },
            top: { xs: '68%', md: '87%' }
          }}
        />
      )}
      {!isMobile && (
        <Box
          component="img"
          alt="auth"
          src={`${import.meta.env.BASE_URL}assets/img/logoMaderas.svg`}
          sx={{
            position: 'absolute',
            left: '37%',
            width: { xs: '55%', md: '26%' },
            top: { md: '90%', lg: '95%', xl: '102%' }
          }}
        />
      )}
    </Stack>
  );

  const renderTerms = (
    <Stack sx={{ mt: 3 }}>
      <Stack direction="row" spacing={1}>
        <Typography variant="body2">¿Has olvidado tu contraseña?, Recupérala &nbsp;

          <Link component={RouterLink} href={paths.auth.jwt.forgotPassword} variant="subtitle2">
            aquí
          </Link>
        </Typography>
        <Box mb={7} />
      </Stack>

      {isMobile && (
        <Typography
          component="div"
          sx={{
            color: 'text.secondary',
            typography: 'caption',
            textAlign: 'center',
            mt: -3
          }}
        >
          <ModalPoliticas open={quickEdit.value} onClose={quickEdit.onFalse} />

          {'Al registrarme, acepto '}
          {' las '}
          <Button variant="outlined" color="primary" sx={{ height: "20px" }} onClick={quickEdit.onTrue}>
            Políticas de privacidad
          </Button>
        </Typography>)}

      {!isMobile && (
        <Typography
          component="div"
          sx={{
            color: 'text.secondary',
            typography: 'caption',
            textAlign: 'center',
          }}
        >
          <ModalPoliticas open={quickEdit.value} onClose={quickEdit.onFalse} />

          {'Al registrarme, acepto '}
          {' las '}
          <Button variant="outlined" color="primary" sx={{ height: "20px" }} onClick={quickEdit.onTrue}>
            Políticas de privacidad
          </Button>
        </Typography>)}
    </Stack>
  );

  const space = (
    <Divider sx={{ my: { xs: 12, md: 5, lg: 2, xl: 0 }, borderStyle: 'none' }} />
  )

  return (

    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHead}

      {renderForm}

      {logoMd}

      {renderTerms}

      {space}
    </FormProvider>
  );
}
