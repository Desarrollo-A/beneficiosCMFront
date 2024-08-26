import 'dayjs/locale/es';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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

import { endpoints } from 'src/utils/axios';

import { getEncodedHash } from 'src/api/api';
import { useAuthContext } from 'src/auth/hooks';
import { usePostGeneral } from 'src/api/general';
import { useEncuestas } from 'src/api/encuestas';
import {
  sendMail,
  consultarCita,
  useGetPendientes,
  cancelAppointment,
  registrarDetalleDePago,
  updateStatusAppointment,
  deleteGoogleCalendarEvent,
  actualizarFechaIntentoPago,
} from 'src/api/calendar-colaborador';

import Iconify from 'src/components/iconify';

import EvaluateDialog from './evaluate-dialog';
import CalendarPreview from './dialogs/appointment-preview-dialog';
import ConfirmDoblePayment from './dialogs/confirm-payment-dialog';

export default function PendingModalUser({ idUsuario }) {
  const [open, setOpen] = useState(true); // En true para abrir el modal
  const [open2, setOpen2] = useState(false);
  // const [open3, setOpen3] = useState(false);
  const [event, setEvent] = useState({});
  const { data: pendientes, pendingsMutate } = useGetPendientes(); // traer todas las citas en pendiente de pago o evaluacion
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmDoblePago, setConfirmDoblePago] = useState(false);
  const [datosCita, setDatosCita] = useState({});
  const [btnConfirmAction, setBtnConfirmAction] = useState(false);
  const [citaPayment, setCitaPayment] = useState([]);

  /* const { encuestaData } = usePostGeneral(
    idUsuario,
    endpoints.encuestas.evaluacionEncuesta,
    'encuestaData'
  ); */

  const { encuestas } = useEncuestas(idUsuario);

  const encDisponible = encuestas?.some((objeto) => Object.values(objeto).includes(0));

  const [evaluate, setEvaluate] = useState(false);

  useEffect(() => {
    if (encDisponible) {
        setEvaluate(true);
    } else {
        setEvaluate(false);
    }
}, [encDisponible]);

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

  const handleCancel = (cita) => {
    setBtnConfirmAction(false);
    setConfirmCancel(true);
    setDatosCita(cita);
  };

  const handlePayment = (cita) => {
    if (cita.fechaIntentoPago == null || cita.fechaIntentoPago === 'NULL') {
      pagarCitaPendiente(cita);
    } else {
      setCitaPayment([]);
      setConfirmDoblePago(true);
      setCitaPayment(cita);
    }
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
      enqueueSnackbar('¡Has cancelado la cita!', {
        variant: 'success',
      });

      const deleteGoogleEvent = await deleteGoogleCalendarEvent(
        datosCita.idEventoGoogle,
        datosUser.correo // datosUser.correo Sustituir correo de analista.
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
    if (datosUser.correo) {
      const email = await sendMail(
        scheduledAppointment.data[0],
        2,
        [datosUser.correo],
        datosUser.idUsuario
      );
      if (!email.result) {
        console.error('No se pudo notificar al usuario');
      }
    }

    pendingsMutate();
    return onClose();
  };

  const pagarCitaPendiente = async (currentEvent) => {
    // setBtnPayDisabled(true);
    // alert(JSON.stringify(currentEvent));

    /* VALIDAR SI ES GRATUITA LA CITA */
    let precio = 50;
    if (datosUser.tipoPuesto.toLowerCase() === 'operativa') precio = 0.0;

    let nombreBeneficio = '';
    let abreviatura = '';
    switch (currentEvent.idPuesto) {
      case 158:
        nombreBeneficio = 'quantum balance';
        abreviatura = 'QUAN';
        break;
      case 537:
        nombreBeneficio = 'nutrición';
        abreviatura = 'NUTR';
        break;
      case 585:
        nombreBeneficio = 'psicología';
        abreviatura = 'PSIC';
        break;
      case 686:
        nombreBeneficio = 'guía espiritual';
        abreviatura = 'GUIA';
        break;
      default:
        break;
    }

    const ESTATUS_CITA = Object.freeze({
      PENDIENTE_PAGO: 6,
      PROCESANDO_PAGO: 10,
    });

    const DATOS_CITA = Object.freeze({
      TITULO: `Cita ${nombreBeneficio} - ${datosUser.nombre}`,
      ID_ESPECIALISTA: currentEvent.idEspecialista,
      ID_USUARIO: datosUser.idUsuario,
    });

    const DATOS_PAGO = Object.freeze({
      FOLIO: `${DATOS_CITA.ID_USUARIO}${dayjs(new Date()).format('HHmmssYYYYMMDD')}`,
      REFERENCIA: `U${DATOS_CITA.ID_USUARIO}-${abreviatura}-E${DATOS_CITA.ID_ESPECIALISTA}-C${currentEvent.id}`,
      // 'U88-QUAN-E64-C65',
      // `U${DATOS_CITA.ID_USUARIO}-${abreviatura}-E${DATOS_CITA.ID_ESPECIALISTA}-C${agendar.data}}`,
      // Referencia: 'U(idUsuario)-(NUTR, PSIC, GUIA, QUAN)-E(idEspecialista)-C(IDCITA)'
      // Es importante que la referencia tenga está estructura para que se pueda enlazar el historial de pagos a una cita reagendada.
      MONTO: precio,
      CONCEPTO: '1',
      SERVICIO: '501',
    });

    if (datosUser.tipoPuesto.toLowerCase() !== 'operativa') {
      const resultadoPago = await bbPago(
        DATOS_PAGO.FOLIO,
        DATOS_PAGO.REFERENCIA,
        DATOS_PAGO.MONTO,
        DATOS_PAGO.CONCEPTO,
        DATOS_PAGO.SERVICIO
      );
      if (!resultadoPago) {
        const update = await updateStatusAppointment(
          DATOS_CITA.ID_USUARIO,
          currentEvent.id,
          ESTATUS_CITA.PENDIENTE_PAGO
        );
        if (!update) console.error('La cita no se pudo actualizar para realizar el pago');
      }
      // Actualizamos la fecha de intento de pago para que tenga una duración de 10 minutos desde que se intento pagar
      if (resultadoPago) {
        if (currentEvent.fechaIntentoPago == null) {
          await actualizarFechaIntentoPago(DATOS_CITA.ID_USUARIO, currentEvent.id);
        } else {
          const update = await updateStatusAppointment(
            DATOS_CITA.ID_USUARIO,
            currentEvent.id,
            ESTATUS_CITA.PROCESANDO_PAGO
          );
          if (!update) console.error('La cita no se pudo actualizar para realizar el pago');
        }
      }
    }

    if (datosUser.tipoPuesto.toLowerCase() === 'operativa') {
      const METODO_PAGO = Object.freeze({
        NO_APLICA: 7,
      });

      const ESTATUS_PAGO = Object.freeze({
        COBRADO: 1,
      });

      await pagoGratuito(
        DATOS_PAGO.FOLIO,
        DATOS_PAGO.REFERENCIA,
        DATOS_PAGO.CONCEPTO,
        DATOS_PAGO.MONTO,
        METODO_PAGO.NO_APLICA,
        ESTATUS_PAGO.COBRADO,
        currentEvent.id
      );

      enqueueSnackbar('¡Has pagado la cita con éxito!', {
        variant: 'success',
      });
    }

    pendingsMutate();
  };

  const bbPago = async (folio, referencia, monto, concepto, servicio) => {
    const bbString = `${folio}|${referencia}|${monto}|${concepto}|${servicio}|`;
    const hash = await getEncodedHash(bbString);

    const regex = /^U\d+-[A-Z]{4}-E\d+-C\d+$/;
    if (!hash.data || Number.isNaN(folio) || !regex.test(referencia) || servicio === 501) {
      enqueueSnackbar('Hubó un error al mostrar la ventana de pagos', {
        variant: 'error',
      });
      return false;
    }

    // const params = `width=${window.screen.width}, height=${window.screen.height}, top=0, left=0, fullscreen=yes, scrollbars=yes, directories=no`;

    /* ARMARDO DEL FORM PARA ENVIO DE PARAMETROS Y ABRIR POPUP A LA MISMA VEZ */
    const windowName = `w_${Date.now()}${Math.floor(Math.random() * 100000).toString()}`;
    const form = document.createElement('form');
    form.setAttribute('method', 'POST');
    form.setAttribute('action', 'https://multipagos.bb.com.mx/Estandar/index2.php');
    // form.setAttribute('target', windowName);
    form.setAttribute('target', '_blank');

    const fields = [
      { name: 'cl_folio', value: folio },
      { name: 'cl_referencia', value: referencia },
      { name: 'dl_monto', value: monto },
      { name: 'cl_concepto', value: concepto },
      { name: 'servicio', value: servicio },
      { name: 'hash', value: hash.data.trim() },
    ];

    fields.forEach((field) => {
      const hiddenField = document.createElement('input');
      hiddenField.setAttribute('type', 'hidden');
      hiddenField.setAttribute('name', field.name);
      hiddenField.setAttribute('value', field.value);
      form.appendChild(hiddenField);
    });

    document.body.appendChild(form);

    // const popupWindow = window.open('', windowName, params);
    const popupWindow = window.open('', windowName);
    form.target = windowName;
    form.submit();
    document.body.removeChild(form);

    if (!popupWindow) {
      enqueueSnackbar('¡Activa las ventanas emergentes para realizar el pago de la cita!', {
        variant: 'danger',
      });
      return false;
    }
    return true;
  };

  const pagoGratuito = async (
    folio,
    referencia,
    concepto,
    cantidad,
    metodoPago,
    estatusPago,
    idCita
  ) => {
    const registrarPago = await registrarDetalleDePago(
      datosUser.idUsuario,
      folio,
      referencia,
      concepto,
      cantidad,
      metodoPago,
      estatusPago,
      idCita
    );

    if (!registrarPago.result) {
      enqueueSnackbar('¡Ha surgido un error al generar el detalle de pago!', {
        variant: 'error',
      });
    }
    return registrarPago.result;
  };

  return (
    <>
      {pendientes?.data?.pago?.length > 0 && ( // si hay pendientes se mostrara el modal
        <Dialog open={open} fullWidth maxWidth="sm" disableEnforceFocus>
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
              ¡Tienes citas con un estado pendiente de pago! Realiza el pago ahora mismo para poder
              hacer uso del beneficio.
            </Typography>
            {pendientes?.data?.pago?.length > 0 &&
              pendientes.data.pago.map((pending, key) => (
                <ListItem
                  key={pending.id}
                  secondaryAction={
                    <>
                      <Tooltip title="Cancelar cita">
                        <IconButton className="buttonActions" onClick={() => handleCancel(pendientes?.data?.pago[key])}>
                          <Iconify className="bell" icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip className="buttonActions" title="Pagar">
                        <IconButton
                          className="bell"
                          onClick={() => {
                            handlePayment(pendientes?.data.pago[key]);
                          }}
                          disabled={citaPayment?.id === pendientes?.data?.pago[key].id}
                        >
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
      {/* <Dialog open={open3} maxWidth="sm">
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
      </Dialog> */}
      {/* {pendientes?.data?.pago?.length === 0 &&
        !open2 &&
        pendientes?.data?.evaluacion?.length > 0 && (
          <EvaluateDialog
            open={open}
            pendiente={pendientes?.data?.evaluacion[0]}
            mutate={pendingsMutate}
            cerrar={onClose}
          />
        )} */}

      {evaluate ? (
        <EvaluateDialog
          open={open}
          encuestas={encuestas}
          mutate={pendingsMutate}
          cerrar={onClose}
        />
      ) : null}

      <Dialog open={confirmCancel} maxWidth="sm" disableEnforceFocus>
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

      <ConfirmDoblePayment
        open={confirmDoblePago}
        onClose={() => {
          setConfirmDoblePago(false);
          setCitaPayment([]);
        }}
        paymentFunc={() => pagarCitaPendiente(citaPayment)}
        cita={citaPayment}
        sx={{ backgroundColor: '#000000' }}
      />

      {/* <Dialog open={confirmDoblePago} maxWidth="sm" disableEnforceFocus>
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

          <Typography
            sx={{ justifyContent: 'center', alignContent: 'center', textAlign: 'center' }}
          >
            Si ya realizó el pago le pedimos de favor que espere a que el banco actualice el pago de
            la cita. De lo contrario proceda a pagar :D
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              setConfirmDoblePago(false);
              setCitaPayment([]);
            }}
          >
            Cerrar
          </Button>
          <LoadingButton
            variant="contained"
            color="success"
            onClick={() => pagarCitaPendiente(citaPayment)}
            loading={btnConfirmAction}
            autoFocus
          >
            Pagar
          </LoadingButton>
        </DialogActions>
      </Dialog> */}
    </>
  );
}

PendingModalUser.propTypes = {
  idUsuario: PropTypes.any,
};
