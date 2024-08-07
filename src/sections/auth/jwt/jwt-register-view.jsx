import * as Yup from 'yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useLocation } from 'react-router';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
// import useMediaQuery from '@mui/material/useMediaQuery';

import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { getColaborador } from 'src/api/user';
import { useAuthContext } from 'src/auth/hooks';
import { PATH_AFTER_LOGIN, PATH_AFTER_REGISTRO } from 'src/config-global';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import ModalPoliticas from './modal-politicas';
// ----------------------------------------------------------------------

export default function JwtRegisterView() {
  const [numEmpleado, setnumEmpleado] = useState('');

  const { enqueueSnackbar } = useSnackbar();

  const { register } = useAuthContext();

  const quickEdit = useBoolean();

  // const isMobile = useMediaQuery('(max-width: 960px)');

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

  const validarNumEmpleado = async () => {
    const response = await getColaborador(numEmpleado);
    if (!response.result) {
      enqueueSnackbar(response.msg, { variant: 'error' });
      return false;
    }
    navigate(PATH_AFTER_REGISTRO, { state: response });
    location(PATH_AFTER_REGISTRO, { state: response });
    router.push(returnTo || PATH_AFTER_REGISTRO);

    return true;
  };

  const renderHead = (
    <Stack spacing={1} sx={{ mb: 0 }}>
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
      <ModalPoliticas open={quickEdit.value} onClose={quickEdit.onFalse} />

      {'Al registrarme, acepto '}
      {' las '}
      <Button variant="outlined" color="primary" sx={{ height: '20px' }} onClick={quickEdit.onTrue}>
        Políticas de privacidad
      </Button>
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

  const logoMd = (
    <Stack>
      <Box
        component="img"
        alt="auth"
        src={`${import.meta.env.BASE_URL}assets/img/logoMaderas.svg`}
        sx={{
          maxWidth: { xs: 480, lg: 560, xl: 720 },
          position: 'absolute',
          width: { xs: '50%', md: '35%' },
          left: { xs: '25%', md: '30%' },
          top: { xs: '90%', md: '105%' }
        }}
      />
    </Stack>
  );

  return (
    <>
      {renderHead}

      {renderForm}
      {logoMd}
      {renderTerms}


    </>
  );
}
