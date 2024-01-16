import 'dayjs/locale/es';
import dayjs from 'dayjs';
import * as yup from 'yup';
import { Base64 } from 'js-base64';
import PropTypes from 'prop-types';
import { es } from 'date-fns/locale'
import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Stack from "@mui/system/Stack";
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import ToggleButton from '@mui/material/ToggleButton';
import DialogActions from "@mui/material/DialogActions";
import DialogContent from '@mui/material/DialogContent';
import { Checkbox, FormControlLabel } from '@mui/material';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { MobileDatePicker, MobileTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import uuidv4 from 'src/utils/uuidv4';
import { fDate } from 'src/utils/format-time';

import { getModalities } from 'src/api/calendar-colaborador';
import { reRender, createCustom, createAppointment } from 'src/api/calendar-specialist';

import { enqueueSnackbar } from 'src/components/snackbar';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

const datosUser = JSON.parse(Base64.decode(sessionStorage.getItem('accessToken').split('.')[2]));
export default function Lista({ currentEvent, onClose, userData, selectedDate, usersMutate }) {
    dayjs.locale('es') // valor para cambiar el idioma del dayjs

  const [allDay, setAllDay] = useState(false);
  const defaultHour = {
    horaInicio: dayjs('0000/00/00 08:00:00').format('HH:mm:ss'),
    horaFinal: dayjs('0000/00/00 18:00:00').format('HH:mm:ss'),
  };
  const [defaultFecha, setDefaultFecha] = useState(selectedDate);
  const [defaultInicio, setDefaultInicio] = useState(selectedDate);
  const [defaultEnd, setDefaultEnd] = useState(null);
  const [dateTitle, setDateTitle] = useState(dayjs(selectedDate).format('dddd, DD MMMM YYYY'));
  const [type, setType] = useState('cancel'); // constante para el cambio entre cancelar hora y agendar cita
  const [patient, setPatient] = useState({
    id: '',
    nombre: '',
    idSede: '',
    puesto: '',
    fechaIngreso: '',
  });
  const [allModalities, setAllModalities] = useState([]);
  const [modalitie, setModalitie] = useState({
    id: '',
    idAtencionXSede: '',
  });

  const formSchema = yup.object().shape({
    title: type === 'cancel' ? yup.string().max(100).required('Se necesita el título').trim() : '', // maximo de caracteres para el titulo 100
    start: !allDay ? yup.date().required() : '',
  });

  const methods = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: currentEvent,
  });

  const { reset, watch, handleSubmit } = methods;

  const values = watch();
  const hourError = checkHour(values.start, defaultEnd, type, defaultInicio, defaultFecha, allDay);
  const selectedUser = userSelect(type, patient); // validacion si se selecciono paciente, solo al crear cita
  const selectedModalitie = !!((type === 'date' && modalitie.id) || type === 'cancel');
  const dateError = type === 'cancel' && defaultInicio > defaultFecha; // validacion que la fecha final no sea menor a la fecha inicio
  const endValidation = allDay ? !defaultEnd : defaultEnd;

  const handleChangeType = useCallback(
    (event, newType) => {
      // handle para el cambio entre ocupar una hora o hacer cita solo quantum balance
      if (newType !== null) {
        setType(newType);
        setPatient({ id: '', nombre: '' });
        setModalitie('');
        setAllDay(false);
        setDefaultFecha(selectedDate);
        setDefaultEnd(null);
        setModalitie({ id: '', idAtencionXSede: '' });
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
      setDefaultEnd(null);
      setAllDay(value);
    },
    [selectedDate]
  );

  const handleHourChange = useCallback((value) => {
    const date = value ? value.getTime() + 1 * 60 * 60 * 1000 : null; // se suma 1 hora a la fecha seleccionada en el primer input

    setDefaultEnd(date);
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    let save = '';

    const eventData = {
      // se da el formato juntando la fecha elegida y la hora que se elige con los minutos
      id: uuidv4(),
      title: type === 'cancel' ? data?.title : `Cita con ${patient.nombre}`,
      hora_inicio: !allDay ? dayjs(data?.start).format('HH:mm:ss') : defaultHour.horaInicio,
      hora_final: !allDay ? dayjs(defaultEnd).format('HH:mm:ss') : defaultHour.horaFinal,
      fechaInicio: fDate(defaultInicio),
      fechaFinal: type === 'date' ? fDate(defaultInicio) : fDate(defaultFecha),
      paciente: patient.idUsuario,
    };

    if (dateError || !selectedUser || hourError.result || !endValidation || !selectedModalitie) {
      return enqueueSnackbar('Faltan datos en el formulario', { variant: 'error' });
    }

    if (type === 'date') {
      const ahora = new Date();
      const fechaActual = dayjs(ahora).format('YYYY-MM-DD');
      const isPracticante = patient.nombrePuesto.toLowerCase() === 'practicante';
  
      if (patient.fechaIngreso > fechaActual) {
        return enqueueSnackbar('¡Surgio un problema con la antiguedad del colaborador!', {
          variant: 'error',
        });
      }
  
      // Validamos la antiguedad: Mandamos fechaIngreso, fechaDeHoy, isPracticante, idBeneficio.
      const tieneAntiguedad = validarAntiguedad(
        patient.fechaIngreso,
        fechaActual,
        isPracticante,
        datosUser.idPuesto
      );

      if (!tieneAntiguedad) {
        // onClose();
        return enqueueSnackbar('¡No cuentas con la antiguedad suficiente para agendar una cita!', {
          variant: 'error',
        });
      }
    }

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
      reRender(); // ayuda a que se haga un mutate en caso que sea true el resultado
      reset();
      onClose();
      return enqueueSnackbar(save.msg);
    }
    return enqueueSnackbar(save.msg, { variant: 'error' });
  });

  const handlePatient = async (value) => {
    if (!value) {
      setAllModalities([]);
      setModalitie({ id: '', idAtencionXSede: '' });
      return;
    }

    setPatient(value.values);

    const modalidades = await getModalities(value?.idSede, datosUser.idUsuario);
    if (modalidades.result) setAllModalities(modalidades.data);
  };

  const handleModalitie = (value) => {
    if (!value) {
      setModalitie({ id: '', idAtencionXSede: '' });
      return;
    }

    setModalitie({ id: value?.label, idAtencionXSede: value?.value });
  };

  const validarAntiguedad = (fechaIngreso, fechaHoy, isPracticante, beneficio) => {
    // Convierte las fechas a objetos de tipo Date
    const ingreso = new Date(fechaIngreso);
    const hoy = new Date(fechaHoy);

    // Calcula la diferencia en milisegundos
    const diferenciaMilisegundos = hoy - ingreso;

    // Calcula la diferencia en años, meses y días
    const milisegundosEnUnDia = 24 * 60 * 60 * 1000; // Milisegundos en un día
    const milisegundosEnUnAnio = milisegundosEnUnDia * 365.25; // Milisegundos en un año, considerando años bisiestos

    const diferenciaAnios = Math.floor(diferenciaMilisegundos / milisegundosEnUnAnio);
    const diferenciaMeses = Math.floor(
      (diferenciaMilisegundos % milisegundosEnUnAnio) / (milisegundosEnUnDia * 30.44)
    );
    // Compara la diferencia de meses beneficio, y  puesto.
    if (
      (beneficio !== 158 && (diferenciaMeses >= 3 || diferenciaAnios > 0)) ||
      (!isPracticante && beneficio === 158 && (diferenciaMeses >= 2 || diferenciaAnios > 0)) ||
      (isPracticante && beneficio === 158 && (diferenciaMeses >= 1 || diferenciaAnios > 0))
    ) {
      return true;
    }
    return false;
  };

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
        <Stack direction="row" justifyContent="space-between " sx={{ p: { xs: 1, md: 2 } }}>
          <Typography variant="subtitle1">{dateTitle}</Typography>
          {type === 'cancel' && (
            <FormControlLabel
              sx={{ mt: -0.85 }}
              control={<Checkbox onChange={(value) => handleChangeDay(value.target.checked)} />}
              label="Ocupar dia(s)"
              labelPlacement="start"
              name="daySwitch"
            />
          )}
        </Stack>
        {type === 'date' && (
          <Stack spacing={3} sx={{ p: { xs: 1, md: 2 } }}>
            <RHFAutocomplete
              name="usuario"
              label="Pacientes"
              value=""
              onChange={(_event, value) => {
                handlePatient(value);
              }}
              options={userData.map((user) => ({
                label: user.nombre,
                value: user.idUsuario,
                idSede: user.idSede,
                values: user,
              }))}
            />
          </Stack>
        )}
        <Stack spacing={3} sx={{ p: { xs: 1, md: 2 } }}>
          {type === 'date' ? (
            <RHFAutocomplete
              name="tipoCita"
              label="Tipo de cita"
              value={modalitie.id}
              onChange={(_event, value) => {
                handleModalitie(value);
              }}
              options={allModalities.map((mod) => ({
                label: mod.modalidad,
                value: mod.idAtencionXSede,
              }))}
            />
          ) : (
            <RHFTextField name="title" label="Título" />
          )}
        </Stack>

        <Stack
          direction="row"
          justifyContent="space-between"
          spacing={2}
          sx={{ p: { xs: 1, md: 2 } }}
        >
          <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
            <Controller
              name="fechaInicio"
              render={({ field }) => (
                <MobileDatePicker
                  label="Fecha inicial"
                  sx={{ width: '100%' }}
                  value={defaultInicio}
                  onChange={(value) => {
                    setDefaultInicio(value);
                    setDateTitle(dayjs(value).format('dddd, DD MMMM YYYY')); // al momento de cambiar el valor en el input, cambia el valor del titulo
                  }}
                />
              )}
            />
            {type === 'cancel' && (
              <MobileDatePicker
                label="Fecha final"
                sx={{ width: '100%' }}
                value={defaultFecha}
                slotProps={{
                  textField: {
                    error: dateError,
                    helperText: dateError && 'Error: Menor a la fecha Inicial',
                  },
                }}
                onChange={(value) => {
                  setDefaultFecha(value);
                }}
              />
            )}
          </LocalizationProvider>
        </Stack>

        {!allDay && (
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
                  onChange={(value) => {
                    field.onChange(value);
                    handleHourChange(value);
                  }}
                />
              )}
            />

            <Controller
              name="end"
              render={({ field }) => (
                <MobileTimePicker
                  sx={{ width: '100%' }}
                  label="Hora de finalización"
                  value={defaultEnd}
                  disabled={type === 'date'}
                  slotProps={{
                    textField: {
                      error: hourError.result,
                      helperText: hourError.result && hourError.msg,
                    },
                  }}
                  onChange={(value) => setDefaultEnd(value)}
                />
              )}
            />
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
          disabled={dateError || hourError.result}
          color="success"
        >
          Guardar
        </LoadingButton>
      </DialogActions>
    </FormProvider>
  );
}

function checkHour(start, end, type, dateStart, dateEnd) {
  let validation = { result: false, msg: '' };

  const startStamp = dayjs(start).$d;
  const endStamp = dayjs(end).$d;
  let hour = '';

  dateStart = dayjs(dateStart).format('YYYY/MM/DD');
  dateEnd = dayjs(dateEnd).format('YYYY/MM/DD');
  const hourStart = dayjs(start).format('HH:mm:ss');
  const hourEnd = dayjs(end).format('HH:mm:ss');

  const selectedStart = dayjs(`${dateStart} ${hourStart}`).$d;
  const selectedEnd = dayjs(`${dateEnd} ${hourEnd}`).$d;

  switch (type) {
    case 'date':
      if (start && end) {
        hour = Math.abs(startStamp - endStamp) / 36e5;

        if (startStamp >= endStamp) {
          validation = { result: true, msg: 'Error: hora de inicio mayor a la hora final' };
        } else if (type === 'date' && hour !== 1) {
          validation = { result: true, msg: 'Error: No se puede agendar mas de una hora' };
        }
      }
      break;

    case 'cancel':
      if (start && end) {
        if (selectedStart >= selectedEnd) {
          validation = { result: true, msg: 'Error: hora de inicio mayor a la hora final' };
        }
      }
      break;

    default:
      enqueueSnackbar('Error en las validaciones', { variant: 'error' });
      break;
  }

  return validation;
}

function userSelect(type, patient) {
  let selectedUser = true;

  if (type === 'date' && !patient.idUsuario) {
    selectedUser = false;
  }

  return selectedUser;
}

Lista.propTypes = {
    currentEvent: PropTypes.object,
    onClose: PropTypes.func,
    userData: PropTypes.any,
    usersMutate: PropTypes.func,
    selectedDate: PropTypes.instanceOf(Date)
};