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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { endpoints } from 'src/utils/axios';

import { updateManuales } from 'src/api/ayuda';
import { useAuthContext } from 'src/auth/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
// ----------------------------------------------------------------------

export default function ModalEditarOficinas({
  open,
  onClose,
  id,
  titulo,
  descripcion,
  icono,
  video,
  idRol
}) {

  const { user } = useAuthContext();

  const idUsr = user?.idUsuario;

  const { enqueueSnackbar } = useSnackbar();

  const [rol, setRol] = useState(idRol);

  const handleChange = (event) => {
    setRol(event.target.value);
  };

  const NewUserSchema = Yup.object().shape({
    descripcion: Yup.string().required('El campo es requerido'),
    titulo: Yup.string().required('El campo es requerido')
  });

  const [values, setValues] = useState({ titulo, descripcion, icono, video, modificadoPor: idUsr });

  useEffect(() => {
    setValues({ titulo, descripcion, icono, video, modificadoPor: idUsr });
  }, [titulo, descripcion, icono, video, idUsr]);

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    values,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {

    const idRolVal = { rol }
    const idManual = { id }

    const dataValue = {
      ...idManual,
      ...idRolVal,
      ...data
    };

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      onClose();

     const update = await updateManuales(dataValue);

      if (update.estatus === true) {
        enqueueSnackbar(update.msj, { variant: 'success' });
        mutate(endpoints.ayuda.getManuales);
        mutate(endpoints.ayuda.getAllManuales);
      } else {
        enqueueSnackbar(update.msj, { variant: 'error' });
      }
    } catch (error) {

      console.error("Error en handleSubmit:", error);
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
        <Stack spacing={1} >

          <DialogTitle>
            Edición de Manual
            <Box>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {id}
              </Typography>
            </Box>
          </DialogTitle>

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

            <Grid xs={12} md={6}>
              <RHFTextField name="titulo" label="Título" multiline rows={1} />
            </Grid>

            <Box mb={2} />

            <Grid xs={12} md={6}>
              <RHFTextField name="descripcion" label="Descripcion" multiline rows={4}/>
            </Grid>

            <Box mb={2} />

            <Grid xs={12} md={6}>
              <RHFTextField name="icono" label="Icono" multiline rows={1} />
            </Grid>

            <Box mb={2} />
            <Grid xs={12} md={6}>
              <RHFTextField name="video" label="Video" multiline rows={1} />
            </Grid>

          </DialogContent>

        </Stack>

        <DialogActions>
          <Button variant="contained" color="error" onClick={onClose}>
            Cerrar
          </Button>
          <Button type="submit" variant="contained" color="success" loading={isSubmitting}>
            Guardar
          </Button>
        </DialogActions>

      </FormProvider>

    </Dialog>

  );
}

ModalEditarOficinas.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  id: PropTypes.any,
  titulo: PropTypes.any,
  descripcion: PropTypes.any,
  icono: PropTypes.any,
  video: PropTypes.any,
  idRol: PropTypes.any,
};
