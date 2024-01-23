import dayjs from 'dayjs';
import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import localeData from 'dayjs/plugin/localeData';
import { Dialog, DialogContent } from '@material-ui/core';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Chip,
  Stack,
  Button,
  Select,
  ListItem,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  IconButton,
  FormControl,
  ListItemText,
  Autocomplete,
  DialogActions,
} from '@mui/material';

// import { reRender, useGetMotivos, useGetPending, endAppointment, cancelAppointment } from 'src/api/calendar-specialist';
import { useGetPendientes } from 'src/api/calendar-colaborador';

import Iconify from 'src/components/iconify';

export default function PendingModal() {
  const [open, setOpen] = useState(true);
  const [open2, setOpen2] = useState(false);
  const { data: pendings, pendingsMutate } = useGetPendientes(); // traer todas las citas sin finalzar que sean anterior a la fecha actual
  const [assist, setAssist] = useState('');
  const [reason, setReason] = useState([]);
  const [cancelType, setCancelType] = useState('');
  const { data: reasons } = useGetMotivos();
  const [selectEvent, setSelectEvent] = useState('');
  const selectedReason = reason.length > 0 || cancelType;

  dayjs.locale('es');
  dayjs.extend(localeData);

  const onClose = () => {
    setOpen(false);
  };

  const handleClose2 = () => {
    setOpen2(false);
    setReason([]);
    setCancelType('');
  };

  function handleEnd(event) {
    setOpen2(true);
    setSelectEvent(event);
    setAssist('');
  }

  const handleCancel = (event) => {
    setCancelType(event.target.value);
  };

  const handleAssist = (event) => {
    setAssist(event.target.value);
    setReason([]);
    setCancelType('');
  };

  const Items = () => {
    let items = '';
    if (pendings) {
      items = pendings.map((pending) => (
        <ListItem
          key={pending.idCita}
          secondaryAction={
            <IconButton onClick={() => handleEnd(pending)}>
              <Iconify icon="solar:archive-minimalistic-bold" />
            </IconButton>
          }
        >
          <ListItemText primary={pending.titulo} />
          <ListItemText primary={dayjs(pending.fechaInicio).format('dddd, DD/MMMM/YYYY - HH:MM')} />
        </ListItem>
      ));
    }
    return items;
  };

  const endSubmit = async () => {
    switch (assist) {
      case 0:
        try {
          const resp = await cancelAppointment(selectEvent, selectEvent.idCita, cancelType);

          if (resp.result) {
            enqueueSnackbar(resp.msg);
            handleClose2();
          } else {
            enqueueSnackbar(resp.msg, { variant: 'error' });
          }
        } catch (error) {
          enqueueSnackbar('Ha ocurrido un error al cancelar', { variant: 'error' });
          setOpen(false);
        }
        break;

      case 1:
        try {
          const resp = await endAppointment(selectEvent.idCita, reason);

          if (resp.result) {
            enqueueSnackbar(resp.msg);
            handleClose2();
          } else {
            enqueueSnackbar(resp.msg, { variant: 'error' });
          }
        } catch (error) {
          enqueueSnackbar('Ha ocurrido un error', { variant: 'error' });
          setOpen2(false);
        }
        break;

      default:
        break;
    }
    reRender();
    pendingsMutate();
  };

  return (
    <>
      {pendings?.length > 0 && ( // si hay pendientes se mostrara el modal
        <Dialog open={open} fullWidth maxWidth="sm">
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
            <Typography>Hay citas sin finalizar</Typography>
            <Stack sx={{ mt: 2, mb: 4 }}>
              <Items />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="error" onClick={onClose}>
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Dialog // dialog de confirmación de finalización
        open={open2}
        fullWidth
        disableEnforceFocus
        maxWidth="sm"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
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
                  <MenuItem value={1}>Asistencia</MenuItem>
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
                      placeholder="motivos"
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
                    <MenuItem value={3}>Penalizar</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={handleClose2}>
            Cerrar
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            disabled={!selectedReason}
            color="success"
            onClick={endSubmit}
            autoFocus
          >
            Aceptar
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
