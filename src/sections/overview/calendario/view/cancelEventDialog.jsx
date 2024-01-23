import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { es } from 'date-fns/locale';
import { enqueueSnackbar } from 'notistack';
import { useState, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { Box, Stack } from '@mui/system';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { MobileDatePicker, MobileTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { Chip, Button, Select, MenuItem, TextField, InputLabel, Typography, FormControl, Autocomplete, DialogActions, DialogContent } from '@mui/material';

import { fDate } from 'src/utils/format-time';

import { reRender } from 'src/api/calendar-colaborador';
import { reschedule, endAppointment, cancelAppointment } from 'src/api/calendar-specialist';

export default function CancelEventDialog({ type, currentEvent, pastCheck, reasons, onClose, close, selectedDate }) {
  dayjs.locale('es'); // valor para cambiar el idioma del dayjs
  const [assist, setAssist] = useState('');
  const [cancelType, setCancelType] = useState('');
  const [reason, setReason] = useState([]);
  const [fecha, setFecha] = useState(selectedDate);
  const [horaInicio, setHoraInicio] = useState(null);
  const [horaFinal, setHoraFinal] = useState(null);
  const [dateTitle, setDateTitle] = useState(dayjs(selectedDate).format('dddd, DD MMMM YYYY'));
  const selectedReason = validateSelect(type, reason, cancelType, horaInicio, horaFinal);

  const handleAssist = (event) => {
    setAssist(event.target.value);
    setReason([]);
    setCancelType('');
  };

  const handleCancel = (event) => {
    setCancelType(event.target.value);
  };

  const handleHourChange = useCallback((value) => {
    const date = value ? value.getTime() + 1 * 60 * 60 * 1000 : null; // se suma 1 hora a la fecha seleccionada en el primer input
    setHoraInicio(value);
    setHoraFinal(date);
  }, []);

  const hourError = checkHour(horaInicio, horaFinal, cancelType);

  const endEvent = async () => {
    try {
      const resp = await endAppointment(currentEvent?.id, reason);

      if (resp.result) {
        enqueueSnackbar(resp.msg);
        reRender();
        onClose();
        close();
      } else {
        enqueueSnackbar(resp.msg, { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Ha ocurrido un error', { variant: 'error' });
    }
  };

  const cancelEvent = async () => {
    let resp = '';

    const eventData = {
      // se da el formato juntando la fecha elegida y la hora que se elige con los minutos
      idCancelar: currentEvent?.id,
      title: `Cita con ${currentEvent?.nombre}`,
      hora_inicio: dayjs(horaInicio).format('HH:mm:ss'),
      hora_final: dayjs(horaFinal).format('HH:mm:ss'),
      fechaInicio: fDate(fecha),
      paciente: currentEvent?.idPaciente,
      idDetalle: currentEvent?.idDetalle,
      idAtencionXSede: currentEvent?.idAtencionXSede,
      fundacion: currentEvent?.externo,
      oldEventStart: currentEvent?.start,
      oldEventEnd: currentEvent?.end
    };
    switch(cancelType){
        case 8:
            resp = await reschedule(eventData, eventData.idDetalle, cancelType);
            break;

        default:
            resp = await cancelAppointment(currentEvent, currentEvent?.id, cancelType);
            break;
    }

    if (resp.result) {
      enqueueSnackbar(resp.msg);
      reRender();
      onClose();
      close();
    } else {
      enqueueSnackbar(resp.msg, { variant: 'error' });
    }
  };

  const handleSubmit= () => {
    switch(assist){
        case 0:
            cancelEvent();
            break;
        case 1:
            endEvent();
            break;

        default:
            enqueueSnackbar('Ha ocurrido un error', {variant: 'error'});
            break;
    }
  }

  return (
    <>
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
        <Typography>¿Seguro que quieres finalizar la cita?</Typography>
        <Stack spacing={4} sx={{ pt: { xs: 1, md: 4 } }}>
          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
              <InputLabel id="assist-label">Asistencia</InputLabel>
              <Select
                id="assist"
                name="assist"
                labelId="assist-label"
                value={assist}
                label="Asistencia"
                onChange={handleAssist}
              >
                {pastCheck && currentEvent?.estatus === 1 && (
                  <MenuItem value={1}>Asistencia</MenuItem>
                )}

                <MenuItem value={0}>Inasistencia</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {assist === 1 && (
            <FormControl fullWidth>
              <Autocomplete
                id="motivos"
                name="motivos"
                multiple
                limitTags={2}
                getOptionDisabled={(option) =>
                  !!reasons.find((element) => element.idOpcion === option.idOpcion)
                }
                onChange={(event, value) => {
                  setReason(value);
                }}
                options={reasons.map((rea) => ({ label: rea.nombre, value: rea.idOpcion }))}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      style={{
                        backgroundColor: '#e0e0e0',
                        borderRadius: '20px',
                      }}
                      variant="outlined"
                      label={option.label}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    variant="outlined"
                    {...params}
                    label="Selecciona los motivos de la cita"
                  />
                )}
              />
            </FormControl>
          )}
          {assist === 0 && (
            <Box sx={{ minWidth: 120 }}>
              <FormControl fullWidth>
                <InputLabel id="cancel-label">Tipo de cancelación</InputLabel>
                <Select
                  id="cancelType"
                  name="cancelType"
                  labelId="cancel-label"
                  value={cancelType}
                  label="Tipo de cancelación"
                  onChange={handleCancel}
                >
                  <MenuItem value={7}>Cancelado por especialista</MenuItem>
                  {currentEvent?.estatus === 1 && (
                    <MenuItem value={8}>Reagendar</MenuItem>
                  )}
                  {pastCheck && currentEvent?.estatus === 1 && (
                    <MenuItem value={3}>Penalizar</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Box>
          )}
        </Stack>
        {cancelType === 8 && (
          <Stack>
            <Stack direction="row" sx={{ p: 1, mb: 2, mt: 5 }}>
              <Typography variant="subtitle1">{dateTitle}</Typography>
            </Stack>

            <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
              <MobileDatePicker
                label="Fecha inicial"
                sx={{ width: '100%' }}
                value={fecha}
                onChange={(value) => {
                  setFecha(value);
                  setDateTitle(dayjs(value).format('dddd, DD MMMM YYYY')); // al momento de cambiar el valor en el input, cambia el valor del titulo
                }}
              />
            </LocalizationProvider>

            <Stack
              direction="row"
              justifyContent="space-between"
              spacing={2}
              sx={{ mt: 2 }}
            >
              <MobileTimePicker
                sx={{ width: '100%' }}
                label="Hora de inicio"
                value={horaInicio}
                onChange={(value) => {
                  handleHourChange(value);
                }}
              />

              <MobileTimePicker
                sx={{ width: '100%' }}
                label="Hora de finalización"
                value={horaFinal}
                disabled={type === 'date'}
                slotProps={{
                  textField: {
                    error: hourError.result,
                    helperText: hourError.result && hourError.msg,
                  },
                }}
              />
            </Stack>
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
          disabled={selectedReason}
          color="success"
          onClick={handleSubmit}
          autoFocus
        >
          Aceptar
        </LoadingButton>
      </DialogActions>
    </>
  );
}

function validateSelect(type, reason, cancelType, horaInicio, horaFinal){
    let validation = true;

    if(type === 'date' && (reason.length > 0 || cancelType)){
        switch(cancelType){
            case 8:
                if(horaInicio || horaFinal)
                    validation = false
                break;
            
            default:
                validation = false;
                break;
        }
    }

    return validation;
}

function checkHour(start, end, cancelType) {
  let validation = { result: false, msg: '' };
  
  const startStamp = dayjs(start).$d;
  const endStamp = dayjs(end).$d;
  let hour = '';

  switch (cancelType) {
    case 8:
      if (start && end) {
        hour = Math.abs(startStamp - endStamp) / 36e5;

        if (startStamp >= endStamp) {
          validation = { result: true, msg: 'Error: hora de inicio mayor a la hora final' };
        }
        else if (hour !== 1) {
          validation = { result: true, msg: 'Error: No se puede agendar mas de una hora' };
        }
      }
      break;

    default:
        validation = { result: false, msg: '' };
      break;
  }

  return validation;
}

CancelEventDialog.propTypes = {
  type: PropTypes.any,
  currentEvent: PropTypes.object,
  pastCheck: PropTypes.any,
  reasons: PropTypes.array,
  onClose: PropTypes.func,
  close: PropTypes.func,
  selectedDate: PropTypes.any
};
