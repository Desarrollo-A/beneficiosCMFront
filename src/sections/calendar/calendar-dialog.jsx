import 'dayjs/locale/es';
import dayjs from 'dayjs';
import * as yup from 'yup';
import { Base64 } from 'js-base64';
import PropTypes from 'prop-types';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useRef, useState, useEffect, useCallback } from 'react';

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
import { esES } from '@mui/x-date-pickers/locales';
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
  cancelDate,
  getHorario,
  updateCustom,
  getContactoQB,
  getModalities,
  getSpecialists,
  useGetBenefits,
  useGetModalities,
  createAppointment,
  useGetEspecialists,
  getHorariosOcupados,
  getOficinaByAtencion,
} from 'src/api/calendar-colaborador';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { RHFTextField } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';

const datosUser = JSON.parse(Base64.decode(sessionStorage.getItem('accessToken').split('.')[2]));

dayjs.locale('es');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);

const initialValue = dayjs().tz('America/Mexico_City');
const lastDayOfNextMonth = initialValue.add(2, 'month').startOf('month').subtract(1, 'day');

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
  const [oficina, setOficina] = useState('');
  const [titulo, setTitulo] = useState('');

  const { data: benefits } = useGetBenefits(datosUser.sede);

  const [isLoading, setIsLoading] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const formSchema = yup.object().shape({
    title: !titulo ? yup.string().max(100).required('Se necesita el titulo').trim() : '',
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
    setInfoContact('');
    setOficina('');
    if (input === 'beneficio') {
      setSelectedValues({
        beneficio: value,
        especialista: '',
        modalidad: '',
      });
      const data = await getSpecialists(datosUser.sede, value);
      setEspecialistas(data?.data);
      // console.log('2nd fetch:', data);
    } else if (input === 'especialista') {
      const modalitiesData = await getModalities(datosUser.sede, value);
      setModalidades(modalitiesData?.data);
      // console.log('DENTRO DEL IF', modalitiesData);
      // console.log('-----------------------------------------------------------------');
      // console.log('Validación 1: ', modalitiesData.data.length > 0);
      // console.log('Validación 2: ', modalitiesData?.data.length === 1);
      // console.log('Validación ---: ', modalitiesData?.data && modalitiesData?.data.length === 1);
      // console.log('-----------------------------------------------------------------');
      if (modalitiesData.data.length > 0 && modalitiesData?.data.length === 1) {
        setSelectedValues({
          ...selectedValues,
          especialista: value,
          modalidad: modalitiesData.data[0].tipoCita,
        });
        // console.log('BENEFICIO 158', selectedValues.beneficio === 158);
        if (selectedValues.beneficio === 158) {
          const data = await getContactoQB(value);
          setInfoContact(data);
          // console.log('Información de contacto: ', data);
        } else {
          // console.log(
          //   'oficina',
          //   datosUser.sede,
          //   selectedValues.beneficio,
          //   value,
          //   modalitiesData.data[0].tipoCita
          // );
          const data = await getOficinaByAtencion(
            datosUser.sede,
            selectedValues.beneficio,
            value,
            modalitiesData.data[0].tipoCita
          );
          setOficina(data);
          // // setModalidades(modalitiesData?.data);
          // console.log('Oficina1: ', data);
        }
      } else {
        setSelectedValues({
          ...selectedValues,
          especialista: value,
          modalidad: '',
        });
      }
      const horarios = getHorariosDisponibles(value);
      // console.log('HORARIOS', horarios);
    } else if (input === 'modalidad') {
      setSelectedValues({
        ...selectedValues,
        modalidad: value,
      });
      const data = await getOficinaByAtencion(
        datosUser.sede,
        selectedValues.beneficio,
        setSelectedValues.especialista,
        value
      );
      setOficina(data);
      // console.log('oficina2', data);
    } else if (input === 'all') {
      setSelectedValues({
        beneficio: value,
        especialista: value,
        modalidad: value,
      });
    }
  };

  const generarFechas = (fechaInicial, fechaFinal) => {
    const resultado = [];
    let fechaActual = dayjs(fechaInicial);

    while (fechaActual.isSameOrBefore(fechaFinal, 'day')) {
      resultado.push(fechaActual.format('YYYY-MM-DD'));
      fechaActual = fechaActual.add(1, 'day');
    }

    return resultado;
  };

  const getHorariosDisponibles = async (especialista) => {
    // Consultamos el horario del especialista segun su beneficio.
    const horarioACubrir = await getHorario(selectedValues.beneficio);
    console.log('horarioACubrir', horarioACubrir);
    if (!horarioACubrir) return; // En caso de que no halla horario detenemos el proceso.

    // Teniendo en cuenta el dia actual, consultamos los dias restantes del mes actual y todos los dias del mes que sigue.
    let diasProximos = generarFechas(initialValue, lastDayOfNextMonth);
    console.log('Dias proximos', diasProximos);

    // Le quitamos los registros del dia domingo y tambien sabados en el caso de que no lo trabaje el especialista.
    console.log('Trabaja sabados', horarioACubrir.data[0].sabados);

    diasProximos = diasProximos.filter((date) => {
      const dayOfWeek = dayjs(date).day();
      return dayOfWeek !== 0 && (horarioACubrir.data[0].sabados || dayOfWeek !== 6);
    });
    console.log('Restantes dias proximos', diasProximos);

    const horariosOcupados = await getHorariosOcupados(
      especialista,
      initialValue.format('YYYY-MM-DD'),
      lastDayOfNextMonth.format('YYYY-MM-DD')
    );
    console.log('horariosOcupados', horariosOcupados?.data);

    /* HASTA AQUI TODO BIEN -----------------------------  */

    // Lógica para filtrar las fechas disponibles
    const proceso1 = diasProximos.map((item) => {
      const elemento = {};
      elemento.fecha = item;
      elemento.diaSemana = dayjs(item).day();
      elemento.horaInicio =
        horarioACubrir.data[0].sabados && elemento.diaSemana === 6
          ? (elemento.horaInicio = horarioACubrir.data[0].horaInicioSabado)
          : horarioACubrir.data[0].horaInicio;
      elemento.horaFin =
        horarioACubrir.data[0].sabados && elemento.diaSemana === 6
          ? (elemento.horaFin = horarioACubrir.data[0].horaFinSabado)
          : horarioACubrir.data[0].horaFin;

      const inicio = dayjs(`${item} ${elemento.horaInicio}`);
      const fin = dayjs(`${item} ${elemento.horaFin}`);
      elemento.horas = fin.diff(inicio, 'hour');

      return elemento;
    });

    console.log('Fechas disponibles', proceso1);

    console.log('--------------------------------------------------------------------------------');
  };

  const [dia, setDia] = useState(initialValue);

  const handleDateChange = (newDate) => {
    // Aquí puedes realizar las acciones necesarias con la nueva fecha seleccionada
    console.log('HOOOOOOOOOOOOOOOOOOOOOOOOOY:', newDate);
    setDia(newDate);
  };

  const isWeekend = (date) => {
    const day = date.day();

    return selectedValues.beneficio === 158 || selectedValues.beneficio === 686
      ? day === 0
      : day === 0 || day === 6; // Deshabilitar los sábados
  };

  const disabledDaysFromSQLServer = [
    '25-01-2024', // 6 de enero
    '14-02-2024', // 14 de febrero
    '25-12-2024', // 25 de diciembre
  ];

  const shouldDisableDate = (date) => {
    // Verificar si la fecha es un fin de semana
    const isWeekendDay = isWeekend(date);

    // Verificar si la fecha está en la lista de fechas deshabilitadas
    const formattedDate = date.format('DD-MM-YYYY');
    const isDisabledFromSQLServer = disabledDaysFromSQLServer.includes(formattedDate);

    // Deshabilitar la fecha si es un fin de semana o está en la lista de fechas deshabilitadas
    return isWeekendDay || isDisabledFromSQLServer;
  };

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <DialogTitle sx={{ p: { xs: 1, md: 2 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          useFlexGap
          sx={{ p: { xs: 1, md: 2 } }}
        >
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
            {currentEvent?.id
              ? 'DATOS DE CITA'
              : `AGENDAR CITAAAA ${lastDayOfNextMonth} ${dayjs(initialValue).format(
                  'YYYY/MM/DD HH:mm:ss'
                )}`}
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
          <Grid sx={{ display: 'flex' }}>
            <Grid sx={{ width: '100%' }}>
              <Box
                sx={{
                  width: { xs: '100%', md: '100%' },
                  p: { xs: 1, md: 2 },
                  borderRight: 'lightgray solid',
                  borderRightWidth:
                    selectedValues.especialista && selectedValues.beneficio !== 158
                      ? '2px' // Puedes ajustar el grosor según tus necesidades
                      : '0',
                }}
              >
                <Stack spacing={3}>
                  <Typography variant="subtitle1">
                    {dayjs().locale('es').format('dddd, DD MMMM YYYY')}
                  </Typography>
                  <Stack direction="column" spacing={3} justifyContent="space-between">
                    <RHFTextField
                      name="title"
                      label="Título"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                    />
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
                  {selectedValues.modalidad && selectedValues.beneficio === 158 && (
                    <Stack>
                      Contacte al especialista seleccionado para agendar una cita de Quantum
                      Balance:
                      <br />
                      {infoContact.result ? infoContact.data[0].correo : ' Cargando...'}
                    </Stack>
                  )}
                  {selectedValues.modalidad === 1 && selectedValues.beneficio !== 158 && (
                    <Stack spacing={3} sx={{ p: { xs: 1, md: 2 } }}>
                      Lugar de la cita:
                      {oficina.result ? ` ${oficina.data[0].ubicación}` : ' Cargando...'}
                    </Stack>
                  )}
                </Stack>
              </Box>
            </Grid>
            <Grid
              sx={{
                width: '100%',
                display:
                  selectedValues.especialista && selectedValues.beneficio !== 158
                    ? 'block'
                    : 'none',
              }}
            >
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                <DateCalendar
                  // defaultValue={dia}
                  loading={isLoading}
                  onChange={handleDateChange}
                  renderLoading={() => <DayCalendarSkeleton />}
                  minDate={initialValue}
                  maxDate={lastDayOfNextMonth}
                  shouldDisableDate={shouldDisableDate}
                  views={['year', 'month', 'day']}
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
