import * as Yup from 'yup';
import { mutate } from 'swr';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import { Box } from '@mui/system';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { useGetGeneral } from 'src/api/general';
import { useInsert } from 'src/api/verificacion';
import { getDecodedPassAdmin } from 'src/api/perfil';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
// ----------------------------------------------------------------------

export default function ModalUsuarios({
  open,
  onClose,
  id,
  nombre,
  contrato,
  numEmpleado,
  correo,
  password,
  departamento,
  area,
  puesto,
  sede,
  rol,
  permisos_id,
  idRol,
}) {
  const { enqueueSnackbar } = useSnackbar();

  const schema = Yup.object().shape({
    // id: Yup.number(),
    // permisos_id: Yup.number(),
  });

  const methods = useForm({
    resolver: yupResolver(schema),
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const passwordOld = useBoolean();

  const [passDecode, setPassDecode] = useState('');

  const { permisos } = useGetGeneral(endpoints.gestor.permisos, 'permisos');

  const insertData = useInsert(endpoints.gestor.save_permisos);

  const usuario = passDecode ? passDecode?.find((u) => u.idUsuario === id) : '';
  const pw = usuario ? usuario.password : null;

  const onSubmit = handleSubmit(async (data) => {
    // console.log(data)

    const dataValue = {
      id,
      permisos_id: data.permisos_id,
    };

    const response = await insertData(dataValue);
    // console.log(response)

    enqueueSnackbar(response.msg, { variant: response.status });

    if (response.status === 'success') {
      onClose();
      mutate(endpoints.gestor.getUsuarios);
    }
  });

  useEffect(() => {
    const getPassword = async () => {
      const pass = await getDecodedPassAdmin();
      setPassDecode(pass.data);
    };
    getPassword();
  }, []);

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 1080 },
      }}
    >
      <Stack spacing={1}>
        <DialogTitle>
          Datos de usuario
          <Box>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {nombre}
            </Typography>
          </Box>
        </DialogTitle>

        <FormProvider methods={methods}>
          <DialogContent>
            <Stack
              spacing={2}
              sx={{
                p: 2.5,
                pr: { xs: 2.5, md: 2.5 },
              }}
            >
              <Grid container spacing={3} disableEqualOverflow>
                <Grid item xs={3} md={3}>
                  <RHFTextField name="id" label="Id" value={id} disabled />
                </Grid>
                <Grid item xs={3} md={3}>
                  <RHFTextField
                    name="numEmpleado"
                    label="Número de empleado"
                    value={numEmpleado}
                    disabled
                  />
                </Grid>
                <Grid item xs={3} md={3}>
                  <RHFTextField name="contrato" label="Contrato" value={contrato} disabled />
                </Grid>
                <Grid item xs={3} md={3}>
                  <RHFTextField name="rol" label="Rol" value={rol} disabled />
                </Grid>
                <Grid item xs={4} md={4}>
                  <RHFTextField name="correo" label="Correo" value={correo} disabled />
                </Grid>
                <Grid item xs={4} md={4}>
                  {passDecode ? (
                    <RHFTextField
                      name="oldPassword"
                      type={passwordOld.value ? 'text' : 'password'}
                      label="Contraseña"
                      value={pw}
                      disabled
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={passwordOld.onToggle} edge="end">
                              <Iconify
                                icon={
                                  passwordOld.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'
                                }
                              />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  ) : (
                    <Grid item xs={4} md={4}>
                      <LinearProgress />
                    </Grid>
                  )}
                </Grid>

                <Grid item xs={4} md={4}>
                  <RHFSelect
                    name="permisos_id"
                    label="Permisos adicionales"
                    value={permisos_id}
                    disabled={idRol !== 4}
                  >
                    <MenuItem value="">Ninguno</MenuItem>
                    {permisos.map((option, index) => (
                      <MenuItem key={index} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                </Grid>
              </Grid>
            </Stack>
          </DialogContent>
        </FormProvider>
      </Stack>

      <DialogActions>
        <Button variant="contained" color="error" onClick={onClose}>
          Cerrar
        </Button>
        {idRol === 4 && (
          <LoadingButton
            type="submit"
            variant="contained"
            color="primary"
            loading={isSubmitting}
            onClick={onSubmit}
          >
            Guardar
          </LoadingButton>
        )}
      </DialogActions>
    </Dialog>
  );
}

ModalUsuarios.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  id: PropTypes.any,
  nombre: PropTypes.any,
  contrato: PropTypes.any,
  numEmpleado: PropTypes.any,
  correo: PropTypes.any,
  password: PropTypes.any,
  departamento: PropTypes.any,
  area: PropTypes.any,
  puesto: PropTypes.any,
  sede: PropTypes.any,
  rol: PropTypes.any,
  permisos_id: PropTypes.any,
  idRol: PropTypes.any,
};
