import * as Yup from 'yup';
import { mutate } from 'swr';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import { Box } from '@mui/system';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Unstable_Grid2';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { endpoints } from 'src/utils/axios';

import { useAuthContext } from 'src/auth/hooks';
import { updatePregunta } from 'src/api/FaqCh/faqCh';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
// ----------------------------------------------------------------------

export default function ModalEditarOficinas({ open, onClose, idPregunta, pregunta, respuesta }) {
  const { user } = useAuthContext();

  const idUsr = user?.idUsuario;

  const { enqueueSnackbar } = useSnackbar()

  const NewUserSchema = Yup.object().shape({
    pregunta: Yup.string().trim().required('El campo es requerido'),
    respuesta: Yup.string().required('El campo es requerido'),
  });

  const [values, setValues] = useState({ idPregunta, pregunta, respuesta, modificadoPor: idUsr });

  useEffect(() => {
    setValues({ idPregunta, pregunta, respuesta, modificadoPor: idUsr });
  }, [idPregunta, pregunta, respuesta, idUsr]);

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    values,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    reset()
  }, [reset])

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      onClose();

      const update = await updatePregunta(data, idPregunta);

      if (update.result) {
        enqueueSnackbar(update.msg, { variant: 'success' });
        mutate(endpoints.gestor.getFaqsCh);
      } else {
        enqueueSnackbar(update.msg, { variant: 'error' });
      }
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      enqueueSnackbar(`Error al enviar los datos`, { variant: 'danger' });
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
          <DialogTitle>
            Editar pregunta {idPregunta}
          </DialogTitle>

          <DialogContent>
            <Box mb={2} />

            <Grid xs={12} md={6}>
              <RHFTextField 
                name="pregunta" 
                label="Pregunta" 
                multiline 
                rows={1} 
              />
            </Grid>

            <Box mb={2} />

            <Grid xs={12} md={6}>
              <RHFTextField 
                name="respuesta"
                label="Respuesta" 
                multiline 
                rows={4}
              />
            </Grid>
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

ModalEditarOficinas.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  idPregunta: PropTypes.any,
  pregunta: PropTypes.string,
  respuesta: PropTypes.string
};
