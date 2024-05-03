import 'dayjs/locale/es';
import dayjs from 'dayjs';
import * as yup from 'yup';
import { mutate } from 'swr';
// import { Base64 } from 'js-base64';
import PropTypes from 'prop-types';
import { es } from 'date-fns/locale';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState, useEffect, useCallback } from 'react';

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
import { endpoints } from 'src/utils/axios';
import { fDate } from 'src/utils/format-time';

import { useAuthContext } from 'src/auth/hooks';
import { getHorario, getModalities } from 'src/api/calendar-colaborador';
import {
  reRender,
  createCustom,
  createAppointment,
  UpdateDetallePaciente,
} from 'src/api/calendar-specialist';

import { enqueueSnackbar } from 'src/components/snackbar';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

// const datosUser = JSON.parse(Base64.decode(sessionStorage.getItem('accessToken').split('.')[2]));
export default function Lista({ currentEvent, onClose, userData, selectedDate, usersMutate }) {
  const { user } = useAuthContext(); // variable del la sesion del usuario
  dayjs.locale('es'); // valor para cambiar el idioma del dayjs

  const [allDay, setAllDay] = useState(false);

  const [hrInicio, setHrInicio] = useState('');

  const [hrFinal, setHrFinal] = useState('');

  const [sabado, setSabado] = useState(0);

  const [defaultFecha, setDefaultFecha] = useState(selectedDate);
  const [btnDisable, setBtnDisable] = useState(false);
  const [defaultInicio, setDefaultInicio] = useState(selectedDate);

  const [defaultInicioCl, setDefaultInicioCl] = useState(selectedDate);

  useEffect(() => {
    const getHr = async () => {
      try {
        const horario = await getHorario(user?.idPuesto, user?.idUsuario);

        const dayOfWeek = dayjs(defaultInicio).day();

        setSabado(horario?.data[0]?.sabados);

        if (dayOfWeek === 6) {
          setHrInicio(horario?.data[0]?.horaInicioSabado);
          setHrFinal(horario?.data[0]?.horaFinSabado);
        } else {
          setHrInicio(horario?.data[0]?.horaInicio);
          setHrFinal(horario?.data[0]?.horaFin);
        }
      } catch (error) {
        console.error('Error al obtener el horario:', error);
        // Manejo de errores, si es necesario
      }
    };

    if (user) {
      getHr();
    }
  }, [user, defaultInicio]);

  const defaultHour = {
    horaInicio: hrInicio,
    horaFinal: hrFinal,
  };

  const defaultHourCancel = {
    horaInicio: dayjs('0000/00/00 08:00:00').format('HH:mm:ss'),
    horaFinal: dayjs('0000/00/00 18:00:00').format('HH:mm:ss'),
  };

  const [defaultEnd, setDefaultEnd] = useState(null);
  const [dateTitle, setDateTitle] = useState(dayjs(selectedDate).format('dddd, DD MMMM YYYY'));
  const [type, setType] = useState('cancel'); // constante para el cambio entre cancelar hora y agendar cita
  const [patient, setPatient] = useState('');
  const [allModalities, setAllModalities] = useState([]);
  const [modalitie, setModalitie] = useState({
    id: '',
    idAtencionXSede: '',
    oficina: '',
    sede: '',
    especialidad: '',
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
  const selectedUser = userSelect(type, patient, values.usuario); // validacion si se selecciono paciente, solo al crear cita
  const selectedModalitie = !!(
    (type === 'date' && modalitie.id) ||
    type === 'cancel' ||
    (type === 'date' && parseInt(patient?.externo, 10) === 1)
  );
  const dateError = type === 'cancel' && defaultInicio > defaultFecha; // validacion que la fecha final no sea menor a la fecha inicio
  const endValidation = allDay ? !defaultEnd : defaultEnd;

  const esp = {
    // idioma de los botones
    okButtonLabel: 'Seleccionar',
    cancelButtonLabel: 'Cancelar',
    datePickerToolbarTitle: 'Selecciona una fecha',
    timePickerToolbarTitle: 'Selecciona un horario',
  };

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
    setBtnDisable(true);
    let save = '';

    const eventData = {
      // se da el formato juntando la fecha elegida y la hora que se elige con los minutos
      id: uuidv4().substring(0, 20),
      title: type === 'cancel' ? data?.title : `Cita con ${patient?.nombreCompleto}`,
      hora_inicio: !allDay ? dayjs(data?.start).format('HH:mm:ss') : defaultHour.horaInicio,
      hora_final: !allDay ? dayjs(defaultEnd).format('HH:mm:ss') : defaultHour.horaFinal,
      fechaInicio: fDate(defaultInicio),
      fechaFinal: type === 'date' ? fDate(defaultInicio) : fDate(defaultFecha),
      paciente: patient,
    };

    const eventDataCancel = {
      // se da el formato juntando la fecha elegida y la hora que se elige con los minutos
      id: uuidv4().substring(0, 20),
      title: type === 'cancel' ? data?.title : `Cita con ${patient?.nombreCompleto}`,
      hora_inicio: !allDay ? dayjs(data?.start).format('HH:mm:ss') : defaultHourCancel.horaInicio,
      hora_final: !allDay ? dayjs(defaultEnd).format('HH:mm:ss') : defaultHourCancel.horaFinal,
      fechaInicio: fDate(defaultInicioCl),
      fechaFinal: type === 'date' ? fDate(defaultInicioCl) : fDate(defaultFecha),
      paciente: patient,
    };

    if (dateError || !selectedUser || hourError.result || !endValidation || !selectedModalitie) {
      setBtnDisable(false);
      return enqueueSnackbar('Faltan datos en el formulario', { variant: 'error' });
    }

    if (type === 'date') {
      const ahora = new Date();
      const fechaActual = dayjs(ahora).format('YYYY-MM-DD');

      if (patient.fechaIngreso > fechaActual) {
        setBtnDisable(false);
        return enqueueSnackbar('¡Surgio un problema con la antigüedad del colaborador!', {
          variant: 'error',
        });
      }

      const tieneAntiguedad = validarAntiguedad(patient.fechaIngreso, fechaActual); // Validamos la antiguedad: Mandamos fechaIngreso, fechaDeHoy, isPracticante, idBeneficio.

      if (!tieneAntiguedad && user.idArea !== 25) {
        // 25 es de ventas
        onClose();
        return enqueueSnackbar('¡El paciente no cuenta con la antigüedad requerida!', {
          variant: 'error',
        });
      }
    }

    switch (type) {
      case 'cancel':
        save = await createCustom(eventDataCancel, user.idUsuario, user.idSede);
        break;

      case 'date':
        save = await createAppointment(eventData, modalitie, user, defaultHour);
        if (save.result) {
          UpdateDetallePaciente(patient.idUsuario, user?.idPuesto);
        }
        break;

      default:
        save = { result: false, msg: 'Error al guardar' };
        break;
    }

    if (save.result) {
      reRender(); // ayuda a que se haga un mutate en caso que sea true el resultado
      reset();
      onClose();

      mutate(endpoints.reportes.citas);
      mutate(endpoints.citas.getCitas);
      mutate(endpoints.dashboard.getCountModalidades);
      mutate(endpoints.dashboard.getCountEstatusCitas);

      return enqueueSnackbar(save.msg);
    }
    setBtnDisable(false);
    return enqueueSnackbar(save.msg, { variant: 'error' });
  });

  const handlePatient = async (value, reason) => {
    if (!value) {
      if (reason === 'clear') {
        setPatient('');
      }

      setAllModalities([]);
      setModalitie({ id: '', idAtencionXSede: '' });
      return;
    }

    setPatient(value.values);

    const modalidades = await getModalities(value?.idSede, user?.idUsuario, patient?.idArea);
    if (modalidades.result) setAllModalities(modalidades.data);
  };

  const handleKeyDown = async () => {
    setAllModalities([]);
    setModalitie({ id: '', idAtencionXSede: '' });
    setPatient('');
  };

  const handleModalitie = (value) => {
    if (!value) {
      setModalitie({ id: '', idAtencionXSede: '' });
      return;
    }

    setModalitie({
      id: value?.label,
      idAtencionXSede: value?.value,
      oficina: value?.oficina,
      sede: value?.sede,
      especialidad: value?.especialidad,
      especialista: value?.especialista,
      modalidad: value.modalidad,
    });
  };

  const validarAntiguedad = (fechaIngreso, fechaHoy) => {
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
    if (diferenciaMeses >= 3 || diferenciaAnios > 0) {
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
          {parseInt(patient?.externo, 10) === 1 && (
            <Typography color="error" variant="subtitle2">
              Para lamat solo aplican citas presenciales
            </Typography>
          )}
          {type === 'cancel' && (
            <FormControlLabel
              sx={{ mt: -0.85 }}
              control={<Checkbox onChange={(value) => handleChangeDay(value.target.checked)} />}
              label="Ocupar día(s)"
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
              onChange={(_event, value, reason) => {
                handlePatient(value, reason);
              }}
              onKeyDown={(e) => {
                handleKeyDown();
              }}
              options={userData.map((users) => ({
                label: users.nombreCompleto,
                value: users.idUsuario,
                idSede: users.idSede,
                values: users,
              }))}
            />
          </Stack>
        )}
        <Stack spacing={3} sx={{ p: { xs: 1, md: 2 } }}>
          {type === 'date' && parseInt(patient?.externo, 10) !== 1 ? (
            <RHFAutocomplete
              name="tipoCita"
              label="Tipo de cita"
              disabled={!allModalities.length > 0}
              helperText={!allModalities.length > 0 ? 'No hay horarios disponibles' : ''}
              value={modalitie.id}
              onChange={(_event, value) => {
                handleModalitie(value);
              }}
              options={allModalities.map((mod) => ({
                label: mod.modalidad,
                value: mod.idAtencionXSede,
                oficina: mod.ubicacionOficina,
                sede: mod.lugarAtiende,
                especialidad: mod.idPuesto,
                especialista: mod.especialista,
                modalidad: mod.tipoCita,
              }))}
            />
          ) : (
            ''
          )}

          {type === 'cancel' && <RHFTextField name="title" label="Título" />}
        </Stack>

        <Stack
          direction="row"
          justifyContent="space-between"
          spacing={2}
          sx={{ p: { xs: 1, md: 2 } }}
        >
          <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns} localeText={esp}>
            {type === 'cancel' ? (
              <>
                <MobileDatePicker
                  label="Fecha inicial"
                  sx={{ width: '100%' }}
                  value={defaultInicio}
                  onChange={(value) => {
                    setDefaultInicioCl(value);
                    setDateTitle(dayjs(value).format('dddd, DD MMMM YYYY')); // al momento de cambiar el valor en el input, cambia el valor del titulo
                  }}
                  shouldDisableDate={(value) => dayjs(value).day() === 0} // Deshabilita los domingos
                />
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
                  shouldDisableDate={(value) => dayjs(value).day() === 0}
                />
              </>
            ) : (
              <Controller
                name="fechaInicio"
                render={({ field }) => (
                  <MobileDatePicker
                    label="Fecha"
                    sx={{ width: '100%' }}
                    value={defaultInicio}
                    onChange={(value) => {
                      setDefaultInicio(value);
                      setDateTitle(dayjs(value).format('dddd, DD MMMM YYYY')); // al momento de cambiar el valor en el input, cambia el valor del titulo
                    }}
                    shouldDisableDate={(value) => {
                      const dayOfWeek = dayjs(value).day();
                      if (dayOfWeek === 0) {
                        return true;
                      }
                      if (dayOfWeek === 6) {
                        if (sabado === 0) {
                          return true;
                        }
                      }
                      return false;
                    }}
                  />
                )}
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
            <LocalizationProvider localeText={esp}>
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
          disabled={dateError || hourError.result}
          color="success"
          loading={btnDisable}
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

  if (type === 'date' && !patient?.idUsuario) {
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
