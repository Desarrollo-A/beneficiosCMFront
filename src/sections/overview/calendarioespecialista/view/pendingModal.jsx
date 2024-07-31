import dayjs from 'dayjs';
import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import localeData from 'dayjs/plugin/localeData';

import { LoadingButton } from '@mui/lab';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import {
  Box,
  Chip,
  List,
  Stack,
  Button,
  Select,
  Divider,
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

import { useAuthContext } from 'src/auth/hooks';
import {
  reRender,
  useGetMotivos,
  useGetPending,
  endAppointment,
  cancelAppointment,
} from 'src/api/calendar-specialist';

import Iconify from 'src/components/iconify';

export default function PendingModal() {
  const { user } = useAuthContext();
  const [open, setOpen] = useState(true);
  const [open2, setOpen2] = useState(false);
  const { data: pendings, pendingsMutate } = useGetPending(user?.idUsuario); // traer todas las citas sin finalzar que sean anterior a la fecha actual
  const [assist, setAssist] = useState('');
  const [reason, setReason] = useState([]);
  const [cancelType, setCancelType] = useState('');
  const { data: reasons } = useGetMotivos(user?.idPuesto);
  const [selectEvent, setSelectEvent] = useState('');
  const selectedReason = reason.length > 0 || cancelType;
  const [btnLoading, setBtnLoading] = useState(false);

  dayjs.locale('es');
  dayjs.extend(localeData);

  const onClose = () => {
    setOpen(false);
  };

  const handleClose2 = () => {
    setBtnLoading(false);
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
      items = pendings.map((pending, index) => (
        <Stack key={index} sx={{ p: 1 }}>
          <ListItem alignItems="flex-start" key={pending.idCita}>
            <ListItemText
              primary={pending.titulo}
              sx={{ width: '45%' }}
              primaryTypographyProps={{ fontSize: '14px' }}
            />
            <ListItemText
              primary={dayjs(pending.start).format('dddd, DD/MMMM/YYYY - HH:mm')}
              sx={{ width: '50%', marginLeft: '1em' }}
              primaryTypographyProps={{ fontSize: '14px' }}
            />
            <IconButton
              onClick={() => handleEnd(pending)}
              sx={{ alignItems: 'inherit', padding: 0 }}
            >
              <Iconify icon="solar:archive-minimalistic-bold" />
            </IconButton>
          </ListItem>
          <Divider />
        </Stack>
      ));
    }
    return items;
  };

  const endSubmit = async () => {
    setBtnLoading(true);
    switch (assist) {
      case 0:
        try {
          const resp = await cancelAppointment(
            selectEvent,
            selectEvent.id,
            cancelType,
            user.idUsuario,
            user.idSede
          );

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
          const resp = await endAppointment(selectEvent, reason, user.idUsuario);

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
            <List>
              <Items />
            </List>
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
                  noOptionsText="Sin opciones"
                  multiple
                  ListboxProps={{ style: { maxHeight: 200 } }}
                  limitTags={2}
                  openText="Abrir"
                  clearText="Borrar"
                  getOptionDisabled={(
                    option // deshabilita las opciones que ya hayan sido seleccionadas
                  ) => reason.some((selectedOption) => selectedOption.value === option.value)}
                  onChange={(event, value) => {
                    setReason(value);
                  }}
                  options={reasons.map((rea) => ({ label: rea.nombre, value: rea.idOpcion }))}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        sx={{
                          backgroundColor: '#e0e0e0',
                          borderRadius: '20px',
                          alignItems: 'center',
                          alignContent: 'center',
                          justifyContent: 'center',
                        }}
                        deleteIcon={
                          <Stack
                            style={{
                              width: '30px',
                              height: '20px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Iconify
                              icon="typcn:delete-outline"
                              sx={{
                                color: 'black',
                              }}
                            />
                          </Stack>
                        }
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
                      style={{ maxHeight: '150px' }}
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
          <Button variant="contained" color="error" onClick={handleClose2} disabled={btnLoading}>
            Regresar
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            disabled={!selectedReason}
            color="success"
            loading={btnLoading}
            onClick={endSubmit}
            autoFocus
          >
            Guardar
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
