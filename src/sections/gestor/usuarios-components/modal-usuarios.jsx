import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';

import { Box } from '@mui/system';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';

import { useBoolean } from 'src/hooks/use-boolean';

import { getDecodedPassAdmin } from 'src/api/perfil';

import Iconify from 'src/components/iconify';
import FormProvider, {
  RHFTextField
} from 'src/components/hook-form';
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
  rol
 }) {

  const methods = useForm({
  });

  const [ passDecode, setPassDecode ] = useState('');

  const usuario = passDecode ? passDecode?.find(u => u.idUsuario === id) : '';
  const pw = usuario ? usuario.password : null;

  useEffect(() => {
    const getPassword = async() => {
      const pass = await getDecodedPassAdmin();
      setPassDecode(pass.data);
    }
    getPassword();
  }, []);

  const passwordOld = useBoolean();

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

      <Stack spacing={1} >

        <DialogTitle>
          Datos de usuario
          <Box>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {nombre}
            </Typography>
          </Box>
        </DialogTitle>

        <FormProvider methods={methods} >
          <DialogContent>
            <Stack
              spacing={2}
              sx={{
                p: 2.5,
                pr: { xs: 2.5, md: 2.5 },
              }}
            >
              <Grid container spacing={3} disableEqualOverflow>
                <Grid xs={4} md={4}>
                  <RHFTextField name="id" label="Id" value={id} disabled />
                </Grid>
                <Grid xs={4} md={4}>
                  <RHFTextField name="numEmpleado" label="Número de empleado" value={numEmpleado} disabled />
                </Grid>
                <Grid xs={4} md={4}>
                  <RHFTextField name="contrato" label="Contrato" value={contrato} disabled />
                </Grid>
                <Grid xs={6} md={6}>
                  <RHFTextField name="correo" label="Correo" value={correo} disabled />
                </Grid>
                <Grid xs={6} md={6}>
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
                            <Iconify icon={passwordOld.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                ):(
                  <Grid xs={6} md={6}>
                    <LinearProgress />
                  </Grid>
                )}
                </Grid>
                <Grid xs={4} md={4}>
                  <RHFTextField name="departamento" label="Departamento" value={departamento} disabled />
                </Grid>
                <Grid xs={4} md={4}>
                  <RHFTextField name="area" label="Area" value={area} disabled />
                </Grid>
                <Grid xs={4} md={4}>
                  <RHFTextField name="puesto" label="Puesto" value={puesto} disabled />
                </Grid>
                <Grid xs={6} md={6}>
                  <RHFTextField name="sede" label="Sede" value={sede} disabled />
                </Grid>
                <Grid xs={6} md={6}>
                  <RHFTextField name="rol" label="Rol" value={rol} disabled />
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
  rol: PropTypes.any
};
