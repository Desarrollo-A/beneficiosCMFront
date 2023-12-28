import 'dayjs/locale/es';
import dayjs from 'dayjs';
import * as yup from 'yup';
import { Base64 } from 'js-base64';
import PropTypes from 'prop-types';
import { es } from 'date-fns/locale';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState, useEffect, useCallback, useRef } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/system/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import ToggleButton from '@mui/material/ToggleButton';
import { MobileDatePicker } from '@mui/x-date-pickers';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
/*********************************** */
import Badge from '@mui/material/Badge';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';

import uuidv4 from 'src/utils/uuidv4';
import { fDate, fTimestamp } from 'src/utils/format-time';

import {
  /* reRender, */ cancelDate,
  updateCustom,
  useGetBenefits,
  useGetModalities,
  createAppointment,
  useGetEspecialists,
  getSpecialistContact,
  getSpecialists,
  getModalities,
} from 'src/api/calendar-colaborador';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { RHFTextField } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';

const datosUser = JSON.parse(Base64.decode(sessionStorage.getItem('accessToken').split('.')[2]));

function getRandomNumber(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function fakeFetch(date, { signal }) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      const daysInMonth = date.daysInMonth();
      const daysToHighlight = [1, 2, 3].map(() => getRandomNumber(1, daysInMonth));

      resolve({ daysToHighlight });
    }, 500);

    signal.onabort = () => {
      clearTimeout(timeout);
      reject(new DOMException('aborted', 'AbortError'));
    };
  });
}

dayjs.locale('es');
const initialValue = dayjs('2023-12-25');

function ServerDay(props) {
  const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;

  const isSelected = !props.outsideCurrentMonth && highlightedDays.indexOf(props.day.date()) >= 0;

  return (
    <Badge
      key={props.day.toString()}
      overlap="circular"
      badgeContent={isSelected ? '✔️' : undefined}
    >
      <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
    </Badge>
  );
}

export default function CalendarDialog({
  currentEvent,
  onClose,
  selectedDate,
  appointmentMutate,
  /* selectedValues, beneficios, especialistas, modalidades, handleChange */
}) {
  const [selectedValues, setSelectedValues] = useState({
    beneficio: '',
    especialista: '',
    modalidad: '',
  });
  const [beneficios, setBeneficios] = useState([]);
  const [especialistas, setEspecialistas] = useState([]);
  const [modalidades, setModalidades] = useState([]);
  const [infoContact, setInfoContact] = useState('');

  const { data: benefits } = useGetBenefits(datosUser.sede);
  const { data: especialists } = useGetEspecialists(datosUser.sede, selectedValues.beneficio);
  const { data: modalities } = useGetModalities(datosUser.sede, selectedValues.especialista);
  // const { data: infoContact } = useGetSpecialistContact(selectedValues?.especialista || '');
  // const { data: events, appointmentMutate } = useGetAppointmentsByUser(date);

  const requestAbortController = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedDays, setHighlightedDays] = useState([1, 2, 15]);

  const { enqueueSnackbar } = useSnackbar();

  const formSchema = yup.object().shape({
    title: yup.string().max(100).required('Se necesita el titulo').trim(),
    start: yup.date().required(),
    end: yup.date().required(),
  });

  const methods = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: currentEvent,
  });

  const { reset, watch, handleSubmit } = methods;

  const values = watch();
  const dateError =
    values.start && values.end ? fTimestamp(values.start) >= fTimestamp(values.end) : false; // Se dan los datos de star y end, para la validacion que el fin no sea antes que el inicio

  const onSubmit = handleSubmit(async (data) => {
    // if (!especialista) return enqueueSnackbar("Seleccione el especialista", {variant: 'error'});
    const eventData = {
      id: currentEvent?.id ? currentEvent?.id : uuidv4(),
      title: data?.title,
      start: currentEvent?.id
        ? `${fDate(data?.newData)} ${data.start.getHours()}:${data.start.getMinutes()}`
        : dayjs(`${fecha} ${data.start.getHours()}:${data.start.getMinutes()}`).format(
            'YYYY-MM-DD HH:mm'
          ),
      end: currentEvent?.id
        ? `${fDate(data?.newData)} ${data.end.getHours()}:${data.end.getMinutes()}`
        : dayjs(`${fecha} ${data.end.getHours()}:${data.end.getMinutes()}`).format(
            'YYYY-MM-DD HH:mm'
          ),
      hora_inicio: `${data.start.getHours()}:${data.start.getMinutes()}`,
      hora_final: `${data.end.getHours()}:${data.end.getMinutes()}`,
      occupied: currentEvent?.id ? currentEvent.occupied : fecha,
      newDate: fDate(data?.newDate),
      beneficio: selectedValues.beneficio,
      usuario: selectedValues.especialista,
      modalidad: selectedValues.modalidad,
    };

    try {
      if (!dateError) {
        const save = currentEvent?.id
          ? await updateCustom(eventData)
          : await createAppointment(fecha, eventData);
        if (save.result) {
          enqueueSnackbar(save.msg);
          appointmentMutate(); // ayuda a que se haga un mutate en caso que sea true el resultado
          reset();
          onClose();
        } else {
          enqueueSnackbar(save.msg, { variant: 'error' });
        }
      }
    } catch (error) {
      enqueueSnackbar('Ha ocurrido un error al guardar');
    }
  });

  const onCancel = useCallback(async () => {
    try {
      const resp = await cancelDate(`${currentEvent?.id}`);

      if (resp.status) {
        enqueueSnackbar(resp.message);
      } else {
        enqueueSnackbar(resp.message, { variant: 'error' });
      }

      onClose();
    } catch (error) {
      enqueueSnackbar('Error', { variant: 'error' });
      onClose();
    }
  }, [currentEvent?.id, enqueueSnackbar, onClose]);

  const fecha = dayjs(selectedDate).format('YYYY/MM/DD');
  const fechaTitulo = dayjs(selectedDate).format('dddd, DD MMMM YYYY');

  useEffect(() => {
    if (benefits) {
      setBeneficios(benefits);
    }
  }, [benefits]);

  const handleChange = async (input, value) => {
    if (input === 'beneficio') {
      setSelectedValues({
        beneficio: value,
        especialista: '',
        modalidad: '',
      });
      const data = await getSpecialists(datosUser.sede, value);
      setEspecialistas(data?.data);
      console.log('2nd fetch:', data);
    } else if (input === 'especialista') {
      setSelectedValues({
        ...selectedValues,
        especialista: value,
        modalidad: '',
      });
      const data = await getModalities(datosUser.sede, value);
      setModalidades(data?.data);
      console.log('2nd fetch:', data);
      if (data?.data && data?.data.length === 1) {
        console.log(data);
        // setSelectedValues({
        //   ...selectedValues,
        //   modalidad: data.data[1].id,
        // });
      }
    } else if (input === 'modalidad') {
      setSelectedValues({
        ...selectedValues,
        modalidad: value,
      });
    } else if (input === 'all') {
      setSelectedValues({
        beneficio: value,
        especialista: value,
        modalidad: value,
      });
    }
  };

  const fetchHighlightedDays = (date) => {
    const controller = new AbortController();
    fakeFetch(date, {
      signal: controller.signal,
    })
      .then(({ daysToHighlight }) => {
        setHighlightedDays(daysToHighlight);
        setIsLoading(false);
      })
      .catch((error) => {
        // ignore the error if it's caused by `controller.abort`
        if (error.name !== 'AbortError') {
          throw error;
        }
      });

    requestAbortController.current = controller;
  };

  useEffect(() => {
    fetchHighlightedDays(initialValue);
    // abort request on unmount
    return () => requestAbortController.current?.abort();
  }, []);

  const handleMonthChange = (date) => {
    if (requestAbortController.current) {
      // make sure that you are aborting useless requests
      // because it is possible to switch between months pretty quickly
      requestAbortController.current.abort();
    }

    setIsLoading(true);
    setHighlightedDays([]);
    fetchHighlightedDays(date);
  };

  const [dia, setDia] = useState(null);

  const handleDateChange = (newDate) => {
    // Aquí puedes realizar las acciones necesarias con la nueva fecha seleccionada
    console.log('Fecha seleccionada:', newDate);
    setDia(newDate);
  };

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <DialogTitle sx={{ p: { xs: 1, md: 2 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          useFlexGap
          flexWrap="wrap"
          sx={{ p: { xs: 1, md: 2 } }}
        >
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
            {currentEvent?.id ? 'DATOS DE CITA' : 'AGENDAR CITA ' + JSON.stringify(selectedValues)}
          </Typography>
          {!!currentEvent?.id && (
            <Tooltip title="Cancelar cita">
              <IconButton onClick={onCancel}>
                <Iconify icon="solar:trash-bin-trash-bold" width={22} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </DialogTitle>
      <DialogContent
        sx={{ p: { xs: 1, md: 2 } }}
        direction="row"
        justifyContent="space-between"
        useFlexGap
        flexWrap="wrap"
      >
        {currentEvent?.id ? (
          <>
            <Stack spacing={3} sx={{ p: { xs: 1, md: 2 } }}>
              <Typography variant="subtitle1" sx={{ pl: { xs: 1, md: 1 } }}>
                {fechaTitulo}
              </Typography>
            </Stack>
            <Stack
              alignItems="center"
              sx={{
                flexDirection: { sm: 'row', md: 'col' },
                px: { xs: 1, md: 2 },
                py: 1,
              }}
            >
              <Iconify icon="mdi:account-circle" width={30} sx={{ color: 'text.disabled' }} />
              <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                TERAPIA CM
              </Typography>
            </Stack>
            <Stack
              alignItems="center"
              sx={{
                flexDirection: { sm: 'row', md: 'col' },
                px: { xs: 1, md: 2 },
                py: 1,
              }}
            >
              <Iconify icon="mdi:calendar-clock" width={30} sx={{ color: 'text.disabled' }} />
              <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                10:00 - 11:00 PM 2022/02/02
              </Typography>
            </Stack>
            <Stack
              alignItems="center"
              sx={{
                flexDirection: { sm: 'row', md: 'col' },
                px: { xs: 1, md: 2 },
                py: 1,
              }}
            >
              <Iconify icon="mdi:earth" width={30} sx={{ color: 'text.disabled' }} />

              <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                Ciudad de Querétaro
              </Typography>
            </Stack>
            <Stack
              alignItems="center"
              sx={{
                flexDirection: { sm: 'row', md: 'col' },
                px: { xs: 1, md: 2 },
                py: 1,
              }}
            >
              <Iconify icon="ic:outline-place" width={30} sx={{ color: 'text.disabled' }} />

              <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                Calle Venustiano Carranza #36 Centro 76000
              </Typography>
            </Stack>
            <Stack
              sx={{
                flexDirection: 'row',
                px: { xs: 1, md: 2 },
                py: 1,
              }}
            >
              <Stack>
                <Iconify icon="ic:outline-email" width={30} sx={{ color: 'text.disabled' }} />
              </Stack>
              <Stack sx={{ flexDirection: 'col' }}>
                <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                  beneficiario1@ciudadmaderas.com.mx
                </Typography>
              </Stack>
            </Stack>
          </>
        ) : (
          <Grid container spacing={0.5}>
            <Grid xs={6}>
              <Box
                sx={{
                  width: { xs: '100%', md: '100%' },
                  p: { xs: 1, md: 2 },
                  borderRight: 'lightgray solid',
                }}
              >
                <Stack spacing={3}>
                  <Typography variant="subtitle1">
                    {currentEvent?.id
                      ? dayjs(currentEvent.start).format('dddd, DD MMMM YYYY')
                      : fechaTitulo}
                  </Typography>
                  <Box>
                    <FormControl fullWidth sx={{ flex: 1 }}>
                      <Stack
                        direction="column"
                        spacing={4}
                        justifyContent="space-between"
                        sx={{ p: { xs: 1, md: 2 } }}
                      >
                        <FormControl fullWidth>
                          <InputLabel id="beneficio-input">Beneficio</InputLabel>
                          <Select
                            labelId="Beneficio"
                            id="select-beneficio"
                            label="Beneficio"
                            name="beneficio"
                            value={selectedValues.beneficio}
                            onChange={(e) => handleChange('beneficio', e.target.value)}
                            disabled={beneficios.length === 0}
                          >
                            {beneficios.map((e, index) => (
                              <MenuItem key={e.id} value={e.id}>
                                {e.puesto.toUpperCase()}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl fullWidth>
                          <InputLabel id="especialista-input">Especialista</InputLabel>
                          <Select
                            labelId="Especialista"
                            id="select-especialista"
                            label="Especialista"
                            name="especialista"
                            value={selectedValues.especialista}
                            onChange={(e) => handleChange('especialista', e.target.value)}
                            disabled={especialistas.length === 0}
                          >
                            {especialistas.map((e, index) => (
                              <MenuItem key={e.id} value={e.id}>
                                {e.especialista.toUpperCase()}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl fullWidth>
                          <InputLabel id="modalidad-input">Modalidad</InputLabel>
                          <Select
                            labelId="Modalidad"
                            id="select-modalidad"
                            label="Modalidad"
                            name="especialista"
                            value={selectedValues.modalidad}
                            onChange={(e) => handleChange('modalidad', e.target.value)}
                            disabled={modalidades.length === 0}
                          >
                            {modalidades.map((e, index) => (
                              <MenuItem key={e.tipoCita} value={e.tipoCita}>
                                {e.modalidad.toUpperCase()}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Stack>
                      {((selectedValues.modalidad && selectedValues.beneficio !== 158) ||
                        currentEvent?.id) && (
                        <>
                          <Stack spacing={3} sx={{ p: { xs: 1, md: 2 } }}>
                            <RHFTextField disabled={currentEvent?.id} name="title" label="Título" />
                          </Stack>
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="space-between"
                            sx={{ p: { xs: 1, md: 2 } }}
                          >
                            <Controller
                              name="start"
                              render={({ field }) => (
                                <TimePicker
                                  sx={{ width: '100%' }}
                                  disabled={currentEvent?.id}
                                  label="Hora de inicio"
                                  defaultValue={
                                    currentEvent?.id ? dayjs(currentEvent.start).$d : null
                                  }
                                  onChange={(value) => field.onChange(value)}
                                />
                              )}
                            />
                            <Controller
                              name="end"
                              render={({ field }) => (
                                <TimePicker
                                  sx={{ width: '100%' }}
                                  disabled={currentEvent?.id}
                                  label="Hora finalización"
                                  slotProps={{
                                    textField: {
                                      error: dateError,
                                      helperText:
                                        dateError && 'La hora de fin no puede ser inferior o igual',
                                    },
                                  }}
                                  defaultValue={
                                    currentEvent?.id ? dayjs(currentEvent.end).$d : null
                                  }
                                  onChange={(value) => field.onChange(value)}
                                />
                              )}
                            />
                          </Stack>
                        </>
                      )}
                      {selectedValues.modalidad && selectedValues.beneficio === 158 && (
                        <Stack spacing={3} sx={{ p: { xs: 1, md: 2 } }}>
                          Datos de contacto:{' '}
                          {infoContact.result ? infoContact.data[0].correo : 'Cargando...'}
                        </Stack>
                      )}
                    </FormControl>
                  </Box>
                </Stack>
              </Box>
            </Grid>
            <Grid xs={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                  defaultValue={initialValue}
                  loading={isLoading}
                  onMonthChange={handleMonthChange}
                  onChange={handleDateChange}
                  renderLoading={() => <DayCalendarSkeleton />}
                  slots={{
                    day: ServerDay,
                  }}
                  slotProps={{
                    day: {
                      highlightedDays,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="contained" color="error" onClick={onClose}>
          Cerrar
        </Button>
        <LoadingButton type="submit" variant="contained" disabled={dateError} color="success">
          {currentEvent?.id ? 'Cancelar' : 'Agendar'}
        </LoadingButton>
      </DialogActions>
    </FormProvider>
  );
}

CalendarDialog.propTypes = {
  currentEvent: PropTypes.object,
  onClose: PropTypes.func,
  selectedDate: PropTypes.instanceOf(Date),
  appointmentMutate: PropTypes.func,
};
