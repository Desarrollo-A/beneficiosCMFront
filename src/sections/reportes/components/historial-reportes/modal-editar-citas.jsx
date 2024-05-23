import * as Yup from 'yup';
import { mutate } from 'swr';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { endpoints } from 'src/utils/axios';

import { useUpdate } from 'src/api/reportes';
import { useAuthContext } from 'src/auth/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function UserQuickEditForm({ currentUser, open, onClose, idCita, rel }) {
  const { enqueueSnackbar } = useSnackbar();

  const { user } = useAuthContext();
  
  const updateObservacion = useUpdate(endpoints.reportes.observacion);

  const idUsr = user?.idUsuario;

  const NewUserSchema = Yup.object().shape({
    descripcion: Yup.string().required('El campo es requerido'),
    idCita: Yup.string().required('El campo es requerido'),
  });

  const defaultValues = useMemo(
    () => ({
      descripcion: currentUser?.descripcion || '',
      idCita: currentUser?.idCita || '',
      estatus: currentUser?.estatus || '',
      modificadoPor: currentUser?.modificadoPor || idUsr,
      ests: currentUser?.modificadoPor || 5,
    }),
    [currentUser, idUsr]
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

      const update = await updateObservacion(data);

      if (update.estatus === true) {
        enqueueSnackbar(update.msj, { variant: 'success' });
        mutate(endpoints.reportes.lista);
      } else {
        enqueueSnackbar(update.msj, { variant: 'error' });
      }
    } catch (error) {

      console.error("Error en handleSubmit:", error);
      enqueueSnackbar(`Error en actualizar los datos`, { variant: 'danger' });

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

        <DialogTitle>Justificación de penalización</DialogTitle>

        <DialogContent>

          ¿Estás seguro que deseas justificar la cita seleccionada?

        <Stack spacing={3} sx={{ p: 3 }}>
        <RHFTextField name="descripcion" label="Observaciones" multiline rows={4} />
        </Stack>

        </DialogContent>

        <RHFTextField name="idCita" value={idCita} style={{ display: 'none' }} />

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cerrar
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
