import 'dayjs/locale/es';
import dayjs from 'dayjs';
import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import localeData from 'dayjs/plugin/localeData';
import { Dialog, DialogContent } from '@material-ui/core';

import Tooltip from '@mui/material/Tooltip';
import LoadingButton from '@mui/lab/LoadingButton';
import {
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
import {
  sendMail,
  consultarCita,
  useGetPendientes,
  cancelAppointment,
  updateAppointment,
  registrarDetalleDePago,
  deleteGoogleCalendarEvent,
} from 'src/api/calendar-colaborador';

import Iconify from 'src/components/iconify';

import CalendarPreview from 'src/sections/calendariobeneficiario/calendar-preview';

import EvaluateDialog from './evaluate-dialog';

export default function PendingModalUser() {
  const [open, setOpen] = useState(true);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);
  const [event, setEvent] = useState({});
  const { data: pendientes, pendingsMutate } = useGetPendientes(); // traer todas las citas en pendiente de pago o evaluacion
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [datosCita, setDatosCita] = useState({});
  const [btnConfirmAction, setBtnConfirmAction] = useState(false);

  dayjs.locale('es');
  dayjs.extend(localeData);

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
      return onClose();
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
          <EvaluateDialog
            open={open}
            pendiente={pendientes?.data?.evaluacion[0]}
            mutate={pendingsMutate}
            cerrar={onClose}
          />
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
