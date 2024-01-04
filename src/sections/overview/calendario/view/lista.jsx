import 'dayjs/locale/es';
import dayjs from 'dayjs';
import * as yup from 'yup';
import PropTypes from 'prop-types';
import { es } from 'date-fns/locale';
import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Stack from '@mui/system/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import ToggleButton from '@mui/material/ToggleButton';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { Checkbox, FormControlLabel } from '@mui/material';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { MobileDatePicker, MobileTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import uuidv4 from 'src/utils/uuidv4';
import { fDate } from 'src/utils/format-time';

import { reRender, createCustom, createAppointment } from 'src/api/calendar-specialist';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

export default function Lista({ currentEvent, onClose, userData, selectedDate, usersMutate }) {
  dayjs.locale('es'); // valor para cambiar el idioma del dayjs

  const { enqueueSnackbar } = useSnackbar();
  const [allDay, setAllDay] = useState(false);
  const defaultHour = {
    horaInicio: dayjs('0000/00/00 08:00:00').format('HH:mm:ss'),
    horaFinal: dayjs('0000/00/00 18:00:00').format('HH:mm:ss'),
  };
  const [defaultFecha, setDefaultFecha] = useState(selectedDate);

  const [dateTitle, setDateTitle] = useState(dayjs(selectedDate).format('dddd, DD MMMM YYYY'));
  const [type, setType] = useState('cancel'); // constante para el cambio entre cancelar hora y agendar cita
  const [patient, setPatient] = useState({
    id: '',
    nombre: '',
  });

  const formSchema = yup.object().shape({
    title: yup.string().max(100).required('Se necesita el título').trim(), // maximo de caracteres para el titulo 100
    start: !allDay ? yup.date().required() : '',
    end: !allDay ? yup.date().required() : '',
  });

  const methods = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: currentEvent,
  });

  const { reset, watch, handleSubmit } = methods;

  const values = watch();
  const hourError = checkDate(values.start, values.end, type, allDay);
  const selectedUser = userSelect(type, patient); // validacion si se selecciono paciente, solo al crear cita
  const dateError = allDay && values.fechaInicio > defaultFecha; // validacion que la fecha final no sea menor a la fecha inicio

  const onSubmit = handleSubmit(async (data) => {
    let save = '';

    const eventData = {
      // se da el formato juntando la fecha elegida y la hora que se elige con los minutos
      id: uuidv4(),
      title: data?.title,
      hora_inicio: !allDay
        ? `${data.start.getHours()}:${data.start.getMinutes()}`
        : defaultHour.horaInicio,
      hora_final: !allDay
        ? `${data.end.getHours()}:${data.end.getMinutes()}`
        : defaultHour.horaFinal,
      fechaInicio: fDate(data?.fechaInicio),
      fechaFinal: fDate(defaultFecha),
      paciente: patient.id,
    };

    try {
      if (!dateError && selectedUser && !hourError) {
        switch (type) {
          case 'cancel':
            save = await createCustom(eventData);
            break;

          case 'date':
            save = await createAppointment(eventData);
            break;

          default:
            save = { result: false, msg: 'Error al guardar' };
            break;
        }

        if (save.result) {
          enqueueSnackbar(save.msg);
          reRender(); // ayuda a que se haga un mutate en caso que sea true el resultado
          reset();
          onClose();
        } else {
          enqueueSnackbar(save.msg, { variant: 'error' });
        }
      } else {
        enqueueSnackbar('Faltan datos en el formulario', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Ha ocurrido un error al guardar', { variant: 'error' });
    }
  });

  const handleChangeType = useCallback(
    (event, newType) => {
      // handle para el cambio entre ocupar una hora o hacer cita solo quantum balance
      if (newType !== null) {
        setType(newType);
        setPatient({
          id: '',
          nombre: '',
        });
        setAllDay(false);
        setDefaultFecha(selectedDate);
      }

      usersMutate(); // Actualizar datos
    },
    [usersMutate, selectedDate]
  );

  const handleChangeDay = useCallback(
    (value) => {
      if (!value) {
        setDefaultFecha(selectedDate);
      }

      setAllDay(value);
    },
    [selectedDate]
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <DialogContent sx={{ p: { xs: 1, md: 2 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          useFlexGap
          flexWrap="wrap"
          sx={{ p: { xs: 1, md: 2 } }}
        >
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
            {type === 'cancel' ? 'Cancelar horario' : 'Agendar cita'}
          </Typography>
          <ToggleButtonGroup exclusive value={type} size="small" onChange={handleChangeType}>
            <ToggleButton value="cancel">Cancelar horario</ToggleButton>

            <ToggleButton value="date">Crear cita</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <Stack spacing={3} sx={{ p: { xs: 1, md: 2 } }}>
          {type === 'date' && (
            <RHFAutocomplete
              name="usuario"
              label="Pacientes"
              value={patient.nombre}
              onChange={(_event, value) => {
                setPatient({ id: value?.value, nombre: value?.label ? value?.label : '' });
              }}
              options={userData.map((user) => ({ label: user.nombre, value: user.idUsuario }))}
            />
          )}
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle1">{dateTitle}</Typography>
            {type === 'cancel' && (
              <FormControlLabel
                control={<Checkbox onChange={(value) => handleChangeDay(value.target.checked)} />}
                label="Ocupar dia(s)"
                labelPlacement="start"
              />
            )}
          </Stack>
          <RHFTextField name="title" label="Título" />
        </Stack>

        <Stack direction="row" justifyContent="space-between" sx={{ p: { xs: 1, md: 2 } }}>
          <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
            <Controller
              name="fechaInicio"
              defaultValue={selectedDate}
              render={({ field }) => (
                <MobileDatePicker
                  label="Fecha"
                  sx={{ width: '100%' }}
                  defaultValue={selectedDate}
                  onChange={(value) => {
                    field.onChange(value);
                    setDateTitle(dayjs(value).format('dddd, DD MMMM YYYY')); // al momento de cambiar el valor en el input, cambia el valor del titulo
                  }}
                />
              )}
            />
          </LocalizationProvider>
        </Stack>

        {!allDay || type === 'date' ? (
          <Stack
            direction="row"
            justifyContent="space-between"
            spacing={2}
            sx={{ p: { xs: 1, md: 2 } }}
          >
            <Controller
              name="start"
              render={({ field }) => (
                <MobileTimePicker
                  sx={{ width: '100%' }}
                  label="Hora de inicio"
                  onChange={(value) => field.onChange(value)}
                />
              )}
            />

            <Controller
              name="end"
              render={({ field }) => (
                <MobileTimePicker
                  sx={{ width: '100%' }}
                  label="Hora finalización"
                  slotProps={{
                    textField: {
                      error: hourError,
                      helperText: hourError && 'Error en las horas seleccionadas',
                    },
                  }}
                  onChange={(value) => field.onChange(value)}
                />
              )}
            />
          </Stack>
        ) : (
          <Stack direction="row" justifyContent="space-between" sx={{ p: { xs: 1, md: 2 } }}>
            <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
              <MobileDatePicker
                label="Fecha final"
                sx={{ width: '100%' }}
                value={defaultFecha}
                slotProps={{
                  textField: {
                    error: dateError,
                    helperText: dateError && 'Formato incorrecto',
                  },
                }}
                onChange={(value) => {
                  setDefaultFecha(value);
                }}
              />
            </LocalizationProvider>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="contained" color="error" onClick={onClose}>
          Cerrar
        </Button>
        <LoadingButton
          type="submit"
          variant="contained"
          disabled={dateError || hourError}
          color="success"
        >
          Guardar
        </LoadingButton>
      </DialogActions>
    </FormProvider>
  );
}

function checkDate(start, end, type, allDay) {
  let dateError = false;

  const startStamp = dayjs(start).$d;
  const endStamp = dayjs(end).$d;
  const hour = Math.abs(startStamp - endStamp) / 36e5;

  if (start && end && !allDay) {
    if (startStamp >= endStamp) {
      dateError = true;
    } else if (type === 'date' && hour !== 1) {
      dateError = true;
    }
  }

  return dateError;
}

function userSelect(type, patient) {
  let selectedUser = true;

  if (type === 'date' && !patient.id) {
    selectedUser = false;
  }

  return selectedUser;
}

Lista.propTypes = {
  currentEvent: PropTypes.object,
  onClose: PropTypes.func,
  userData: PropTypes.any,
  usersMutate: PropTypes.func,
  selectedDate: PropTypes.instanceOf(Date),
};
