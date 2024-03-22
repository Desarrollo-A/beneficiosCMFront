import * as Yup from 'yup';
import { Base64 } from 'js-base64';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { useUpdate } from 'src/api/reportes';
import { getDecodedPass } from 'src/api/perfil';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function AccountChangePassword() {
  const { enqueueSnackbar } = useSnackbar();

  const datosUser = JSON.parse(Base64.decode(sessionStorage.getItem('accessToken').split('.')[2]));

  const updatePass = useUpdate(endpoints.user.updatePass);

  // console.log(datosUser)

  // const { idData } = useDecodePass(datosUser.idUsuario, endpoints.user.decodePass, "idData");

  const [ password, setPassword ] = useState('');

  const passwordOld = useBoolean();

  const passwordNew = useBoolean();

  const passwordConfirm = useBoolean();

  const ChangePassWordSchema = Yup.object().shape({
    newPassword: Yup.string()
      .required('Campo requerido')
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .test(
        'no-match',
        'La nueva contraseña a debe ser diferente la contraseña actual',
        (value, { parent }) => value !== parent.oldPassword
      ),
    confirmNewPassword: Yup.string().oneOf([Yup.ref('newPassword')], 'No coicide la contraseña'),
  });

  const defaultValues = {
    newPassword: '',
    confirmNewPassword: '',
    idUsuario: datosUser.idUsuario,
    password: datosUser.password,
  };

  const methods = useForm({
    resolver: yupResolver(ChangePassWordSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      reset();

      const update = await updatePass(data);

      if (update.estatus === true) {

        enqueueSnackbar(update.msj, { variant: 'success' });
        window.location.reload(true);

      } else {
        enqueueSnackbar(update.msj, { variant: 'error' });
      }
    } catch (error) {
      console.error(error);
    }
  });

  useEffect(() => {
    const getPassword = async() => {
      const pass = await getDecodedPass();
      setPassword(pass.data);
    }
    getPassword();
  }, []);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack component={Card} spacing={3} sx={{ p: 3 }}>

      <RHFTextField name="idUsuario" value={datosUser.idUsuario} style={{ display: 'none' }} />

      <RHFTextField name="password" value={datosUser.password} style={{ display: 'none' }} />

      {password ? (
        <RHFTextField
          name="oldPassword"
          type={passwordOld.value ? 'text' : 'password'}
          label="Actual contraseña"
          value={password}
          disabled
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={passwordOld.onToggle} edge="end">
                  <Iconify icon={passwordOld.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      ):(
        <LinearProgress />
      )}

        <RHFTextField
          name="newPassword"
          label="Nueva contraseña"
          type={passwordNew.value ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={passwordNew.onToggle} edge="end">
                  <Iconify icon={passwordNew.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          helperText={
            <Stack component="span" direction="row" alignItems="center">
              <Iconify icon="eva:info-fill" width={16} sx={{ mr: 0.5 }} /> La contraseña debe tener al menos 6 caracteres
            </Stack>
          }
        />

        <RHFTextField
          name="confirmNewPassword"
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

        <LoadingButton type="submit" variant="contained" color="success" loading={isSubmitting} sx={{ ml: 'auto' }}>
          Guardar
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
