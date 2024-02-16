import * as Yup from 'yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { useAuthContext } from 'src/auth/hooks';
import { PATH_AFTER_LOGIN } from 'src/config-global';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

export default function JwtLoginView() {
  const { login } = useAuthContext();

  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState('');
  const [numEmpleado,setnumEmpleado] = useState('');
  const [passwd,setPasswd] = useState('');
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

  const {
    formState: { isSubmitting },
  } = methods;


  const onSubmit = (e) => {
    e.preventDefault();
    login?.(numEmpleado, passwd)
    .then(response=>{
      if(response === undefined){
        router.push(returnTo || PATH_AFTER_LOGIN);
      }
      else if(response !== undefined && response.result === 0){
        setErrorMsg(response.message);
      }
    })
  }

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5 }}>
      <div>
        <Box
          component="img"
          alt="auth"
          src={ `${import.meta.env.BASE_URL}assets/img/logoBeneficios.svg`}
          sx={{
            maxWidth: {
              xs: 480,
              lg: 560,
              xl: 720,
            },
            position: 'absolute',
            width: '24%',
            left: '64%',
            top: '-20%'
          }}
        />
        <Box
          component="img"
          alt="auth"
          src={ `${import.meta.env.BASE_URL}assets/img/beneficiosBrand.svg`}
          sx={{
            maxWidth: {
              xs: 480,
              lg: 560,
              xl: 720,
            }
          }}
        />
      </div>
      <Typography variant="h4">Iniciar sesión</Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2">¿Aún no tienes una cuenta? Puedas crearla</Typography>

        <Link component={RouterLink} href={paths.auth.jwt.register} variant="subtitle2">
          aquí
        </Link>
      </Stack>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      <RHFTextField name="numEmpleado" value={numEmpleado} onChange={(e) => setnumEmpleado(e.target.value)}  label="Número de empleado" />

      <RHFTextField
        name="password"
        label="Contraseña"
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
    </Stack>
  );

  return (
    
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHead}

      {renderForm}
    </FormProvider>
  );
}
