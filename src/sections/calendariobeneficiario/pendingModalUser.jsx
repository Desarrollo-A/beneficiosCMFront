import 'dayjs/locale/es';
import dayjs from 'dayjs';
import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import localeData from 'dayjs/plugin/localeData';
import { Dialog, DialogContent } from '@material-ui/core';

import Card from '@mui/material/Card';
import Rating from '@mui/material/Rating';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Stack,
  Button,
  ListItem,
  Typography,
  IconButton,
  ListItemText,
  DialogActions,
} from '@mui/material';

import uuidv4 from 'src/utils/uuidv4';

import { useAuthContext } from 'src/auth/hooks';
import { AvatarShape } from 'src/assets/illustrations';
import {
  sendMail,
  consultarCita,
  useGetPendientes,
  cancelAppointment,
  updateAppointment,
  registrarDetalleDePago,
  deleteGoogleCalendarEvent,
} from 'src/api/calendar-colaborador';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';

import CalendarPreview from 'src/sections/calendariobeneficiario/calendar-preview';

export default function PendingModalUser() {
  const [open, setOpen] = useState(true);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);
  const [event, setEvent] = useState({});
  const [valorRating, setValorRating] = useState(0);
  const { data: pendientes, pendingsMutate } = useGetPendientes(); // traer todas las citas en pendiente de pago o evaluacion
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [datosCita, setDatosCita] = useState({});
  const [btnConfirmAction, setBtnConfirmAction] = useState(false);

  dayjs.locale('es');
  dayjs.extend(localeData);

  const theme = useTheme();
  const { user: datosUser } = useAuthContext();

  const onClose = () => {
    setOpen(false);
    setConfirmCancel(false);
  };

  const handleClose2 = () => {
    setOpen2(false);
    setEvent({});
  };

  const handleOpen = async (currentEvent) => {
    setEvent(currentEvent);
    setOpen3(true);
    // SIMULACIÓN DE PAGO

    // checar si paga o no
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setOpen3(false);
    let precio = 50;
    let metodoPago = 1;
    if (datosUser.tipoPuesto.toLowerCase() === 'operativa') {
      precio = 0;
      metodoPago = 3;
    }
    const registrarPago = await registrarDetalleDePago(
      datosUser.idUsuario,
      uuidv4(),
      1,
      precio,
      metodoPago
    );
    if (registrarPago.result) {
      // enqueueSnackbar('¡Detalle de pago registrado!', {
      //   variant: 'success',
      // });
      // Hacer el proceso de actualizar cita
      const update = await updateAppointment(
        datosUser.idUsuario,
        currentEvent.id,
        1,
        registrarPago.data,
        null,
        currentEvent.idEventoGoogle
      );
      if (update.result) {
        enqueueSnackbar('¡Se ha generado el pago con éxito!', {
          variant: 'success',
        });
        setEvent({ ...currentEvent, estatus: 1 });
        setOpen2(true);
      }
      if (!update.result) {
        enqueueSnackbar('¡Se obtuvo un error al intentar generar el pago de cita!', {
          variant: 'error',
        });
      }
    }
    if (!registrarPago.result) {
      enqueueSnackbar('¡Ha surgido un error al intentar registrar el detalle de pago!', {
        variant: 'error',
      });
      return 'onClose()';
    }
    pendingsMutate();

    return '';
  };

  const handleCancel = (cita) => {
    setBtnConfirmAction(false);
    setConfirmCancel(true);
    setDatosCita(cita);
  };

  const onCancel = async () => {
    setBtnConfirmAction(true);
    const cancel = await cancelAppointment(datosCita, datosCita.id, 0, datosUser.idUsuario);
    if (!cancel.result) {
      enqueueSnackbar('¡Se generó un error al intentar cancelar la cita!', {
        variant: 'error',
      });
      pendingsMutate();
      return onClose();
    }
    if (cancel.result) {
      enqueueSnackbar('¡Se ha cancelado la cita!', {
        variant: 'success',
      });

      const deleteGoogleEvent = await deleteGoogleCalendarEvent(
        datosCita.idEventoGoogle,
        'programador.analista36@ciudadmaderas.com' // datosUser.correo Sustituir correo de analista.
      );
      if (!deleteGoogleEvent.result) {
        enqueueSnackbar('¡No se pudo sincronizar el evento con el calendario de google!', {
          variant: 'error',
        });
        pendingsMutate();
        return onClose();
      }
    }
    const scheduledAppointment = await consultarCita(datosCita.id);
    if (!scheduledAppointment.result) {
      enqueueSnackbar('¡Surgió un error al poder mostrar el preview de la cita!', {
        variant: 'error',
      });
      onClose();
      return false;
    }
    const email = await sendMail(scheduledAppointment.data[0], 2, [
      'programador.analista36@ciudadmaderas.com',
      'programador.analista34@ciudadmaderas.com',
      'programador.analista32@ciudadmaderas.com',
      'programador.analista12@ciudadmaderas.com',
      'tester.ti2@ciudadmaderas.com',
      'tester.ti3@ciudadmaderas.com',
    ]);
    if (!email.result) {
      console.error('No se pudo notificar al usuario');
    }
    pendingsMutate();
    return onClose();
  };

  const handleRatingChange = (newValue) => {
    setValorRating(newValue);
  };

  const handleRate = async (thisEvent) => {
    const update = await updateAppointment(
      datosUser.idUsuario,
      thisEvent.id,
      thisEvent.estatus,
      thisEvent.idDetalle,
      valorRating * 2,
      thisEvent.idEventoGoogle
    );

    if (update.result) {
      enqueueSnackbar('¡Gracias por evaluar la cita!', {
        variant: 'success',
      });
    }
    if (!update.result) {
      enqueueSnackbar('¡Se obtuvo un error al intentar guardar la evaluación de la cita!', {
        variant: 'error',
      });
    }
    setValorRating(0);
    pendingsMutate();
    onClose();
    return update.result;
  };

  return (
    <>
      {pendientes?.data?.pago?.length > 0 && ( // si hay pendientes se mostrara el modal
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
            <Typography sx={{ textAlign: 'center', pb: 2 }}>
              ¡Tiene citas con un estado pendiente de pago! Realice el pago ahora mismo para poder
              hacer uso del beneficio.
            </Typography>
            {pendientes?.data?.pago?.length > 0 &&
              pendientes.data.pago.map((pending, key) => (
                <ListItem
                  key={pending.id}
                  secondaryAction={
                    <>
                      <Tooltip title="Cancelar cita">
                        <IconButton onClick={() => handleCancel(pendientes?.data?.pago[key])}>
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Pagar">
                        <IconButton onClick={() => handleOpen(pendientes?.data.pago[key])}>
                          <Iconify icon="ph:money-fill" width={22} />
                        </IconButton>
                      </Tooltip>
                    </>
                  }
                >
                  <ListItemText
                    sx={{ width: '60%' }}
                    primary={`${pending.beneficio} - ${pending.especialista}`}
                  />
                  <ListItemText
                    sx={{ width: '40%' }}
                    primary={dayjs(pending.start).format('DD MMMM YYYY HH:mm')}
                  />
                </ListItem>
              ))}
            <Stack
              direction="row"
              justifyContent="center"
              useFlexGap
              flexWrap="wrap"
              sx={{ pt: { xs: 1, md: 2 }, pb: { xs: 1, md: 2 } }}
            />
          </DialogContent>
        </Dialog>
      )}
      <CalendarPreview event={event} open={open2} handleClose={handleClose2} />
      <Dialog open={open3} maxWidth="sm">
        <DialogContent sx={{ pb: 2 }}>
          <Stack
            direction="row"
            justifyContent="center"
            useFlexGap
            flexWrap="wrap"
            sx={{ pt: { xs: 1, md: 2 }, pb: { xs: 1, md: 2 } }}
          >
            <Typography color="black" sx={{ mt: 1, mb: 1 }}>
              <strong>Confirmando pago...</strong>
            </Typography>
          </Stack>
          <Stack
            direction="row"
            justifyContent="center"
            useFlexGap
            flexWrap="wrap"
            sx={{ pt: { xs: 1, md: 2 }, pb: { xs: 1, md: 2 } }}
          >
            <Iconify icon="eos-icons:bubble-loading" width={30} sx={{ color: 'text.disabled' }} />
          </Stack>
        </DialogContent>
      </Dialog>
      {pendientes?.data?.pago?.length === 0 &&
        !open2 &&
        pendientes?.data?.evaluacion?.length > 0 && (
          <Dialog
            open={open}
            fullWidth
            disableEnforceFocus
            maxWidth="xs"
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            sx={{
              borderRadius: 'initial',
              p: 0,
            }}
            padding={0}
          >
            <Card sx={{ textAlign: 'center', borderRadius: '0%' }}>
              <Box sx={{ position: 'relative' }}>
                <AvatarShape
                  sx={{
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    mx: 'auto',
                    bottom: -27,
                    position: 'absolute',
                  }}
                />

                <Avatar
                  alt={pendientes?.data?.evaluacion[0].especialista}
                  src={
                    pendientes?.data?.evaluacion[0].sexoEspecialista === 'F'
                      ? 'https://api-dev-minimal-v510.vercel.app/assets/images/avatar/avatar_4.jpg'
                      : 'https://api-dev-minimal-v510.vercel.app/assets/images/avatar/avatar_12.jpg'
                  }
                  sx={{
                    width: 64,
                    height: 64,
                    zIndex: 11,
                    left: 0,
                    right: 0,
                    bottom: -32,
                    mx: 'auto',
                    position: 'absolute',
                  }}
                />

                <Image
                  src="https://api-dev-minimal-v510.vercel.app/assets/images/cover/cover_12.jpg"
                  alt="https://api-dev-minimal-v510.vercel.app/assets/images/cover/cover_12.jpg"
                  ratio="16/9"
                  overlay={alpha(theme.palette.grey[900], 0.48)}
                  sx={{ borderRadius: '0%' }}
                />
              </Box>

              <ListItemText
                sx={{ mt: 7, mb: 1 }}
                primary={
                  pendientes?.data?.evaluacion[0].especialista
                    ? pendientes?.data?.evaluacion[0].especialista
                    : 'Especialista'
                }
                secondary={
                  pendientes?.data?.evaluacion[0].beneficio
                    ? pendientes?.data?.evaluacion[0].beneficio
                    : 'Beneficio saludable'
                }
                primaryTypographyProps={{ typography: 'subtitle1' }}
                tertiary={
                  pendientes?.data?.evaluacion[0].start
                    ? pendientes?.data?.evaluacion[0].start
                    : '2024-01-01 10:00:00'
                }
                secondaryTypographyProps={{ component: 'span', mt: 0.5 }}
              />
              <ListItemText
                sx={{ mt: 1, mb: 5 }}
                secondary={
                  pendientes?.data?.evaluacion[0].start
                    ? pendientes?.data?.evaluacion[0].start
                    : '2024-01-01 10:00:00'
                }
                primaryTypographyProps={{ typography: 'subtitle1' }}
                secondaryTypographyProps={{ component: 'span', mt: 0.5 }}
              />

              <Stack direction="row" alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
                <Rating
                  name="half-rating"
                  defaultValue={0}
                  precision={0.5}
                  value={valorRating}
                  onChange={(e, value) => handleRatingChange(value)}
                />
              </Stack>
              <DialogActions justifycontent="center" sx={{ justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleRate(pendientes?.data?.evaluacion[0])}
                >
                  Calificar
                </Button>
              </DialogActions>
            </Card>
          </Dialog>
        )}
      <Dialog open={confirmCancel} maxWidth="sm">
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

          <Typography>¿Está seguro de cancelar la cita?</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={() => setConfirmCancel(false)}>
            Cerrar
          </Button>
          <LoadingButton
            variant="contained"
            color="success"
            onClick={onCancel}
            loading={btnConfirmAction}
            autoFocus
          >
            Aceptar
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
