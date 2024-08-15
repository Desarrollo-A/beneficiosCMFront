import * as Yup from 'yup';
import { mutate } from 'swr';
import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Box } from '@mui/system';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { endpoints } from 'src/utils/axios';

import { createManuales } from 'src/api/ayuda';
import { useAuthContext } from 'src/auth/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
// ----------------------------------------------------------------------

export default function ModalAgregarManuales({ open, onClose }) {
  const { enqueueSnackbar } = useSnackbar();

  const { user } = useAuthContext();

  const idUsr = user?.idUsuario;

  const [rol, setRol] = useState('');

  const handleChange = (event) => {
    setRol(event.target.value);
  };

  const NewUserSchema = Yup.object().shape({
    descripcion: Yup.string().required('El campo es requerido'),
    titulo: Yup.string().required('El campo es requerido'),
    icono: Yup.string().required('El campo es requerido'),
    video: Yup.string().required('El campo es requerido'),
  });

  const defaultValues = useMemo(
    () => ({
      modificadoPor: idUsr,
    }),
    [idUsr]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    const idRol = { rol };

    const dataValue = {
      ...idRol,
      ...data,
    };

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      onClose();

      const create = await createManuales(dataValue);

      if (create.estatus === true) {
        enqueueSnackbar(create.msj, { variant: 'success' });
        mutate(endpoints.ayuda.getManuales);
        mutate(endpoints.ayuda.getAllManuales);
      } else {
        enqueueSnackbar(create.msj, { variant: 'error' });
      }
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      enqueueSnackbar(`Error en registrar los datos`, { variant: 'danger' });
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Stack spacing={1}>
          <DialogTitle>Registrar Manual</DialogTitle>

          <DialogContent>
            <DialogContent>
              <Box mb={2} />

              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Rol</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={rol}
                  label="Rol"
                  onChange={handleChange}
                >
                  <MenuItem value={2}>Colaborador</MenuItem>
                  <MenuItem value={3}>Especialista</MenuItem>
                  <MenuItem value={4}>Administrador</MenuItem>
                </Select>
              </FormControl>

              <Box mb={2} />

              <Grid item xs={12} md={6}>
                <RHFTextField name="titulo" label="Título" multiline rows={1} />
              </Grid>

              <Box mb={2} />

              <Grid item xs={12} md={6}>
                <RHFTextField name="descripcion" label="Descripcion" multiline rows={4} />
              </Grid>

              <Box mb={2} />

              <Grid item xs={12} md={6}>
                <RHFTextField name="icono" label="Icono" multiline rows={1} />
              </Grid>

              <Box mb={2} />

              <Grid item xs={12} md={6}>
                <RHFTextField name="video" label="Video" multiline rows={1} />
              </Grid>
            </DialogContent>
          </DialogContent>
        </Stack>

        <DialogActions>
          <Button variant="contained" color="error" onClick={onClose}>
            Cerrar
          </Button>
          <LoadingButton type="submit" variant="contained" color="success" loading={isSubmitting}>
            Guardar
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

ModalAgregarManuales.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
