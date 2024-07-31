import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { enqueueSnackbar } from 'notistack';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState, useEffect, useCallback } from 'react';

import { Box } from '@mui/material';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
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
import { useCountdownSeconds } from 'src/hooks/use-countdown';

import { SentIcon } from 'src/assets/icons'
import { validarNumEmp, recuperarPassword, guardarNuevaPassword } from 'src/api/register';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFCode, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function JwtNewPasswordView() {
  const theme = useTheme();

  const router = useRouter();

  const searchParams = useSearchParams();

  const noEmp = searchParams.get('noEmp');

  const [mailEmp, setMailEmp] = useState('');

  const [idEmp, setIdEmp] = useState('');

  const validate = useCallback(async()=> {
    const check = await validarNumEmp(noEmp);

    if(!check.result){
      const href = `${paths.auth.jwt.forgotPassword}`;
      router.push(href);
    }
    else{
      setMailEmp(check.mailEmp);
      setIdEmp(check.idEmp);
    }
  }, [noEmp, router])

  useEffect(() => {
    if(!noEmp){
      const href = `${paths.auth.jwt.forgotPassword}`;
      router.push(href);
    }
    else{
      validate();
    }
  }, [noEmp, router, validate]);

  const isMobile = useMediaQuery('(max-width: 960px)');
  let colorDist = '#25303d'; // colores sobre el tema que tenga

  if(!isMobile && theme.palette.mode === 'dark'){
    colorDist = '#f7f7f7';
  }

  const password = useBoolean();

  const { countdown, counting } = useCountdownSeconds(60);

  const VerifySchema = Yup.object().shape({
    code: Yup.string().min(6, 'El código debe ser de 6 caracteres').required('Se requiere el código'),
    noEmp: Yup.string().required('El número de empleado no puede estar vacío'),
    password: Yup.string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .required('La contraseña es requerida'),
    confirmPassword: Yup.string()
      .required('Se debe confirmar la nueva contraseña')
      .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden'),
  });

  const defaultValues = {
    code: '',
    noEmp: noEmp || '',
    password: '',
    confirmPassword: '',
  };

  const methods = useForm({
    mode: 'onChange',
    resolver: yupResolver(VerifySchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const save = await guardarNuevaPassword(data.noEmp, data.code, data.password, mailEmp, idEmp);

      if(save.result){
        enqueueSnackbar(save.msg);
        router.push(paths.auth.amplify.login);
      }
      else{
        enqueueSnackbar({variant: "error", message: save.msg });
      }
    } catch (error) {
      enqueueSnackbar({variant: "error", message: "Ha ocurrido un error al enviar los datos" });
    }
  });

  const handleResendCode = useCallback(async () => {
    try {
      const recover = await recuperarPassword(noEmp);

      if(recover.result){
        enqueueSnackbar("Se ha enviado un nuevo código");
      }
      else{
        enqueueSnackbar({variant: "error", message: recover.msg});
      }      
    }  catch (error) {
      console.error(error);
    }
  }, [noEmp]);

  const renderForm = (
    <Stack spacing={1.5} alignItems="center">
      <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'left' }}>
          Ingresa el código de verificación
      </Typography>
      <RHFCode name="code" color={colorDist}/>
      <RHFTextField
        name="noEmp"
        label="Número de empleado"
        disabled
        InputLabelProps={{ shrink: true }}
      />

      <RHFTextField
        name="password"
        label="Nueva contraseña"
        type={password.value ? 'text' : 'password'}
        color={colorDist}
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

      <RHFTextField
        name="confirmPassword"
        label="Confirma nueva contraseña"
        type={password.value ? 'text' : 'password'}
        color={colorDist}
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
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        Guardar
      </LoadingButton>

      <Typography variant="body2">
        {`¿No te llego el código? `}
        <Link
          variant="subtitle2"
          onClick={handleResendCode}
          sx={{
            cursor: 'pointer',
            ...(counting && {
              color: 'text.disabled',
              pointerEvents: 'none',
            }),
          }}
        >
          Reenviar código {counting && `(${countdown}s)`}
        </Link>
      </Typography>

      <Link
        component={RouterLink}
        href={paths.auth.amplify.login}
        color="inherit"
        variant="subtitle2"
        sx={{
          alignItems: 'center',
          display: 'inline-flex',
        }}
      >
        <Iconify icon="eva:arrow-ios-back-fill" width={16} />
        Regresar
      </Link>

    </Stack>
    
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
            top: '90%'
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

  const renderHead = (
    <>
    <Box mb={-2}>
      <SentIcon sx={{ height: 50 }} />

      <Stack alignItems="center">
        <Typography variant="h3" sx={{color: colorDist}}>Solicitud enviada</Typography>
      </Stack>
    </Box>
      <Box mb={2}/>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit} >
      {renderHead}

      {logoMd}

      {renderForm}
    </FormProvider>
  );
}
