import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Stack from '@mui/material/Stack';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import Reportes from 'src/api/reportes';

// ----------------------------------------------------------------------

export default function UserQuickEditForm({ currentUser, open, onClose, idCita, rel }) {
  const { enqueueSnackbar } = useSnackbar();

  const reportes = Reportes();

  const NewUserSchema = Yup.object().shape({
    descripcion: Yup.string().required('El campo es requerido'),
    idCita: Yup.string().required('El campo es requerido'),
  });

  const defaultValues = useMemo(
    () => ({
      descripcion: currentUser?.descripcion || '',
      idCita: currentUser?.idCita || '',
    }),
    [currentUser]
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
        reportes.getObservacion(resp => {
          if (resp.data === true) {
            enqueueSnackbar('Observación Registrada!', /* {variant: 'warning'} */);
            rel();
          }
        },{
          data
        });
    } catch (error) {
      console.error(error);
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

        <DialogTitle>Justificación de Penalización</DialogTitle>

        <DialogContent>

          ¿Estás seguro que deseas justificar la cita seleccionada?

        <Stack spacing={3} sx={{ p: 3 }}>
        <RHFTextField name="descripcion" label="Observaciones" multiline rows={4} />
        </Stack>

        </DialogContent>

        <RHFTextField name="idCita" value={idCita} style={{ display: 'none' }} />

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancelar
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Guardar
          </LoadingButton>
        </DialogActions>
        
      </FormProvider>
    </Dialog>

  );
}

UserQuickEditForm.propTypes = {
  currentUser: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  idCita: PropTypes.number,
  rel: PropTypes.func,
};
