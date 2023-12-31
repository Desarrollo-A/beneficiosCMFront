import * as Yup from 'yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import instance from 'src/utils/axiosCH';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { Base64 } from 'js-base64';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams,useParams } from 'src/routes/hooks';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router';

import { useAuthContext } from 'src/auth/hooks';
import { PATH_AFTER_LOGIN } from 'src/config-global';
import { PATH_AFTER_REGISTRO } from 'src/config-global';

import FormProvider, { RHFTextField } from 'src/components/hook-form';
// ----------------------------------------------------------------------

export default function JwtRegisterView() {
  const [numEmpleado,setnumEmpleado] = useState('');

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

      router.push(returnTo || PATH_AFTER_LOGIN,{ state: {userdata: datosResponse}} );
    } catch (error) {
      console.error(error);
      reset();
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  const validarNumEmpleado = () => {
    if(numEmpleado.trim() === ''){
        console.log('Ingrasar numero de empleado valido');
    }else{
      // Conectar axios con CH
      const datos = Base64.encode(JSON.stringify({numempleado : numEmpleado}));

      instance.post('info_empleado', datos)
      .then(response=>{
        let datosResponse = Base64.decode(JSON.stringify(response.data.response));
        datosResponse = JSON.parse(datosResponse);

        if(datosResponse.resultado === 0){
          setErrorMsg(typeof error === 'string' ? error : 'Número de empleado no encontrado');
        }else{
          navigate(PATH_AFTER_REGISTRO,{state:datosResponse});
          location(PATH_AFTER_REGISTRO,{state:datosResponse});
          router.push(returnTo || PATH_AFTER_REGISTRO);
        }
      })
      .catch(error=>{
        console.error(error);
      });
        
    }
}

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
      <Typography variant="h4">Registro de usuarios</Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2"> ¿Ya tienes una cuenta? </Typography>

        <Link href={paths.auth.jwt.login} component={RouterLink} variant="subtitle2">
          Iniciar sesión
        </Link>
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
      {'By signing up, I agree to '}
      <Link underline="always" color="text.primary">
        Nuestros servicios
      </Link>
      {' and '}
      <Link underline="always" color="text.primary">
        Politicas de privacidad
      </Link>
      .
    </Typography>
  );

  const renderForm = (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack spacing={2.5}>
        {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
        <RHFTextField name="numEmpleado" value={numEmpleado} onChange={(e) => setnumEmpleado(e.target.value)} label="Número de empleado" />
        <LoadingButton
          fullWidth
          color="inherit"
          size="large"
          type="submit"
          variant="contained"
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
    </>
  );
}
