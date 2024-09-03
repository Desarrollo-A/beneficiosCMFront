import * as Yup from 'yup';
import { mutate } from 'swr';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useMemo, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import { Box } from '@mui/system';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { endpoints } from 'src/utils/axios';

import { useAuthContext } from 'src/auth/hooks';
import { updateObservaciones } from 'src/api/reportes';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFUpload, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function UserQuickEditForm({ currentUser, open, onClose, idCita, rel }) {
  const { enqueueSnackbar } = useSnackbar();

  const { user } = useAuthContext();

  // const updateObservacion = useUpdate(endpoints.reportes.observacion);

  const idUsr = user?.idUsuario;

  const NewUserSchema = Yup.object().shape({
    descripcion: Yup.string().trim().required('El campo es requerido'),
    idCita: Yup.string().required('El campo es requerido'),
    archivo: Yup.mixed().nullable(),
  });

  const defaultValues = useMemo(
    () => ({
      descripcion: currentUser?.descripcion || '',
      idCita: currentUser?.idCita || '',
      estatus: currentUser?.estatus || '',
      modificadoPor: currentUser?.modificadoPor || idUsr,
      ests: currentUser?.modificadoPor || 5,
      archivo: null,
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
    setValue,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      onClose();

      const update = await updateObservaciones(data);

      if (update.estatus === true) {
        enqueueSnackbar(update.msj, { variant: 'success' });
        mutate(endpoints.reportes.lista);
      } else {
        enqueueSnackbar(update.msj, { variant: 'error' });
      }
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      enqueueSnackbar(`Error en actualizar los datos`, { variant: 'danger' });
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('archivo', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const handleRemoveFile = useCallback(() => {
    setValue('archivo', null);
  }, [setValue]);

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
      backdrop="static"
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Justificación de penalización</DialogTitle>

        <DialogContent>
          ¿Estás seguro que deseas justificar la cita seleccionada?
          <Box mb={2} />
          <Grid item xs={12} md={6}>
            <RHFTextField name="descripcion" label="Observaciones" multiline rows={4} />
          </Grid>
        </DialogContent>

        <RHFTextField name="idCita" value={idCita} style={{ display: 'none' }} />

        <Grid item xs={12} md={6} sx={{ p: 3 }}>
          <RHFUpload
            name="archivo"
            onDrop={handleDrop}
            onDelete={handleRemoveFile}
            accept={{ '*': [] }}
          />
        </Grid>

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

UserQuickEditForm.propTypes = {
  currentUser: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  idCita: PropTypes.number,
  rel: PropTypes.func,
};
