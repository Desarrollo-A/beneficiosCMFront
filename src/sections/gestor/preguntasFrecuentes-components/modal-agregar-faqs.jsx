import * as Yup from 'yup';
import { mutate } from 'swr';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Box } from '@mui/system';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { endpoints } from 'src/utils/axios';

import { useAuthContext } from 'src/auth/hooks';
import { createPregunta } from 'src/api/FaqCh/faqCh';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
// ----------------------------------------------------------------------

export default function ModalAgregarFaqs({ open, onClose }) {
  const { enqueueSnackbar } = useSnackbar();

  const { user } = useAuthContext();

  const idUsr = user?.idUsuario;

  const NewUserSchema = Yup.object().shape({
    pregunta: Yup.string().required('El campo es requerido'),
    respuesta: Yup.string().required('El campo es requerido')
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
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      onClose();

      const create = await createPregunta(data);

      if (create.result) {
        enqueueSnackbar(create.msg, { variant: 'success' });
        mutate(endpoints.gestor.getFaqsCh);
      } 
      else {
        enqueueSnackbar(create.msg, { variant: 'error' });
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
          <DialogTitle>Registrar FAQ</DialogTitle>

          <DialogContent>
            <DialogContent>            
              <Box mb={2} />
              <Grid xs={12} md={6}>
                <RHFTextField name="pregunta" label="Pregunta" multiline rows={1} />
              </Grid>
              <Box mb={2} />
              <Grid xs={12} md={6}>
                <RHFTextField name="respuesta" label="Respuesta" multiline rows={4} />
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

ModalAgregarFaqs.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
