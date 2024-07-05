import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { enqueueSnackbar } from 'notistack';
import { yupResolver } from '@hookform/resolvers/yup';

import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import useMediaQuery from '@mui/material/useMediaQuery';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { PasswordIcon } from 'src/assets/icons';
import { recuperarPassword } from 'src/api/register';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function JwtForgotPasswordView() {
  const router = useRouter();
  const theme = useTheme();

  const ForgotPasswordSchema = Yup.object().shape({
    noEmp: Yup.string().required('Se requiere el numero de empleado').test('len', 'Deben ser más de 1 caracter', val => val.length >= 1),
  });

  const defaultValues = {
    noEmp: '',
  };

  const methods = useForm({
    resolver: yupResolver(ForgotPasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const isMobile = useMediaQuery('(max-width: 960px)');

  let colorDist = '#25303d'; // colores sobre el tema que tenga

  if(!isMobile && theme.palette.mode === 'dark'){
    colorDist = '#f7f7f7';
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      const recover = await recuperarPassword(data.noEmp);

      if(recover.result){
        const searchParams = new URLSearchParams({
          noEmp: data.noEmp
        }).toString();
  
        const href = `${paths.auth.jwt.newPassword}?${searchParams}`;
        router.push(href);
      }
      else{
        enqueueSnackbar({variant: "error", message: recover.msg});
      }      
    } catch (error) {
      enqueueSnackbar({variant: "error", message: "Ha ocurrido un error"});
    }
  });

  const renderForm = (
    <Stack spacing={3} alignItems="center">
      <RHFTextField name="noEmp" label="Número de empleado" color={colorDist}/>

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        Enviar código
      </LoadingButton>

      <Link
        component={RouterLink}
        href={paths.auth.amplify.login}
        color="inherit"
        variant="subtitle2"
        sx={{
          alignItems: 'center',
          display: 'inline-flex',
          color: colorDist
        }}
      >
        <Iconify icon="eva:arrow-ios-back-fill" width={16} />
        Regresar al inicio de sesión
      </Link>
    </Stack>
  );

  const renderHead = (
    <>
      <PasswordIcon sx={{ height: 96 }} />

      <Stack spacing={2} sx={{ my: 3 }}>
        <Typography variant="h3" sx={{ color: colorDist }}>Recuperar contraseña</Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Por favor escribe tu número de empleado y te enviaremos un código de recuperación a tu correo institucional
        </Typography>
      </Stack>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHead}

      {renderForm}
    </FormProvider>
  );
}
