import 'dayjs/locale/es';
import dayjs from 'dayjs';
import * as yup from 'yup';
import PropTypes from 'prop-types';
import { es } from 'date-fns/locale';
import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Grid } from '@mui/material';
import Stack from '@mui/system/Stack';
import Timeline from '@mui/lab/Timeline';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TimelineDot from '@mui/lab/TimelineDot';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import TimelineContent from '@mui/lab/TimelineContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { MobileDatePicker, MobileTimePicker } from '@mui/x-date-pickers';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import uuidv4 from 'src/utils/uuidv4';
import { fDate } from 'src/utils/format-time';

import { useAuthContext } from 'src/auth/hooks';
import {
  reRender,
  deleteEvent,
  updateCustom,
  updateAppointment,
  useGetEventReasons,
} from 'src/api/calendar-specialist';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { RHFTextField } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';

import '../../styles/style.css';
import CancelEventDialog from './cancel-event-dialog';

export default function DataEventDialog({
  currentEvent,
  onClose,
  selectedDate,
  selectedEnd,
  reasons,
}) {
  const { user } = useAuthContext(); // variable del la sesion del usuario
  dayjs.locale('es'); // valor para cambiar el idioma del dayjs

  const theme = useTheme();

  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const type = currentEvent?.type;
  const fechasFolio = currentEvent?.fechasFolio ? currentEvent?.fechasFolio.split(',') : [];
  const [btnLoading, setBtnLoading] = useState(false);
  const [dateTitle, setDateTitle] = useState(dayjs(selectedDate).format('dddd, DD MMMM YYYY'));
  const pastCheck = selectedDate < new Date(); // checar si la fecha del evento es inferior a la fecha actual
  const disableInputs = (currentEvent?.estatus !== 1 && currentEvent?.estatus !== 6) || pastCheck; // deshabilitar inputs
  const allDay =
    dayjs(currentEvent?.start).format('YYYY/MM/DD') < dayjs(currentEvent?.end).format('YYYY/MM/DD');
  const [defaultInicio, setDefaultInicio] = useState(selectedDate);
  const [defaultFecha, setDefaultFecha] = useState(selectedEnd);
  const [defaultEnd, setDefaultEnd] = useState(dayjs(currentEvent.end).$d);
  const { data: eventReasons } = useGetEventReasons(
    currentEvent?.type === 'date' ? currentEvent?.id : 0
  );
  const formSchema = yup.object().shape({
    title: type === 'cancel' ? yup.string().max(100).required('Se necesita el título').trim() : '', // maximo de caracteres para el titulo 100
    start: !allDay ? yup.date().required() : '',
    end: !allDay ? yup.date().required() : '',
  });

  let sede = currentEvent?.sede || 'Virtual';
  let oficina = currentEvent?.oficina || 'Virtual';

  if (currentEvent?.externo === 1) {
    sede = 'Quéretaro';
    oficina = 'Confirmado por especialista';
  }

  const methods = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: currentEvent,
  });

  const Items = () => {
    // items de los motivos que se trae el evento
    let items = '';
    // reasonsMutate();
    if (eventReasons?.length > 0) {
      items = eventReasons.map((er) => (
        <Tooltip title={er.nombre} key={er.idOpcion}>
          <Typography
            variant="body2"
            sx={{
              color: 'text.disabled',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
            }}
            mb={3}
          >
            {er.nombre}
          </Typography>
        </Tooltip>
      ));
    } else {
      items = (
        <Tooltip title="Sin motivos de cita">
          <Typography
            variant="body2"
            sx={{
              color: 'text.disabled',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
            }}
            mb={3}
          >
            Sin motivos de cita
          </Typography>
        </Tooltip>
      );
    }
    return items;
  };

  const { reset, watch, handleSubmit } = methods;

  const values = watch();
  const hourError = checkHour(values.start, defaultEnd, type, defaultInicio, defaultFecha);
  const dateError =
    type === 'cancel' &&
    dayjs(defaultInicio).format('YYYY/MM/DD') > dayjs(defaultFecha).format('YYYY/MM/DD'); // validacion que la fecha final no sea menor a la fecha inicio, unicamente año/mes/dia

  const onSubmit = handleSubmit(async (data) => {
    let save = '';
    setBtnLoading(true);

    const eventData = {
      // se da el formato juntando la fecha elegida y la hora que se elige con los minutos
      id: currentEvent?.id ? currentEvent?.id : uuidv4(),
      title: data?.title,
      hora_inicio: dayjs(data.start).format('HH:mm:ss'),
      hora_final: dayjs(defaultEnd).format('HH:mm:ss'),
      fechaInicio: fDate(defaultInicio),
      fechaFinal: type === 'date' ? fDate(defaultInicio) : fDate(defaultFecha),
      paciente: currentEvent?.idPaciente,
      estatus: currentEvent?.estatus,
      idEventoGoogle: currentEvent?.idEventoGoogle,
    };

    try {
      if (!dateError && !hourError) {
        switch (type) {
          case 'cancel':
            save = await updateCustom(eventData, user.idUsuario);
            break;

          case 'date':
            save = await updateAppointment(eventData, user.idUsuario, user.idSede);
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

  const onDelete = useCallback(async () => {
    // funcion para borrar horarios ocupados
    try {
      const resp = await deleteEvent(currentEvent?.id, user.idUsuario);

      if (resp.result) {
        enqueueSnackbar(resp.msg);
        reRender();
      } else {
        enqueueSnackbar(resp.msg, { variant: 'error' });
      }

      setOpen(false);
      onClose();
    } catch (error) {
      enqueueSnackbar('Ha ocurrido un error al eliminar', { variant: 'error' });
      setOpen(false);
      onClose();
    }
  }, [currentEvent?.id, enqueueSnackbar, onClose, user.idUsuario]);

  const handleHourChange = useCallback(
    (value) => {
      const date = value ? value.getTime() + 1 * 60 * 60 * 1000 : null; // se suma 1 hora a la fecha seleccionada en el primer input

      if (type === 'date') {
        setDefaultEnd(date);
      }
    },
    [type]
  );

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleOpen = () => {
    setOpen2(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClose2 = () => {
    setOpen2(false);
  };

  let backColor = ''

  if(type === 'date' && theme.palette.mode === 'dark'){
    backColor = '#25303d'
  }
  else if(type === 'date'){
    backColor =  '#f6f7f8'
  }

  return (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle sx={{ p: { xs: 1, md: 1 } }}>
          <Stack spacing={1} sx={{ p: { xs: 1, md: 2 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h5">{dialogTitle(currentEvent?.estatus, type)}</Typography>
              {currentEvent?.id && (currentEvent?.estatus === 1 || currentEvent?.estatus === 6) && (
                <Stack direction="row" spacing={1}>
                  {(currentEvent?.estatus === 1 || currentEvent?.estatus === 6) &&
                    type === 'date' && (
                      <Tooltip title="Finalizar cita">
                        <IconButton className="buttonActions" onClick={handleOpen}>
                          <Iconify icon="solar:archive-minimalistic-bold" />
                        </IconButton>
                      </Tooltip>
                    )}
                  {type === 'cancel' && !pastCheck && (
                    <Tooltip
                      title={currentEvent?.type === 'date' ? 'Cancelar cita' : 'Eliminar horario'}
                    >
                      <IconButton onClick={handleClickOpen}>
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              )}
            </Stack>

            <Typography variant="subtitle1">{dateTitle}</Typography>

            {type === 'cancel' && (
              <Stack spacing={3} sx={{ p: { xs: 1, md: 2 } }}>
                <Typography variant="subtitle1">{dateTitle}</Typography>
                <RHFTextField disabled={disableInputs} name="title" label="Título" />
              </Stack>
            )}
          </Stack>
        </DialogTitle>

        <DialogContent
          style={{
            maxHeight: currentEvent?.id ? '400px' : '600px',
            overflowY: currentEvent?.id ? 'auto' : 'hidden',
          }}
          sx={{
            p: { xs: 1, md: 2 },
            backgroundColor: backColor,
          }}
        >
          {type === 'cancel' ? (
            <>
              <Stack
                direction="row"
                justifyContent="space-between"
                spacing={2}
                sx={{ p: { xs: 1, md: 2 } }}
              >
                <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
                  <MobileDatePicker
                    label="Fecha inicial"
                    disabled={disableInputs}
                    sx={{ width: '100%' }}
                    value={defaultInicio}
                    onChange={(value) => {
                      setDefaultInicio(value);
                      setDateTitle(dayjs(value).format('dddd, DD MMMM YYYY')); // al momento de cambiar el valor en el input, cambia el valor del titulo
                    }}
                  />

                  <MobileDatePicker
                    label="Fecha final"
                    sx={{ width: '100%' }}
                    disabled={disableInputs}
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
                      disabled={disableInputs}
                      sx={{ width: '100%' }}
                      label="Hora de inicio"
                      defaultValue={currentEvent?.id ? dayjs(currentEvent.start).$d : null}
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
                      disabled={disableInputs || type === 'date'}
                      label="Hora finalización"
                      slotProps={{
                        textField: {
                          error: hourError,
                          helperText: hourError && 'Has seleccionado un horario incorrecto',
                        },
                      }}
                      value={defaultEnd}
                      onChange={(value) => setDefaultEnd(value)}
                    />
                  )}
                />
              </Stack>
            </>
          ) : (
            ''
          )}

          {type === 'date' && (
            <Grid container direction="column" justifyContent="space-between">
              <Grid item container direction="row" spacing={1} sx={{ width: '100%' }}>
                <Grid item xs={12}>
                  <Timeline
                    sx={{
                      m: 0,
                      p: 3,
                      [`& .${timelineItemClasses.root}:before`]: {
                        flex: 0,
                        padding: 0,
                      },
                    }}
                  >
                    <TimelineItem>
                      <TimelineSeparator>
                        <TimelineDot className="icons">
                          <Iconify icon="mdi:account-circle" width={30} sx={{ color: '#c9a61d' }} />
                        </TimelineDot>
                        <TimelineConnector />
                      </TimelineSeparator>

                      <TimelineContent>
                        <Typography variant="subtitle1">Paciente</Typography>

                        <Typography variant="body2" sx={{ color: 'text.disabled' }} mb={3}>
                          {currentEvent?.nombre}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>

                    <TimelineItem>
                      <TimelineSeparator>
                        <TimelineDot className="icons">
                          <Iconify icon="mdi:phone" width={30} sx={{ color: '#3399ff' }} />
                        </TimelineDot>
                        <TimelineConnector />
                      </TimelineSeparator>

                      <TimelineContent>
                        <Typography variant="subtitle1">Teléfono</Typography>

                        <Typography variant="body2" sx={{ color: 'text.disabled' }} mb={3}>
                          {currentEvent?.telPersonal}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>

                    <TimelineItem>
                      <TimelineSeparator>
                        <TimelineDot className="icons">
                          <Iconify
                            className="icons"
                            icon="mdi:calendar-clock"
                            width={30}
                            sx={{ color: 'orange' }}
                          />
                        </TimelineDot>
                        <TimelineConnector />
                      </TimelineSeparator>

                      <TimelineContent>
                        <Typography variant="subtitle1">Horario</Typography>

                        <Typography variant="body2" sx={{ color: 'text.disabled' }} mb={3}>
                          {dayjs(currentEvent?.start).format('HH:mm a')} -{' '}
                          {dayjs(currentEvent?.end).format('HH:mm a')}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>

                    <TimelineItem>
                      <TimelineSeparator>
                        <TimelineDot className="icons">
                          <Iconify icon="mdi:earth" width={30} sx={{ color: '#1ac949' }} />
                        </TimelineDot>
                        <TimelineConnector />
                      </TimelineSeparator>

                      <TimelineContent>
                        <Typography variant="subtitle1">Sede</Typography>

                        <Typography variant="body2" sx={{ color: 'text.disabled' }} mb={3}>
                          {sede}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>

                    <TimelineItem>
                      <TimelineSeparator>
                        <TimelineDot className="icons">
                          <Iconify icon="ic:outline-place" width={30} sx={{ color: '#084a73' }} />
                        </TimelineDot>
                        <TimelineConnector />
                      </TimelineSeparator>

                      <TimelineContent>
                        <Typography variant="subtitle1">Ubicación</Typography>

                        <Typography variant="body2" sx={{ color: 'text.disabled' }} mb={3}>
                          {oficina}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>

                    <TimelineItem>
                      <TimelineSeparator>
                        <TimelineDot className="icons">
                          <Iconify icon="ic:outline-email" width={30} sx={{ color: 'gray' }} />
                        </TimelineDot>
                        <TimelineConnector />
                      </TimelineSeparator>

                      <TimelineContent>
                        <Typography variant="subtitle1">Correo</Typography>

                        <Typography variant="body2" sx={{ color: 'text.disabled' }} mb={3}>
                          {currentEvent?.correo
                            ? currentEvent?.correo.toLowerCase()
                            : 'correo-demo@ciudadmaderas.com.mx'}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>

                    {currentEvent?.fechasFolio && (
                      <TimelineItem>
                        <TimelineSeparator>
                          <TimelineDot className="icons">
                            <Iconify
                              icon="mdi:clock-remove-outline"
                              width={30}
                              sx={{ color: 'red' }}
                            />
                          </TimelineDot>
                          <TimelineConnector />
                        </TimelineSeparator>

                        <TimelineContent>
                          <Typography variant="subtitle1">Cancelación</Typography>

                          {fechasFolio.map((fecha, i) => [
                            i > 0 && '',
                            <Typography
                              key={i}
                              style={{ textDecoration: 'line-through' }}
                              fontSize="90%"
                            >
                              {fecha}
                            </Typography>,
                          ])}
                        </TimelineContent>
                      </TimelineItem>
                    )}

                    <TimelineItem>
                      <TimelineSeparator>
                        <TimelineDot className="icons">
                          <Iconify
                            icon="solar:chat-round-line-outline"
                            width={30}
                            sx={{ color: '#1a00a3' }}
                          />
                        </TimelineDot>
                        <TimelineConnector />
                      </TimelineSeparator>

                      <TimelineContent>
                        <Typography variant="subtitle1">Motivos</Typography>
                        <Items />
                      </TimelineContent>
                    </TimelineItem>
                  </Timeline>
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          <Button variant="contained" color="error" onClick={onClose}>
            Cerrar
          </Button>
          {currentEvent?.estatus === 1 && type === 'cancel' && !pastCheck ? (
            <LoadingButton
              type="submit"
              variant="contained"
              loading={btnLoading}
              disabled={dateError || hourError}
              color="success"
            >
              Guardar
            </LoadingButton>
          ) : (
            ''
          )}
        </DialogActions>
      </FormProvider>

      <Dialog open={open} maxWidth="sm">
        <DialogContent>
          <Stack
            direction="row"
            justifyContent="center"
            useFlexGap
            flexWrap="wrap"
            sx={{ pt: { xs: 1, md: 2 }, pb: { xs: 1, md: 2 } }}
          >
            <Typography color="red" sx={{ mt: 1, mb: 1 }}>
              <strong>¡ATENCIÓN!</strong>
            </Typography>
          </Stack>

          <Typography>¿Seguro que quieres eliminar el horario?</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={handleClose}>
            Cerrar
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            color="success"
            onClick={onDelete}
            autoFocus
          >
            Aceptar
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog // dialog de confirmación de finalización
        open={open2}
        fullWidth
        maxWidth="sm"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <CancelEventDialog
          type={type}
          currentEvent={currentEvent}
          pastCheck={pastCheck}
          reasons={reasons}
          onClose={handleClose2}
          close={onClose}
          selectedDate={selectedDate}
        />
      </Dialog>
    </>
  );
}

function checkHour(start, end, type, dateStart, dateEnd) {
  let validation = false;

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
          validation = true;
        } else if (type === 'date' && hour !== 1) {
          validation = true;
        }
      }
      break;

    case 'cancel':
      if (start && end) {
        if (selectedStart >= selectedEnd) {
          validation = true;
        }
      }
      break;

    default:
      break;
  }

  return validation;
}

function dialogTitle(estatus, type) {
  // función solo para mostrar el tipo de titulo en el dialog
  switch (estatus) {
    case 0:
      return 'Eliminado';
    case 1:
      if (type === 'date') return 'Por asistir';
      return 'Mis horarios cancelados';
    case 2:
      return 'Cita cancelada';
    case 3:
      return 'Cita penalizada';
    case 4:
      return 'Cita finalizada';
    case 5:
      return 'Falta justificada';
    case 6:
      return 'Cita pendiente de pago';
    case 7:
      return 'Cancelado por especialista';
    case 8:
      return 'Cita con reagenda';

    default:
      return 'Información';
  }
}

DataEventDialog.propTypes = {
  currentEvent: PropTypes.object,
  onClose: PropTypes.func,
  reasons: PropTypes.any,
  selectedDate: PropTypes.instanceOf(Date),
  selectedEnd: PropTypes.instanceOf(Date),
};
