import 'dayjs/locale/es';
import dayjs from 'dayjs';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { es } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { Typography } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { MobileTimePicker, MobileDateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useAuthContext } from 'src/auth/hooks';
import { newEvent } from 'src/api/perfil/eventos';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { /* RHFSelect, */ RHFUpload, RHFTextField } from 'src/components/hook-form';

export default function NewEventDialog({ open, onClose, mutate }) {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [fechaEvento, setFechaEvento] = useState(null);
  const [errorFechaEvento, setErrorFechaEvento] = useState(false);

  const [inicioPublicacion, setInicioPublicacion] = useState(null);
  const [errorInicioPublicacion, setErrorInicioPublicacion] = useState(false);

  const [finPublicacion, setFinPublicacion] = useState(null);
  const [errorFinPublicacion, setErrorFinPublicacion] = useState(false);

  const [limiteRecepcion, setLimiteRecepcion] = useState(null);
  const [errorLimiteRecepcion, setErrorLimiteRecepcion] = useState(false);

  const NewEventSchema = Yup.object().shape({
    titulo: Yup.string().required('Ingresa un titulo válido'),
    descripcion: Yup.string().required('Ingresa una descripción válida'),
    ubicacion: Yup.string().required('Ingresa una ubicación válida'),
    imagen: Yup.mixed().required('Ingresa una imagen válida'),
  });

  const localizationLabels = {
    // idioma de los botones
    okButtonLabel: 'Seleccionar',
    cancelButtonLabel: 'Cancelar',
    datePickerToolbarTitle: 'Selecciona una fecha',
    timePickerToolbarTitle: 'Selecciona un horario',
    dateTimePickerToolbarTitle: 'Selecciona un horario',
  };

  const defaultValues = useMemo(
    () => ({
      titulo: '',
      descripcion: '',
      ubicacion: '',
      imagen: null,
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(NewEventSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const handleFechaEvento = (val) => {
    setFechaEvento(val);
    setErrorFechaEvento(false);
  };

  const handleInicioPublicacion = (val) => {
    setInicioPublicacion(val);
    setErrorInicioPublicacion(false);
  };

  const handleFinPublicacion = (val) => {
    setFinPublicacion(val);
    setErrorFinPublicacion(false);
  };
  const handleLimiteRecepcion = (val) => {
    setLimiteRecepcion(val);
    setErrorLimiteRecepcion(false);
  };

  const resetStates = () => {
    setFechaEvento(null);
    setInicioPublicacion(null);
    setFinPublicacion(null);
    setLimiteRecepcion(null);
    setErrorFechaEvento(false);
    setErrorInicioPublicacion(false);
    setErrorFinPublicacion(false);
    setErrorLimiteRecepcion(false);
  };

  const onSubmit = handleSubmit(async (data) => {
    const res = await newEvent(
      data.titulo,
      data.descripcion,
      dayjs(fechaEvento).format('YYYY-MM-DD HH:mm:ss'),
      dayjs(inicioPublicacion).format('YYYY-MM-DD HH:mm:ss'),
      dayjs(finPublicacion).format('YYYY-MM-DD HH:mm:ss'),
      dayjs(limiteRecepcion).format('HH:mm:ss'),
      data.ubicacion,
      data.imagen,
      user.idUsuario
    );

    console.log(res);
    enqueueSnackbar(res.msg, { variant: res.result === true ? 'success' : 'error' });

    onClose();
    mutate();
  });

  const validateStates = () => {
    const ahora = Date();

    if (
      fechaEvento === null ||
      fechaEvento === undefined ||
      fechaEvento === '' ||
      fechaEvento <= ahora
    )
      setErrorFechaEvento(true);
    if (
      inicioPublicacion === null ||
      inicioPublicacion === undefined ||
      inicioPublicacion === '' ||
      inicioPublicacion <= ahora
    )
      setErrorInicioPublicacion(true);
    if (
      finPublicacion === null ||
      finPublicacion === undefined ||
      finPublicacion === '' ||
      finPublicacion <= inicioPublicacion
    )
      setErrorFinPublicacion(true);
    if (
      limiteRecepcion === null ||
      limiteRecepcion === undefined ||
      limiteRecepcion === '' ||
      limiteRecepcion === ''
    )
      setErrorLimiteRecepcion(true);
  };

  useEffect(() => {
    reset(defaultValues); // defaultValues debería ser actualizado cuando cambia el usuario
  }, [defaultValues, reset]);

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('imagen', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const handleRemoveFile = useCallback(() => {
    setValue('imagen', null);
  }, [setValue]);

  return (
    <Dialog open={open} fullWidth maxWidth="sm" disableEscapeKeyDown backdrop="static">
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle sx={{ pb: 2 }}>Nuevo evento</DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '65vh', overflowY: 'auto' }}>
          <Box
            rowGap={3}
            columnGap={1}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(1, 1fr)',
            }}
            sx={{ mt: 2 }}
          >
            <RHFTextField label="Título" name="titulo" />
            <RHFTextField label="Descripción" name="descripcion" />
            <LocalizationProvider
              adapterLocale={es}
              dateAdapter={AdapterDateFns}
              localeText={localizationLabels}
            >
              <MobileDateTimePicker
                label="Fecha e inicio de evento"
                sx={{ width: '100%' }}
                value={fechaEvento}
                minDate={new Date()}
                onChange={(val) => {
                  handleFechaEvento(val);
                }}
                slotProps={{
                  textField: {
                    error: errorFechaEvento,
                    helperText: errorFechaEvento && 'Ingresa una fecha de evento válida',
                  },
                }}
              />
            </LocalizationProvider>
            <LocalizationProvider
              adapterLocale={es}
              dateAdapter={AdapterDateFns}
              localeText={localizationLabels}
            >
              <MobileDateTimePicker
                label="Inicio de publicación del evento"
                sx={{ width: '100%' }}
                value={inicioPublicacion}
                minDate={new Date()}
                onChange={(val) => {
                  handleInicioPublicacion(val);
                }}
                slotProps={{
                  textField: {
                    error: errorInicioPublicacion,
                    helperText:
                      errorInicioPublicacion && 'Ingresa una fecha de inicio de publicación válida',
                  },
                }}
              />
            </LocalizationProvider>
            <LocalizationProvider
              adapterLocale={es}
              dateAdapter={AdapterDateFns}
              localeText={localizationLabels}
            >
              <MobileDateTimePicker
                label="Fin de publicación del evento"
                sx={{ width: '100%' }}
                value={finPublicacion}
                minDate={finPublicacion === null ? new Date() : new Date(inicioPublicacion)}
                onChange={(val) => {
                  handleFinPublicacion(val);
                }}
                slotProps={{
                  textField: {
                    error: errorFinPublicacion,
                    helperText:
                      errorFinPublicacion && 'Ingresa una fecha de fin de publicación válida',
                  },
                }}
              />
            </LocalizationProvider>
            <LocalizationProvider
              adapterLocale={es}
              dateAdapter={AdapterDateFns}
              localeText={localizationLabels}
            >
              <MobileTimePicker
                label="Límite recepción"
                sx={{ width: '100%' }}
                value={limiteRecepcion}
                onChange={(val) => {
                  handleLimiteRecepcion(val);
                }}
                slotProps={{
                  textField: {
                    error: errorLimiteRecepcion,
                    helperText:
                      errorLimiteRecepcion && 'Ingresa una hora de limite de recepción válida',
                  },
                }}
              />
            </LocalizationProvider>
            <RHFTextField label="Ubicación" name="ubicacion" />
            <Box>
              <Typography variant="body2" sx={{ mb: 1, color: 'gray' }}>
                Imagen del evento
              </Typography>
              <RHFUpload
                name="imagen"
                onDrop={handleDrop}
                onDelete={handleRemoveFile}
                accept={{ 'image/*': [] }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onClose();
              reset();
              resetStates();
            }}
          >
            Cancelar
          </Button>

          <LoadingButton
            variant="contained"
            color="success"
            type="submit"
            loading={isSubmitting}
            onClick={() => {
              validateStates();
            }}
          >
            Crear
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

NewEventDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  mutate: PropTypes.func,
};
