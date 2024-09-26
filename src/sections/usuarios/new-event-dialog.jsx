import 'dayjs/locale/es';
import dayjs from 'dayjs';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { es } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { MobileTimePicker, MobileDateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useGetSedes } from 'src/api/sedes';
import { useAuthContext } from 'src/auth/hooks';
import { useGetDepartamentos } from 'src/api/deptos';
import { newEvent, updateEvent } from 'src/api/perfil/eventos';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  /* RHFSelect, */ RHFUpload,
  RHFTextField,
  RHFAutocomplete,
} from 'src/components/hook-form';

export default function NewEventDialog({ open, event, onClose, mutate }) {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const { sedes, sedesLoading } = useGetSedes();
  const { deptos, deptosLoading } = useGetDepartamentos();

  // const [fechaEvento, setFechaEvento] = useState(event ? new Date(event?.fechaEvento) : null);
  const [fechaEvento, setFechaEvento] = useState(null);
  const [errorFechaEvento, setErrorFechaEvento] = useState(false);

  const [inicioPublicacion, setInicioPublicacion] = useState(null);
  const [errorInicioPublicacion, setErrorInicioPublicacion] = useState(false);

  const [finPublicacion, setFinPublicacion] = useState(null);
  const [errorFinPublicacion, setErrorFinPublicacion] = useState(false);

  const [limiteRecepcion, setLimiteRecepcion] = useState(
    event ? new Date(`1970-01-01T${event?.limiteRecepcion}`) : null
  );
  const [errorLimiteRecepcion, setErrorLimiteRecepcion] = useState(false);

  const NewEventSchema = Yup.object().shape({
    titulo: Yup.string().required('Ingresa un titulo válido'),
    descripcion: Yup.string().required('Ingresa una descripción válida'),
    ubicacion: Yup.string().required('Ingresa una ubicación válida'),
    imagen: event
      ? Yup.mixed().nullable().notRequired()
      : Yup.mixed().required('Ingresa una imagen válida'),
    sedes: Yup.mixed().required('Ingresa una o más sedes'),
    departamentos: Yup.mixed().required('Ingresa uno o más departamentos'),
  });

  const localizationLabels = {
    okButtonLabel: 'Seleccionar',
    cancelButtonLabel: 'Cancelar',
    datePickerToolbarTitle: 'Selecciona una fecha',
    timePickerToolbarTitle: 'Selecciona un horario',
    dateTimePickerToolbarTitle: 'Selecciona un horario',
  };

  const defaultValues = useMemo(
    () => ({
      titulo: event ? event?.titulo : '',
      descripcion: event ? event?.descripcion : '',
      ubicacion: event ? event?.ubicacion : '',
      imagen: null,
      sedes: event ? JSON.parse(event?.sedes) : '',
      departamentos: event ? JSON.parse(event?.departamentos) : '',
    }),
    [event]
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
    let res = { msg: 'Surgió un error inesperado', result: false };
    if (event) {
      res = await updateEvent(
        event?.idEvento,
        data?.titulo,
        data?.descripcion,
        dayjs(fechaEvento).format('YYYY-MM-DD HH:mm:ss'),
        dayjs(inicioPublicacion).format('YYYY-MM-DD HH:mm:ss'),
        dayjs(finPublicacion).format('YYYY-MM-DD HH:mm:ss'),
        dayjs(limiteRecepcion).format('HH:mm:ss'),
        data?.ubicacion,
        data?.sedes,
        data?.departamentos,
        data?.imagen,
        user?.idUsuario
      );
    }
    if (!event) {
      res = await newEvent(
        data?.titulo,
        data?.descripcion,
        dayjs(fechaEvento).format('YYYY-MM-DD HH:mm:ss'),
        dayjs(inicioPublicacion).format('YYYY-MM-DD HH:mm:ss'),
        dayjs(finPublicacion).format('YYYY-MM-DD HH:mm:ss'),
        dayjs(limiteRecepcion).format('HH:mm:ss'),
        data?.ubicacion,
        data?.sedes,
        data?.departamentos,
        data?.imagen,
        user?.idUsuario
      );
    }

    console.log(res);
    enqueueSnackbar(res.msg, { variant: res.result === true ? 'success' : 'error' });

    onClose();
    reset();
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
    reset(defaultValues);
    resetStates();
  }, [defaultValues, reset]);

  useEffect(() => {
    if (event) {
      setFechaEvento(new Date(event?.fechaEvento));
      setInicioPublicacion(new Date(event?.inicioPublicacion));
      setFinPublicacion(new Date(event?.finPublicacion));
      setLimiteRecepcion(new Date(`1970-01-01 ${event?.limiteRecepcion}`));
    }
  }, [open, event]);

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
        <DialogTitle sx={{ pb: 2 }}>{event ? 'Modificar' : 'Nuevo'} evento</DialogTitle>
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
            <RHFTextField label="Título (*)" name="titulo" />
            <RHFTextField label="Descripción (*)" name="descripcion" />
            <LocalizationProvider
              adapterLocale={es}
              dateAdapter={AdapterDateFns}
              localeText={localizationLabels}
            >
              <MobileDateTimePicker
                label="Fecha e inicio de evento (*)"
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
                label="Inicio de publicación del evento (*)"
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
                label="Fin de publicación del evento (*)"
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
                label="Límite recepción (*)"
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
            <RHFTextField label="Ubicación (*)" name="ubicacion" />
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Sedes (*)</Typography>
              <RHFAutocomplete
                name="sedes"
                placeholder="Sedes"
                multiple
                value={undefined}
                freeSolo
                options={sedes.map((i) => i)}
                getOptionLabel={(i) => i.nsede || ''}
                renderOption={(props, i) => (
                  <li {...props} key={i.idsede}>
                    {i.nsede}
                  </li>
                )}
                renderTags={(selected, getTagProps) =>
                  selected.map((i, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={i.idsede}
                      label={i.nsede}
                      size="small"
                      color="info"
                      variant="soft"
                    />
                  ))
                }
              />
            </Stack>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Departamentos (*)</Typography>
              <RHFAutocomplete
                name="departamentos"
                placeholder="Departamentos..."
                value={undefined}
                multiple
                freeSolo
                options={deptos.map((i) => i)}
                getOptionLabel={(i) => i.ndepto || ''}
                renderOption={(props, i) => (
                  <li {...props} key={i.iddepto}>
                    {i.ndepto}
                  </li>
                )}
                renderTags={(selected, getTagProps) =>
                  selected.map((i, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={i.iddepto}
                      label={i.ndepto}
                      size="small"
                      color="info"
                      variant="soft"
                    />
                  ))
                }
              />
            </Stack>
            <Box>
              <Typography variant="body2" sx={{ mb: 1, color: 'gray' }}>
                Imagen del evento ({event ? 'Subir en caso de querer remplazar' : '*'})
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
            }}
          >
            Cancelar
          </Button>

          <LoadingButton
            variant="contained"
            color="success"
            type="submit"
            
            onClick={() => {
              validateStates();
            }}
          >
            {event ? 'Actualizar' : 'Crear'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

NewEventDialog.propTypes = {
  open: PropTypes.bool,
  event: PropTypes.object,
  onClose: PropTypes.func,
  mutate: PropTypes.func,
};
