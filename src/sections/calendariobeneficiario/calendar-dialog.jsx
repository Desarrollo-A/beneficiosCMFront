import 'dayjs/locale/es';
import dayjs from 'dayjs';
import * as yup from 'yup';
import { mutate } from 'swr';
import PropTypes from 'prop-types';
import utc from 'dayjs/plugin/utc';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import timezone from 'dayjs/plugin/timezone';
import { yupResolver } from '@hookform/resolvers/yup';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

import Stack from '@mui/system/Stack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';

import { endpoints } from 'src/utils/axios';
import { generarFechas } from 'src/utils/general';

import { getEncodedHash } from 'src/api/api';
import { useAuthContext } from 'src/auth/hooks';
import { useGetEventReasons } from 'src/api/calendar-specialist';
import {
  sendMail,
  crearCita,
  getHorario,
  checkInvoice,
  getModalities,
  consultarCita,
  getSpecialists,
  useGetBenefits,
  _isPrimeraCita,
  lastAppointment,
  getCitasSinPagar,
  getAtencionXSede,
  cancelAppointment,
  getDiasDisponibles,
  getCitasSinEvaluar,
  getCitasFinalizadas,
  updateDetailPacient,
  getHorariosOcupados,
  getSedesPresenciales,
  getCitasSinFinalizar,
  getOficinaByAtencion,
  registrarDetalleDePago,
  updateStatusAppointment,
  insertGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  actualizarFechaIntentoPago,
} from 'src/api/calendar-colaborador';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider from 'src/components/hook-form/form-provider';

import EvaluateDialog from './evaluate-dialog';
import CalendarPreview from './calendar-preview';
import AppointmentSchedule from './appointment-schedule';

dayjs.locale('es');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);

let initialValue = dayjs().tz('America/Mexico_City'); // Objeto con todo los datos de fecha y hora
const lastDayOfNextMonth = initialValue.add(2, 'month').startOf('month').subtract(1, 'day');
initialValue = initialValue.hour() < 15 ? initialValue : initialValue.add(1, 'day');

export default function CalendarDialog({ currentEvent, onClose, selectedDate, appointmentMutate }) {
  const [selectedValues, setSelectedValues] = useState({
    beneficio: '',
    especialista: '',
    modalidad: '',
  });
  const [open2, setOpen2] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [reschedule, setReschedule] = useState(false);
  const [beneficios, setBeneficios] = useState([]);
  const [especialistas, setEspecialistas] = useState([]);
  const [modalidades, setModalidades] = useState([]);
  const [errorBeneficio, setErrorBeneficio] = useState(false);
  const [errorEspecialista, setErrorEspecialista] = useState(false);
  const [errorModalidad, setErrorModalidad] = useState(false);
  const [errorHorarioSeleccionado, setErrorHorarioSeleccionado] = useState(false);
  const [oficina, setOficina] = useState({});
  const [diasOcupados, setDiasOcupados] = useState([]);
  const [diasHabilitados, setDiasHabilitados] = useState([]);
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState('');
  const [event, setEvent] = useState({});
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [btnPayDisabled, setBtnPayDisabled] = useState(false);
  const [btnEvaluateDisabled, setBtnEvaluateDisabled] = useState(false);
  const [btnConfirmAction, setBtnConfirmAction] = useState(false);
  const [openEvaluateDialog, setOpenEvaluateDialog] = useState(false);
  const [pendiente, setPendiente] = useState({});
  const [sedesAtencionEspecialista, setSedesAtencionEspecialista] = useState({});
  const [diasPresenciales, setDiasPresenciales] = useState([]);

  const [btnNotificationDisabled, setBtnNotificationDisabled] = useState(false);
  const [email, setEmail] = useState('');
  const [emails, setEmails] = useState([]);
  const [errorMessage, setErrorMessage] = useState('Formato de correo erróneo');
  const [errorEmail, setErrorEmail] = useState(false);
  const [sendEmails, setSendEmails] = useState(false);

  const { user: datosUser } = useAuthContext();

  const { data: benefits } = useGetBenefits(datosUser.idSede, datosUser.idArea);

  const [isLoading, setIsLoading] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const formSchema = yup.object().shape({});

  const { data: eventReasons } = useGetEventReasons(currentEvent?.id || 0);

  const methods = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: currentEvent,
  });

  const { handleSubmit } = methods;

  const selectedDateTittle = dayjs(selectedDate).format('dddd, DD MMMM YYYY');

  const fechasFolio = currentEvent?.fechasFolio ? currentEvent?.fechasFolio.split(',') : [];

  const onSubmit = handleSubmit(async () => {
    // Validaciones de inputs: Coloca leyenda de error debajo de cada input en caso que le falte cumplir con el valor
    if (selectedValues.beneficio === '') return setErrorBeneficio(true);
    if (selectedValues.especialista === '') return setErrorEspecialista(true);
    if (selectedValues.modalidad === '') return setErrorModalidad(true);
    if (horarioSeleccionado === '') return setErrorHorarioSeleccionado(true);
    setBtnDisabled(true);

    const ahora = new Date();
    const fechaActual = dayjs(ahora).format('YYYY-MM-DD');

    const año = horarioSeleccionado.substring(0, 4);
    const mes = horarioSeleccionado.substring(5, 7);

    if (datosUser.fechaIngreso > fechaActual) {
      enqueueSnackbar('¡Existe un error con la fecha de antigüedad!', { variant: 'error' });
      onClose();
      return false;
    }

    const AREAS = Object.freeze({
      VENTAS: 25,
    });

    // Validamos la antiguedad: Mandamos fechaIngreso, fechaDeHoy, isPracticante, idBeneficio.
    const tieneAntiguedad = validarAntiguedad(datosUser.fechaIngreso, fechaActual);
    // Escluimos a ventas por su tipo de contratación
    if (!tieneAntiguedad && datosUser.idArea !== AREAS.VENTAS) {
      enqueueSnackbar('¡No cuentas con la antigüedad suficiente para hacer uso del beneficio!', {
        variant: 'error',
      });
      onClose();
      return false;
    }

    // *** VALIDAMOS SI TIENE CITAS SIN FINALIZAR ***
    const citasSinFinalizar = await getCitasSinFinalizar(
      datosUser.idUsuario,
      selectedValues.beneficio
    );
    if (citasSinFinalizar.result) {
      enqueueSnackbar('Ya tienes una cita en proceso de este beneficio', {
        variant: 'danger',
      });
      onClose();
      return false;
    }

    // *** VALIDAMOS SI TIENE CITAS SIN EVALUAR ***
    const citasSinEvaluar = await getCitasSinEvaluar(datosUser.idUsuario);
    // Si tiene citas en proceso no lo tengo que dejar agendar citas
    if (citasSinEvaluar.result) {
      enqueueSnackbar('Evalúa tus citas previas para poder agendar otra cita', {
        variant: 'danger',
      });
      onClose();
      return false;
    }

    // *** VALIDAMOS SI TIENE CITAS SIN PAGAR ***
    const citasSinPagar = await getCitasSinPagar(datosUser.idUsuario);
    // Si tiene citas en proceso no lo tengo que dejar agendar citas
    if (citasSinPagar.result) {
      enqueueSnackbar('Realiza el pago de tus citas por asistir para poder agendar otra cita', {
        variant: 'danger',
      });
      onClose();
      return false;
    }

    // *** VALIDAMOS SI YA GOZO SUS BENEFICIOS ***
    const citasFinalizadas = await getCitasFinalizadas(datosUser.idUsuario, mes, año);
    if (citasFinalizadas.result === true && citasFinalizadas?.data.length >= 2) {
      enqueueSnackbar(
        'Ya cuentas con la cantidad máxima de beneficios brindados en el mes seleccionado',
        { variant: 'error' }
      );
      onClose();
      return false;
    }

    // *** VERIFICAMOS QUE EXISTA LA ATENCIÓN A SU SEDE O AREA ***
    const idAtencionPorSede = await getAtencionXSede(
      selectedValues.especialista,
      datosUser.idSede,
      datosUser.idArea,
      selectedValues.modalidad
    );
    if (!idAtencionPorSede.result) {
      enqueueSnackbar('¡Surgió un error al consultar los beneficios brindados a su sede!', {
        variant: 'error',
      });
      onClose();
      return false;
    }

    // *** INICIA PROCESO DE AGENDAR CITA ***
    const TIPO_CITA = Object.freeze({
      PRIMERA_CITA: 1,
      CITA_NORMAL: 2,
      CITA_EXTRA: 3,
    });
    let tipoCita = TIPO_CITA.CITA_NORMAL;

    const esPrimeraCita = await _isPrimeraCita(datosUser.idUsuario, selectedValues.beneficio);
    if (esPrimeraCita.result === true) tipoCita = TIPO_CITA.PRIMERA_CITA;

    let nombreBeneficio = '';
    let abreviatura = '';
    switch (selectedValues.beneficio) {
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

    // Evento de google
    let newGoogleEvent = null;
    let organizador = 'programador.analista36@ciudadmaderas.com';
    let correosNotificar = [
      organizador, // datosUser.correo Sustituir correo de analista
      // 'programador.analista34@ciudadmaderas.com',
      // 'programador.analista32@ciudadmaderas.com',
      // 'programador.analista12@ciudadmaderas.com',
      // 'tester.ti3@ciudadmaderas.com',
      // algun correo de especialista
    ];

    if (datosUser.correo === null) {
      organizador = 'programador.analista34@ciudadmaderas.com'; // especialista
      correosNotificar = [
        organizador, // datosUser.correo Sustituir correo de analista
        // 'programador.analista36@ciudadmaderas.com',
        // 'programador.analista34@ciudadmaderas.com',
        // 'programador.analista32@ciudadmaderas.com',
        // 'tester.ti3@ciudadmaderas.com',
      ];
    }
    if (datosUser.tipoPuesto.toLowerCase() === 'operativa') {
      const startDate = dayjs(horarioSeleccionado);
      const endDate = startDate.add(1, 'hour');

      const GOOGLE_EVENT = Object.freeze({
        TITULO: `Cita ${nombreBeneficio} - ${datosUser.nombre}`,
        INICIO_CITA: startDate.format('YYYY-MM-DDTHH:mm:ss'),
        FIN_CITA: endDate.format('YYYY-MM-DDTHH:mm:ss'),
        OFICINA: oficina?.data ? oficina.data[0].ubicación : 'Oficina virtual ',
        DESCRIPCION: `Cita de ${datosUser.nombre} en ${nombreBeneficio}`,
      });

      newGoogleEvent = await insertGoogleCalendarEvent(
        GOOGLE_EVENT.TITULO,
        GOOGLE_EVENT.INICIO_CITA,
        GOOGLE_EVENT.FIN_CITA,
        GOOGLE_EVENT.OFICINA,
        GOOGLE_EVENT.DESCRIPCION,
        correosNotificar, // Sustituir valores de correos
        organizador // datosUser.correo
      );

      if (!newGoogleEvent.result) {
        enqueueSnackbar('Error al conectar con la cuenta de google', {
          variant: 'error',
        });
      }
    }

    /* otro proceso */
    const ESTATUS_CITA = Object.freeze({
      POR_ASISTIR: 1,
      CANCELADA: 2,
      PENALIZADA: 3,
      FINALIZADA: 4,
      JUSTIFICADO: 5,
      PENDIENTE_PAGO: 6,
      CANCELADO_POR_ESPECIALISTA: 7,
      REAGENDADA: 8,
      PAGO_EXPIRADO: 9,
      PROCESO_PAGO: 10,
    });

    const DATOS_CITA = Object.freeze({
      TITULO: `Cita ${nombreBeneficio} - ${datosUser.nombre}`,
      ID_ESPECIALISTA: selectedValues.especialista,
      OBSERVACIONES: '',
      HORA_CITA: horarioSeleccionado,
      TIPO_CITA: tipoCita, // 1 PRIMERA CITA, 2 NORMAL, 3 CITA EXTRA
      ID_ATENCION_POR_SEDE: idAtencionPorSede.data[0].idAtencionXSede,
      ID_USUARIO: datosUser.idUsuario,
      ID_DETALLE_PAGO: null,
      ID_BENEFICIO: selectedValues.beneficio,
      ID_GOOGLE_EVENT:
        datosUser.tipoPuesto.toLowerCase() === 'operativa' ? newGoogleEvent.data.id : null, // newGoogleEvent.result ? newGoogleEvent.data.id : null,
      MODALIDAD: selectedValues.modalidad,
      ESTATUS_CITA:
        datosUser.tipoPuesto.toLowerCase() === 'operativa'
          ? ESTATUS_CITA.POR_ASISTIR
          : ESTATUS_CITA.PROCESO_PAGO,
    });

    const agendar = await agendarCita(
      DATOS_CITA.TITULO,
      DATOS_CITA.ID_ESPECIALISTA,
      DATOS_CITA.OBSERVACIONES,
      DATOS_CITA.HORA_CITA,
      DATOS_CITA.TIPO_CITA,
      DATOS_CITA.ID_ATENCION_POR_SEDE,
      DATOS_CITA.ID_USUARIO,
      DATOS_CITA.ID_DETALLE_PAGO,
      DATOS_CITA.ID_BENEFICIO,
      DATOS_CITA.ID_GOOGLE_EVENT,
      DATOS_CITA.MODALIDAD,
      DATOS_CITA.ESTATUS_CITA
    );

    if (!agendar.result) {
      if (datosUser.tipoPuesto.toLowerCase() === 'operativa') {
        await deleteGoogleCalendarEvent(currentEvent.idEventoGoogle, organizador);
      }
      enqueueSnackbar(agendar.msg, {
        variant: 'error',
      });
      return onClose();
    }

    /* VALIDAR SI ES GRATUITA LA CITA */
    let precio = 0.02;
    if (datosUser.tipoPuesto.toLowerCase() === 'operativa') precio = 0.01;

    /* PAGO  */
    const DATOS_PAGO = Object.freeze({
      FOLIO: `${DATOS_CITA.ID_USUARIO}${dayjs(ahora).format('HHmmssYYYYMMDD')}`,
      REFERENCIA: `U${DATOS_CITA.ID_USUARIO}-${abreviatura}-E${DATOS_CITA.ID_ESPECIALISTA}-C${agendar.data}`,
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
          agendar.data,
          ESTATUS_CITA.PENDIENTE_PAGO
        );
        if (!update) console.error('La cita no se pudo actualizar para realizar el pago');
      }
      if (resultadoPago) {
        await actualizarFechaIntentoPago(DATOS_CITA.ID_USUARIO, agendar.data);
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
        agendar.data
      );
    }

    enqueueSnackbar('¡Se ha agendado la cita con éxito!', {
      variant: 'success',
    });
    appointmentMutate();

    mutate(endpoints.reportes.citas);
    mutate(endpoints.citas.getCitas);
    mutate(endpoints.dashboard.getCountModalidades);
    mutate(endpoints.dashboard.getCountEstatusCitas);

    /* *** PROCESO DE MUESTRA DE PREVIEW *** */
    const scheduledAppointment = await consultarCita(agendar.data);
    if (!scheduledAppointment.result) {
      enqueueSnackbar('¡Surgió un error al poder mostrar la previsualización de la cita!', {
        variant: 'danger',
      });
      return false;
    }

    setEvent({ ...scheduledAppointment.data[0] });
    setOpen2(true);

    // Evento de google
    let sentEmail = null;
    if (datosUser.tipoPuesto.toLowerCase() === 'operativa' && datosUser.correo) {
      sentEmail = await sendMail(
        scheduledAppointment.data[0],
        1,
        correosNotificar,
        datosUser.idUsuario
      );

      if (!sentEmail.result) {
        console.error('No se pudo notificar al usuario');
      }
    }

    return true;
  });

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

    const params = `width=${window.screen.width}, height=${window.screen.height}, top=0, left=0, fullscreen=yes, scrollbars=yes, directories=no`;

    /* ARMARDO DEL FORM PARA ENVIO DE PARAMETROS Y ABRIR POPUP A LA MISMA VEZ */
    const windowName = `w_${Date.now()}${Math.floor(Math.random() * 100000).toString()}`;
    const form = document.createElement('form');
    form.setAttribute('method', 'POST');
    form.setAttribute('action', 'https://multipagos.bb.com.mx/Estandar/index2.php');
    form.setAttribute('target', windowName);

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

    const popupWindow = window.open('', windowName, params);
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

  const onCancel = async () => {
    setBtnConfirmAction(true);
    const cancel = await cancelAppointment(currentEvent, currentEvent.id, 0, datosUser.idUsuario);
    if (!cancel.result) {
      enqueueSnackbar('¡Se generó un error al intentar cancelar la cita!', {
        variant: 'error',
      });
      appointmentMutate();
      return onClose();
    }

    enqueueSnackbar('¡Se ha cancelado la cita!', {
      variant: 'success',
    });

    let organizador = 'programador.analista36@ciudadmaderas.com';
    let correosNotificar = [
      organizador,
      'programador.analista34@ciudadmaderas.com',
      'programador.analista32@ciudadmaderas.com',
      'programador.analista12@ciudadmaderas.com',
      'tester.ti3@ciudadmaderas.com',
      // currentEvent.correoEspecialista
    ];
    if (datosUser.correo === null) {
      organizador = 'programador.analista12@ciudadmaderas.com'; // currentEvent.correoEspecialista;
      correosNotificar = [
        organizador,
        'programador.analista36@ciudadmaderas.com',
        'programador.analista34@ciudadmaderas.com',
        'programador.analista32@ciudadmaderas.com',
        'tester.ti3@ciudadmaderas.com',
      ];
    }

    const deleteGoogleEvent = await deleteGoogleCalendarEvent(
      currentEvent.idEventoGoogle,
      organizador // datosUser.correo Sustituir correo de analista
    );
    if (!deleteGoogleEvent.result) {
      enqueueSnackbar('¡No se pudo sincronizar el evento con el calendario de google!', {
        variant: 'error',
      });
      appointmentMutate();
    }

    const scheduledAppointment = await consultarCita(currentEvent.id);
    if (!scheduledAppointment.result) {
      enqueueSnackbar('¡Surgió un error al poder mostrar la previsualización de la cita!', {
        variant: 'error',
      });
      onClose();
      return false;
    }

    if (datosUser.correo) {
      const sentEmail = await sendMail(
        scheduledAppointment.data[0],
        2,
        correosNotificar,
        datosUser.idUsuario
      );

      if (!sentEmail.result) {
        console.error('No se pudo notificar al usuario');
      }
    }

    appointmentMutate();
    return onClose();
  };

  const pagarCitaPendiente = async () => {
    setBtnPayDisabled(true);
    /* VALIDAR SI ES GRATUITA LA CITA */
    let precio = 0.02;
    if (datosUser.tipoPuesto.toLowerCase() === 'operativa') precio = 0.01;

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
      if (resultadoPago) {
        await actualizarFechaIntentoPago(DATOS_CITA.ID_USUARIO, currentEvent.id);
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

      enqueueSnackbar('¡El pago de cita se ha realizado con exito!', {
        variant: 'success',
      });
    }

    setBtnPayDisabled(false);
    appointmentMutate();
  };

  const onEvaluate = async () => {
    setBtnEvaluateDisabled(true);
    setPendiente(currentEvent);
    setOpenEvaluateDialog(true);
    return true;
  };

  const handleChange = async (input, value) => {
    setBtnDisabled(false);
    setOficina({});
    setHorarioSeleccionado('');
    setErrorHorarioSeleccionado(false);
    setHorariosDisponibles([]);

    if (input === 'beneficio') {
      setErrorBeneficio(false);
      // HACER PROCESO DE DETALLE PACIENTE
      const datosUltimaCita = await lastAppointment(datosUser.idUsuario, value);
      if (datosUltimaCita.result) {
        const modalitiesData = await getModalities(
          datosUser.idSede,
          datosUltimaCita.data[0].idEspecialista,
          datosUser.idArea
        );
        setModalidades(modalitiesData?.data);
        const data = await getOficinaByAtencion(
          datosUser.idSede,
          value,
          datosUltimaCita.data[0].idEspecialista,
          datosUltimaCita.data[0].tipoCita
        );
        setOficina(data);
        getHorariosDisponibles(value, datosUltimaCita.data[0].idEspecialista);
        setSelectedValues({
          beneficio: value,
          especialista: datosUltimaCita.data[0].idEspecialista,
          modalidad: datosUltimaCita.data[0].tipoCita,
        });
        /* ************************************* */
        const sedesEspecialista = await getSedesPresenciales(
          datosUltimaCita.data[0].idEspecialista
        );
        setSedesAtencionEspecialista(sedesEspecialista.result ? sedesEspecialista.data : []);
        const diasDisponibles = await getDiasDisponibles(
          datosUltimaCita.data[0].idEspecialista,
          datosUser.idSede
        );
        setDiasPresenciales(diasDisponibles.result ? diasDisponibles.data : []);
        /* ************************************* */
      } else {
        // DEFAULT SELECTED VALUES
        setSelectedValues({
          beneficio: value,
          especialista: '',
          modalidad: '',
        });
      }
      const data = await getSpecialists(datosUser.idSede, datosUser.idArea, value);
      if (!data?.data) {
        enqueueSnackbar('¡No hay especialistas atendiendo tu sede/área!', { variant: 'error' });
        setEspecialistas([]);
      } else {
        setEspecialistas(data?.data);
      }
    } else if (input === 'especialista') {
      /* ************************************* */
      const sedesEspecialista = await getSedesPresenciales(value);
      setSedesAtencionEspecialista(sedesEspecialista.result ? sedesEspecialista.data : []);
      const diasDisponibles = await getDiasDisponibles(value, datosUser.idSede);
      setDiasPresenciales(diasDisponibles.result ? diasDisponibles.data : []);
      /* ************************************* */
      setErrorEspecialista(false);
      const modalitiesData = await getModalities(datosUser.idSede, value, datosUser.idArea);
      setModalidades(modalitiesData?.data);
      if (modalitiesData.data.length > 0 && modalitiesData?.data.length === 1) {
        setSelectedValues({
          ...selectedValues,
          especialista: value,
          modalidad: modalitiesData.data[0].tipoCita,
        });
        setErrorModalidad(false);
        const data = await getOficinaByAtencion(
          datosUser.idSede,
          selectedValues.beneficio,
          value,
          modalitiesData.data[0].tipoCita
        );
        setOficina(data);
      } else {
        setSelectedValues({
          ...selectedValues,
          especialista: value,
          modalidad: '',
        });
      }
      getHorariosDisponibles(selectedValues.beneficio, value);
    } else if (input === 'modalidad') {
      setSelectedValues({
        ...selectedValues,
        modalidad: value,
      });
      setErrorModalidad(false);
      const data = await getOficinaByAtencion(
        datosUser.idSede,
        selectedValues.beneficio,
        selectedValues.especialista,
        value
      );
      setOficina(data);
    } else if (input === 'all') {
      /* ************************************* */
      const sedesEspecialista = await getSedesPresenciales(value.idEspecialista);
      setSedesAtencionEspecialista(sedesEspecialista.result ? sedesEspecialista.data : []);
      const diasDisponibles = await getDiasDisponibles(value.idEspecialista, datosUser.idSede);
      setDiasPresenciales(diasDisponibles.result ? diasDisponibles.data : []);
      /* ************************************* */
      setSelectedValues({
        beneficio: value.idPuesto,
        especialista: value.idEspecialista,
        modalidad: value.modalidad,
      });
      const data = await getSpecialists(value.idSede, value.idArea, value.idPuesto);
      setEspecialistas(data?.data);
      const modalitiesData = await getModalities(
        value.idSede,
        value.idEspecialista,
        datosUser.idArea
      );
      setModalidades(modalitiesData?.data);

      const oficinaAtencion = await getOficinaByAtencion(
        value.idSede,
        value.idPuesto, // Beneficio
        value.idEspecialista,
        value.modalidad
      );
      setOficina(oficinaAtencion);

      getHorariosDisponibles(value.idPuesto, value.idEspecialista);
    }
  };

  const generarArregloMinutos = (horaInicio, horaFin) => {
    const inicio = dayjs.tz(`1970-01-01T${horaInicio}Z`, 'America/Mexico_City');
    const fin = dayjs.tz(`1970-01-01T${horaFin}Z`, 'America/Mexico_City');
    const arregloMinutos = [];

    for (let i = inicio; i.isSameOrBefore(fin); i = i.add(5, 'minutes')) {
      arregloMinutos.push(i.format('HH:mm:ss'));
    }

    return arregloMinutos;
  };

  const estaEnRango = (fechaComparar, rango) => {
    const fechaRegistro = new Date(fechaComparar);
    const inicioRango = new Date(rango.fechaInicio);
    const finalRango = new Date(rango.fechaFinal);

    // Restar un minuto a ambas fechas
    inicioRango.setMinutes(inicioRango.getMinutes() - 1);
    finalRango.setMinutes(finalRango.getMinutes() - 1);

    const enRango = fechaRegistro >= inicioRango && fechaRegistro <= finalRango;

    return enRango;
  };

  const getRegistrosEn1hora = (segmentos) => {
    const citas = [];
    let cita = [];

    for (let i = 0; i < segmentos.length - 1; i += 1) {
      const horaActual = dayjs(`${segmentos[i].fecha} ${segmentos[i].hora}`);
      const horaSiguiente = dayjs(`${segmentos[i + 1].fecha} ${segmentos[i + 1].hora}`);
      const diferencia = horaSiguiente.diff(horaActual, 'minute');

      if (diferencia === 5) {
        cita.push(segmentos[i]);
        if (cita.length === 11) {
          cita.push(segmentos[i + 1]);
          citas.push({
            fecha: segmentos[i].fecha,
            diaSemana: segmentos[i].diaSemana,
            inicio: cita[0].hora,
            final: cita[cita.length - 1].hora,
          });
          cita = [];
          i += 1;
        }
      } else {
        cita = [];
      }
    }

    return citas;
  };

  const obtenerSoloFechas = (arreglo) => {
    const fechasUnicasSet = new Set();

    arreglo.forEach((item) => {
      fechasUnicasSet.add(item.fecha);
    });

    // Convertir el conjunto a un arreglo
    const fechasUnicas = [...fechasUnicasSet];

    return fechasUnicas;
  };

  const filtradoDias = (diasProximos, filtroDias) => {
    // Utiliza el método filter para obtener los días que están en diasProximos pero no en filtroDias
    const diasNoFiltrados = diasProximos.filter((dia) => !filtroDias.includes(dia));
    return diasNoFiltrados;
  };

  const obtenerRegistrosPorFecha = (arreglo, fechaBuscada) => {
    // Filtrar el arreglo para obtener solo los registros de la fecha buscada
    const registrosFecha = arreglo.filter((registro) =>
      dayjs(registro.fecha).isSame(fechaBuscada, 'day')
    );

    return registrosFecha;
  };

  const getHorariosDisponibles = async (beneficio, especialista) => {
    setIsLoading(true);
    // Consultamos el horario del especialista segun su beneficio.
    const horarioACubrir = await getHorario(beneficio, especialista);

    if (!horarioACubrir.result) return; // En caso de que no halla horario detenemos el proceso.

    // Teniendo en cuenta el dia actual, consultamos los dias restantes del mes actual y todos los dias del mes que sigue.
    const todosLosDiasSiguientes = generarFechas(initialValue, lastDayOfNextMonth);

    // Le quitamos los registros del dia domingo y tambien sabados en el caso de que no lo trabaje el especialista.
    const diasProximos = todosLosDiasSiguientes.filter((date) => {
      const dayOfWeek = dayjs(date).day();
      // Habilita aquellos dias en los que regrese el true en return
      if (horarioACubrir?.data[0]?.sabados === 0) {
        return dayOfWeek !== 0 && dayOfWeek !== 6;
      }
      return dayOfWeek !== 0;
    });

    // Traemos citas y horarios bloqueados por parte del usuario y especialsita
    const horariosOcupados = await getHorariosOcupados(
      especialista,
      datosUser.idUsuario,
      initialValue.format('YYYY-MM-DD'),
      lastDayOfNextMonth.format('YYYY-MM-DD')
    );

    // Dias laborables con horario.
    const diasLaborablesConHorario = diasProximos.map((item) => {
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

    const fechasEn5minutos = diasLaborablesConHorario
      .map((item) => {
        const minutos = generarArregloMinutos(item.horaInicio, item.horaFin);

        return minutos.map((minuto) => ({
          fecha: item.fecha,
          diaSemana: item.diaSemana,
          hora: minuto,
        }));
      })
      .flat();

    // El proceso chido de quitar los registros en donde hay citas u horario ocupado
    const registrosFiltrados = fechasEn5minutos.filter((row) => {
      const fechaRegistro = dayjs
        .tz(`${row.fecha}T${row.hora}Z`, 'America/Mexico_City')
        .toISOString();

      if (horariosOcupados && horariosOcupados.data) {
        return !horariosOcupados.data.some((horario) => estaEnRango(fechaRegistro, horario));
      }

      // En caso de que horariosOcupados o horariosOcupados.data sean undefined, se considera que no hay conflictos
      return true;
    });

    const registrosCadaHora = getRegistrosEn1hora(registrosFiltrados);

    // Resltado final de los horarios de todos los dias para agendar
    setFechasDisponibles(registrosCadaHora);

    // ////////////////////////////////////////////////////////////////////////////////////////
    // Este proceso solo es para quitar en el calendario visualmente los dias que no están ///
    // ///////////////////////////////////////////////////////////////////////////////////////
    const diasDisponibles = obtenerSoloFechas(registrosCadaHora);
    setDiasHabilitados(diasDisponibles);

    const diasOcupadosFiltro = filtradoDias(todosLosDiasSiguientes, diasDisponibles);

    const year = initialValue.year();

    // Dias festivos
    const diasFestivos =
      beneficio === 158
        ? []
        : [
            `${year}-01-01`,
            `${year}-02-05`,
            `${year}-03-21`,
            `${year}-05-01`,
            `${year}-09-16`,
            `${year}-11-20`,
            `${year}-12-01`,
            `${year}-12-25`,
            `${year + 1}-01-01`,
            `${year + 1}-02-05`,
            `${year + 1}-03-21`,
            `${year + 1}-05-01`,
            `${year + 1}-09-16`,
            `${year + 1}-11-20`,
            `${year + 1}-12-01`,
            `${year + 1}-12-25`,
          ];

    const diasADeshabilitar = new Set([...diasOcupadosFiltro, ...diasFestivos]);

    setDiasOcupados([...diasADeshabilitar]);
    setIsLoading(false);
  };

  const handleHorarioSeleccionado = (val) => {
    setBtnDisabled(false);
    setHorarioSeleccionado(val);
  };

  const handleDateChange = (newDate) => {
    setErrorHorarioSeleccionado(false);
    setBtnDisabled(false);

    // Bloque para obtener las horas del dia actual mas una cant de horas para validar registros del mismo dia actual.
    const ahora = new Date();
    const horaActual = ((ahora.getHours() + 3) % 24).toString().padStart(2, '0');

    const minutosActuales = ahora.getMinutes().toString().padStart(2, '0');
    const segundosActuales = ahora.getSeconds().toString().padStart(2, '0');

    // Bloque para validar que no seleccione otro día que no sean los permitidos.
    const diaSeleccionado = dayjs(newDate).format('YYYY-MM-DD');
    const estaHabilitado = diasHabilitados.includes(diaSeleccionado);
    if (!estaHabilitado) {
      setHorariosDisponibles([]);
      return;
    }

    // Función para regresar los registros de horarios del dia seleccionado
    const arregloFiltrado = obtenerRegistrosPorFecha(fechasDisponibles, diaSeleccionado);

    // Vuelvo a filtrar los registros que esten dentro del horario disponible.
    const fechaActual = dayjs(ahora).format('YYYY-MM-DD');

    // Valido si selecciono el dia de hoy para quitar horarios no permitidos.
    if (diaSeleccionado === fechaActual) {
      const fechaHoraActual = new Date(
        ahora.getFullYear(),
        ahora.getMonth(),
        ahora.getDate(),
        horaActual,
        minutosActuales,
        segundosActuales
      );
      const resultadosFiltrados = arregloFiltrado.filter((item) => {
        const fechaHoraInicio = new Date(`${item.fecha}T${item.inicio}`);

        return fechaHoraInicio > fechaHoraActual;
      });
      setHorariosDisponibles(resultadosFiltrados);
      if (resultadosFiltrados.length > 0) {
        setHorarioSeleccionado(`${resultadosFiltrados[0].fecha} ${resultadosFiltrados[0].inicio}`);
      } else {
        setHorarioSeleccionado(``);
      }
    } else {
      setHorariosDisponibles(arregloFiltrado);
      if (arregloFiltrado.length > 0) {
        setHorarioSeleccionado(`${arregloFiltrado[0].fecha} ${arregloFiltrado[0].inicio}`);
      } else {
        setHorarioSeleccionado(``);
      }
    }
  };

  // const isWeekend = (date) => {
  //   const day = date.day();

  //   return day === 0
  //   // Deshabilitar los sábados
  // };

  const shouldDisableDate = (date) => {
    // Verificar si la fecha es un fin de semana
    // const isWeekendDay = isWeekend(date);

    // Verificar si la fecha está en la lista de fechas deshabilitadas
    const formattedDate = date.format('YYYY-MM-DD');
    const isDisabledFromSQLServer = diasOcupados.includes(formattedDate);
    let noPresencial = false;
    if (selectedValues.modalidad === 1) {
      if (sedesAtencionEspecialista?.length > 1) {
        noPresencial = !diasPresenciales.includes(formattedDate); // Deshabilitar si no esta entre los dias
      }
    }
    // Deshabilitar la fecha si es un fin de semana o está en la lista de fechas deshabilitadas
    return isDisabledFromSQLServer || noPresencial; // isWeekendDay ||
  };

  const agendarCita = async (
    titulo,
    especialista,
    observaciones,
    horarioCita,
    tipoCita,
    atencionPorSede,
    idUsuario,
    detallePago,
    beneficio,
    idGoogleEvent,
    modalidad,
    estatusCita
  ) => {
    const registrarCita = await crearCita(
      titulo,
      especialista,
      idUsuario,
      observaciones,
      horarioCita,
      tipoCita,
      atencionPorSede,
      datosUser.idSede,
      estatusCita,
      idUsuario,
      idUsuario,
      detallePago,
      idGoogleEvent,
      modalidad
    );
    if (registrarCita.result) {
      const updateDetail = await updateDetailPacient(datosUser.idUsuario, beneficio);
      if (!updateDetail.result) {
        enqueueSnackbar('¡Ha surgido un error al actualizar el estado del beneficio en uso!', {
          variant: 'error',
        });
        return registrarCita;
      }
      return registrarCita;
    }
    return registrarCita;
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

  const handleReSchedule = async () => {
    setBtnDisabled(true);
    // Validaciones de inputs: Coloca leyenda de error debajo de cada input en caso que le falte cumplir con el valor
    if (selectedValues.beneficio === '') return setErrorBeneficio(true);
    if (selectedValues.especialista === '') return setErrorEspecialista(true);
    if (selectedValues.modalidad === '') return setErrorModalidad(true);
    if (horarioSeleccionado === '') return setErrorHorarioSeleccionado(true);

    const ahora = new Date();
    const fechaActual = dayjs(ahora).format('YYYY-MM-DD');

    const año = horarioSeleccionado.substring(0, 4);
    const mes = horarioSeleccionado.substring(5, 7);
    // const dia = horarioSeleccionado.substring(8, 10);

    const checkInvoiceDetail = await checkInvoice(currentEvent.idDetalle);

    if (!checkInvoiceDetail.result) {
      enqueueSnackbar('¡La cita no se puede reagendar más veces!', {
        variant: 'error',
      });
      return onClose();
    }

    if (datosUser.fechaIngreso > fechaActual) {
      enqueueSnackbar('¡Existe un error con la fecha de antigüedad!', {
        variant: 'error',
      });
      return onClose();
    }

    // Validamos la antiguedad: Mandamos fechaIngreso, fechaDeHoy, isPracticante, idBeneficio.
    const tieneAntiguedad = validarAntiguedad(datosUser.fechaIngreso, fechaActual);

    // 25 Es ventas :)
    if (!tieneAntiguedad && datosUser.idArea !== 25) {
      enqueueSnackbar('¡No cuentas con la antigüedad suficiente para hacer uso del beneficio!', {
        variant: 'error',
      });
      return onClose();
    }

    const cancel = await cancelAppointment(currentEvent, currentEvent.id, 8, datosUser.idUsuario);

    if (!cancel.result) {
      enqueueSnackbar('Surgió un error al intentar cancelar la cita previa', {
        variant: 'error',
      });
      return onClose();
    }

    const citasSinFinalizar = await getCitasSinFinalizar(
      datosUser.idUsuario,
      selectedValues.beneficio
    );

    // Si tiene citas en proceso no lo tengo que dejar agendar citas
    if (citasSinFinalizar.result) {
      enqueueSnackbar('Ya tienes una cita en proceso de este beneficio', {
        variant: 'error',
      });
      return onClose();
    }

    const citasFinalizadas = await getCitasFinalizadas(datosUser.idUsuario, mes, año);

    if (citasFinalizadas.result === true && citasFinalizadas?.data.length >= 2) {
      enqueueSnackbar(
        'Ya cuentas con la cantidad máxima  de beneficios brindados en el mes seleccionado',
        {
          variant: 'error',
        }
      );
      return onClose();
    }

    let nombreBeneficio = '';
    switch (selectedValues.beneficio) {
      case 158:
        nombreBeneficio = 'quantum balance';
        break;
      case 537:
        nombreBeneficio = 'nutrición';
        break;
      case 585:
        nombreBeneficio = 'psicología';
        break;
      case 686:
        nombreBeneficio = 'guía espiritual';
        break;
      default:
        break;
    }

    const agendar = await agendarCita(
      `Cita ${nombreBeneficio} - ${datosUser.nombre}`,
      currentEvent?.idEspecialista,
      ' ',
      horarioSeleccionado,
      currentEvent.tipoCita,
      currentEvent.idAtencionXSede,
      datosUser.idUsuario,
      currentEvent.idDetalle,
      selectedValues.beneficio,
      currentEvent.idEventoGoogle,
      currentEvent.modalidad,
      1
    );

    if (!agendar.result) {
      return enqueueSnackbar(agendar.msg, {
        variant: 'error',
      });
    }

    const startDate = dayjs(horarioSeleccionado);
    const endDate = startDate.add(1, 'hour');

    let organizador = 'programador.analista36@ciudadmaderas.com';
    let correosNotificar = [
      organizador, // datosUser.correo Sustituir correo de analista
      'programador.analista34@ciudadmaderas.com',
      'programador.analista32@ciudadmaderas.com',
      'programador.analista12@ciudadmaderas.com',
      'tester.ti3@ciudadmaderas.com',
      // Algun correo de especialista
    ];

    if (datosUser === null) {
      organizador = 'programador.analista12@ciudadmaderas.com'; // Algun correo de especialista
      correosNotificar = [
        organizador, // datosUser.correo Sustituir correo de analista
        'programador.analista36@ciudadmaderas.com',
        'programador.analista34@ciudadmaderas.com',
        'programador.analista32@ciudadmaderas.com',
        'tester.ti3@ciudadmaderas.com',
      ];
    }

    const updateGoogleEvent = await updateGoogleCalendarEvent(
      currentEvent.idEventoGoogle,
      startDate.format('YYYY-MM-DDTHH:mm:ss'),
      endDate.format('YYYY-MM-DDTHH:mm:ss'),
      organizador, // datosUser.correo, Sustituir correo de analista
      correosNotificar
    );
    if (!updateGoogleEvent.result) {
      enqueueSnackbar('No se pudo sincronizar el evento con la cuenta de google', {
        variant: 'error',
      });
      return onClose();
    }

    const scheduledAppointment = await consultarCita(agendar.data);
    if (!scheduledAppointment.result) {
      enqueueSnackbar('¡Surgió un error al poder mostrar la previsualización de la cita!', {
        variant: 'error',
      });
      onClose();
      return false;
    }

    if (datosUser.correo) {
      const sentEmail = await sendMail(
        {
          ...scheduledAppointment.data[0],
          oldEventStart: currentEvent.start,
          oldEventEnd: currentEvent.end,
        },
        3,
        correosNotificar,
        datosUser.idUsuario
      );
      if (!sentEmail.result) {
        console.error('No se pudo notificar al usuario');
      }
    }

    enqueueSnackbar(agendar.msg, {
      variant: 'success',
    });
    appointmentMutate();
    onClose();
    return setReschedule(false);
  };

  const rescheduleAppointment = () => {
    handleChange('all', currentEvent);
    setReschedule(true);
  };

  const handleClose = () => {
    setOpen2(false);
    onClose();
  };

  const handleSendEmails = () => {
    setSendEmails(!sendEmails);
    setErrorEmail(false);
    setEmail('');
    setEmails([]);
  };

  const handleEmails = (newEmail) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Verificar si la cadena cumple con la expresión regular
    if (!emailRegex.test(newEmail)) {
      setErrorMessage('Formato de correo erróneo');
      return setErrorEmail(true);
    }

    // Verificar si el nuevo correo ya existe en el arreglo
    if (emails.some((emailObj) => emailObj.toLowerCase() === newEmail.toLowerCase())) {
      setErrorMessage('Correo ya registrado');
      return setErrorEmail(true);
    }

    setEmails([...emails, newEmail]);
    setEmail('');
    setErrorEmail(false);
    return '';
  };

  const sendNotifications = async () => {
    if (emails.length === 0) {
      enqueueSnackbar('Añada un correo electrónico para poder notificar a la persona', {
        variant: 'warning',
      });
      return false;
    }
    setBtnNotificationDisabled(true);

    const startDate = dayjs(currentEvent.start);
    const endDate = startDate.add(1, 'hour');

    // Aqui colocar
    let organizador = 'programador.analista36@ciudadmaderas.com';
    let correosNotificar = [
      organizador, // datosUser.correo Sustituir correo de analista
      // 'programador.analista34@ciudadmaderas.com',
      // 'programador.analista32@ciudadmaderas.com',
      // 'programador.analista12@ciudadmaderas.com',
      // 'tester.ti3@ciudadmaderas.com',
      // algun correo de especialista
      ...emails,
    ];

    if (datosUser.correo === null) {
      organizador = 'programador.analista34@ciudadmaderas.com'; // especialista
      correosNotificar = [
        organizador, // datosUser.correo Sustituir correo de analista
        // 'programador.analista36@ciudadmaderas.com',
        // 'programador.analista34@ciudadmaderas.com',
        // 'programador.analista32@ciudadmaderas.com',
        // 'tester.ti3@ciudadmaderas.com',
        ...emails,
      ];
    }

    const updateGoogleEvent = await updateGoogleCalendarEvent(
      currentEvent.idEventoGoogle,
      startDate.format('YYYY-MM-DDTHH:mm:ss'),
      endDate.format('YYYY-MM-DDTHH:mm:ss'),
      organizador, // datosUser.correo, Sustituir correo de analista.
      correosNotificar
    );
    if (!updateGoogleEvent.result) {
      enqueueSnackbar('No se pudo sincronizar el evento con la cuenta de google', {
        variant: 'error',
      });
      handleClose();
      return false;
    }
    enqueueSnackbar('¡Invitaciones enviadas correctamente!', {
      variant: 'success',
    });
    handleClose();
    setBtnNotificationDisabled(false);
    return true;
  };

  const deleteEmail = (removedEmail) => {
    const newEmails = emails.filter((each) => each !== removedEmail);
    setEmails(newEmails);
  };

  const Items = () => {
    // items de los motivos que se trae el evento
    let items = '';
    if (eventReasons?.length > 0) {
      items = eventReasons.map((er) => (
        <Tooltip title={er.nombre} key={er.idOpcion}>
          <Chip
            label={er.nombre}
            variant="outlined"
            size="small"
            style={{ backgroundColor: '#e0e0e0', borderRadius: '20px' }}
          />
        </Tooltip>
      ));
    } else {
      items = (
        <Tooltip title="Motivos por agregar por especialista">
          <Chip
            label="Motivos por agregar por especialista"
            variant="outlined"
            size="small"
            style={{ backgroundColor: '#e0e0e0', borderRadius: '20px' }}
          />
        </Tooltip>
      );
    }
    return items;
  };

  useEffect(() => {
    if (benefits) {
      setBeneficios(benefits);
    }
  }, [benefits]);

  return (
    <>
      {open2 === false && (
        <FormProvider methods={methods} onSubmit={onSubmit}>
          {currentEvent?.id && (
            <DialogTitle sx={{ p: { xs: 1, md: 2 } }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                useFlexGap
                flexWrap="wrap"
                sx={{ p: { xs: 1, md: 2 } }}
              >
                <Typography variant="h5" sx={{ display: 'flex', alignItems: 'end' }}>
                  {currentEvent?.id ? 'DATOS DE CITA' : 'AGENDAR CITA'}
                </Typography>
                {currentEvent?.id &&
                  (currentEvent?.estatus === 1 || currentEvent?.estatus === 6) && (
                    <Stack sx={{ flexDirection: 'row' }}>
                      {dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss') <
                        dayjs(currentEvent.start)
                          .subtract(3, 'hour')
                          .format('YYYY-MM-DD HH:mm:ss') &&
                        currentEvent?.estatus === 1 && (
                          <Tooltip title="Reagendar cita">
                            <IconButton onClick={() => rescheduleAppointment()}>
                              <Iconify icon="fluent-mdl2:date-time-12" width={22} />
                            </IconButton>
                          </Tooltip>
                        )}
                      <Tooltip title="Cancelar cita">
                        <IconButton onClick={() => setConfirmCancel(true)}>
                          <Iconify icon="solar:trash-bin-trash-bold" width={22} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  )}
              </Stack>
            </DialogTitle>
          )}
          {!reschedule && (
            <>
              <DialogContent
                // sx={{ p: { xs: 1, md: 2 } }}
                sx={
                  !currentEvent?.id && selectedValues.modalidad
                    ? {
                        p: { xs: 1, md: 2 },
                        background: {
                          xs: 'linear-gradient(180deg, #2c3239 54%, white 46%)',
                          md: 'linear-gradient(90deg, #2c3239 50%, white 50%)',
                        },
                      }
                    : { p: { xs: 1, md: 2 } }
                }
                direction="row"
                justifycontent="space-between"
              >
                {currentEvent?.id ? (
                  <>
                    <Stack sx={{ p: { xs: 1, md: 2 } }}>
                      <Typography variant="subtitle1">{selectedDateTittle}</Typography>
                    </Stack>

                    <Stack
                      alignItems="center"
                      sx={{
                        flexDirection: 'row',
                        px: { xs: 1, md: 2 },
                        py: 1,
                        alignItems: 'center',
                      }}
                    >
                      <Stack
                        alignItems="center"
                        sx={{
                          alignItems: 'center',
                          display: 'flex',
                        }}
                      >
                        <Iconify
                          icon="mdi:account-circle"
                          width={30}
                          sx={{ color: 'text.disabled' }}
                        />
                      </Stack>
                      <Stack
                        alignItems="center"
                        sx={{
                          alignItems: 'center',
                          display: 'flex',
                        }}
                      >
                        {currentEvent?.estatus === 1 ? (
                          <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                            Cita en {`${currentEvent?.beneficio} (por asistir)`}
                          </Typography>
                        ) : (
                          ''
                        )}
                        {currentEvent?.estatus === 2 ? (
                          <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                            Cita en {`${currentEvent?.beneficio} (cancelado)`}
                          </Typography>
                        ) : (
                          ''
                        )}
                        {currentEvent?.estatus === 3 ? (
                          <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                            Cita en {`${currentEvent?.beneficio} (penalizado)`}
                          </Typography>
                        ) : (
                          ''
                        )}
                        {currentEvent?.estatus === 4 ? (
                          <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                            Cita en {`${currentEvent?.beneficio} (finalizada)`}
                          </Typography>
                        ) : (
                          ''
                        )}
                        {currentEvent?.estatus === 5 ? (
                          <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                            Cita en {`${currentEvent?.beneficio} (justificado)`}
                          </Typography>
                        ) : (
                          ''
                        )}
                        {currentEvent?.estatus === 6 ? (
                          <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                            Cita en {`${currentEvent?.beneficio} (pendiente de pago)`}
                          </Typography>
                        ) : (
                          ''
                        )}
                        {currentEvent?.estatus === 7 ? (
                          <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                            Cita en {`${currentEvent?.beneficio} (cancelado por especialista)`}
                          </Typography>
                        ) : (
                          ''
                        )}
                        {currentEvent?.estatus === 8 ? (
                          <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                            Cita en {`${currentEvent?.beneficio} (reagendado)`}
                          </Typography>
                        ) : (
                          ''
                        )}
                        {currentEvent?.estatus === 9 ? (
                          <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                            Cita en {`${currentEvent?.beneficio} (cita expirada)`}
                          </Typography>
                        ) : (
                          ''
                        )}
                        {currentEvent?.estatus === 10 ? (
                          <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                            Cita en {`${currentEvent?.beneficio} (proceso de pago)`}
                          </Typography>
                        ) : (
                          ''
                        )}
                      </Stack>
                    </Stack>
                    <Stack
                      alignItems="center"
                      sx={{
                        flexDirection: 'row',
                        px: { xs: 1, md: 2 },
                        py: 1,
                        alignItems: 'center',
                      }}
                    >
                      <Stack
                        alignItems="center"
                        sx={{
                          alignItems: 'center',
                          display: 'flex',
                        }}
                      >
                        <Iconify
                          icon="solar:user-id-broken"
                          width={30}
                          sx={{ color: 'text.disabled' }}
                        />
                      </Stack>
                      <Stack
                        alignItems="center"
                        sx={{
                          alignItems: 'center',
                          display: 'flex',
                        }}
                      >
                        <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                          {currentEvent?.especialista ? currentEvent?.especialista : 'Especialista'}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Stack
                      alignItems="center"
                      sx={{
                        flexDirection: 'row',
                        px: { xs: 1, md: 2 },
                        py: 1,
                        alignItems: 'center',
                      }}
                    >
                      <Stack
                        alignItems="center"
                        sx={{
                          alignItems: 'center',
                          display: 'flex',
                        }}
                      >
                        <Iconify icon="mdi:phone" width={30} sx={{ color: 'text.disabled' }} />
                      </Stack>
                      <Stack
                        alignItems="center"
                        sx={{
                          alignItems: 'center',
                          display: 'flex',
                        }}
                      >
                        <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                          {currentEvent?.telefonoEspecialista
                            ? currentEvent?.telefonoEspecialista
                            : 'n/a'}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Stack
                      alignItems="center"
                      sx={{
                        flexDirection: 'row',
                        px: { xs: 1, md: 2 },
                        py: 1,
                        alignItems: 'center',
                      }}
                    >
                      <Stack
                        alignItems="center"
                        sx={{
                          alignItems: 'center',
                          display: 'flex',
                        }}
                      >
                        <Iconify
                          icon="mdi:calendar-clock"
                          width={30}
                          sx={{ color: 'text.disabled' }}
                        />
                      </Stack>
                      <Stack
                        alignItems="center"
                        sx={{
                          alignItems: 'center',
                          display: 'flex',
                        }}
                      >
                        <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                          {currentEvent?.id
                            ? `${dayjs(currentEvent?.start).format('HH:mm a')} - ${dayjs(
                                currentEvent?.end
                              ).format('HH:mm a')}`
                            : 'Fecha'}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Stack
                      alignItems="center"
                      sx={{
                        flexDirection: 'row',
                        px: { xs: 1, md: 2 },
                        py: 1,
                        alignItems: 'center',
                      }}
                    >
                      {currentEvent?.modalidad === 1 ? (
                        <>
                          <Stack
                            alignItems="center"
                            sx={{
                              alignItems: 'center',
                              display: 'flex',
                            }}
                          >
                            <Iconify icon="mdi:earth" width={30} sx={{ color: 'text.disabled' }} />
                          </Stack>
                          <Stack
                            alignItems="center"
                            sx={{
                              alignItems: 'center',
                              display: 'flex',
                            }}
                          >
                            <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                              {currentEvent?.sede ? currentEvent?.sede : 'Sede desconocida'}
                            </Typography>
                          </Stack>
                        </>
                      ) : (
                        <>
                          <Stack
                            alignItems="center"
                            sx={{
                              alignItems: 'center',
                              display: 'flex',
                            }}
                          >
                            <Iconify icon="mdi:earth" width={30} sx={{ color: 'text.disabled' }} />
                          </Stack>
                          <Stack
                            alignItems="center"
                            sx={{
                              alignItems: 'center',
                              display: 'flex',
                            }}
                          >
                            <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                              {currentEvent?.sede ? `${currentEvent?.sede} (En línea)` : 'En línea'}
                            </Typography>
                          </Stack>
                        </>
                      )}
                    </Stack>
                    <Stack
                      alignItems="center"
                      sx={{
                        flexDirection: 'row',
                        px: { xs: 1, md: 2 },
                        py: 1,
                        alignItems: 'center',
                      }}
                    >
                      {currentEvent?.modalidad === 1 ? (
                        <>
                          <Stack
                            alignItems="center"
                            sx={{
                              alignItems: 'center',
                              display: 'flex',
                            }}
                          >
                            <Iconify
                              icon="ic:outline-place"
                              width={30}
                              sx={{ color: 'text.disabled' }}
                            />
                          </Stack>
                          <Stack
                            alignItems="center"
                            sx={{
                              alignItems: 'center',
                              display: 'flex',
                            }}
                          >
                            <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                              {currentEvent?.ubicación
                                ? currentEvent?.ubicación
                                : 'Ubicación desconocida'}
                            </Typography>
                          </Stack>
                        </>
                      ) : (
                        <>
                          <Stack
                            alignItems="center"
                            sx={{
                              alignItems: 'center',
                              display: 'flex',
                            }}
                          >
                            <Stack
                              alignItems="center"
                              sx={{
                                alignItems: 'center',
                                display: 'flex',
                              }}
                            >
                              <Iconify
                                icon="ic:outline-place"
                                width={30}
                                sx={{ color: 'text.disabled' }}
                              />
                            </Stack>
                          </Stack>
                          <Stack
                            alignItems="center"
                            sx={{
                              alignItems: 'center',
                              display: 'flex',
                            }}
                          >
                            <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                              {currentEvent?.ubicación
                                ? currentEvent?.ubicación
                                : 'Remoto (En línea)'}
                            </Typography>
                          </Stack>
                        </>
                      )}
                    </Stack>
                    <Stack
                      sx={{
                        flexDirection: 'row',
                        px: { xs: 1, md: 2 },
                        py: 1,
                        alignItems: 'center',
                      }}
                    >
                      <Stack
                        alignItems="center"
                        sx={{
                          alignItems: 'center',
                          display: 'flex',
                        }}
                      >
                        <Iconify
                          icon="ic:outline-email"
                          width={30}
                          sx={{ color: 'text.disabled' }}
                        />
                      </Stack>

                      <Stack
                        alignItems="center"
                        sx={{
                          alignItems: 'center',
                          display: 'flex',
                        }}
                      >
                        <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                          {currentEvent?.correoEspecialista
                            ? currentEvent?.correoEspecialista.toLowerCase()
                            : 'correo-demo@ciudadmaderas.com.mx'}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Stack
                      sx={{
                        flexDirection: 'row',
                        px: { xs: 1, md: 2 },
                        py: 1,
                        alignItems: 'center',
                      }}
                    >
                      <Stack
                        alignItems="center"
                        sx={{
                          alignItems: 'center',
                          display: 'flex',
                        }}
                      >
                        <Iconify
                          icon="fa-solid:money-bill"
                          width={30}
                          sx={{ color: 'text.disabled' }}
                        />
                      </Stack>
                      <Stack
                        alignItems="center"
                        sx={{
                          alignItems: 'center',
                          display: 'flex',
                        }}
                      >
                        <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                          {currentEvent?.idDetalle === null || currentEvent?.idDetalle === 0 ? (
                            'Sin pago'
                          ) : (
                            <>
                              {currentEvent?.estatusPago === 1 || currentEvent?.estatusPago === 3
                                ? 'Pago aprobado'
                                : 'Pago declinado'}
                            </>
                          )}
                        </Typography>
                      </Stack>
                    </Stack>
                    {currentEvent?.fechasFolio && (
                      <Stack
                        flexDirection="row"
                        flexWrap="wrap"
                        flex={1}
                        spacing={2}
                        sx={{ px: { xs: 1, md: 2 }, py: 1 }}
                      >
                        <Stack
                          alignItems="center"
                          sx={{
                            alignItems: 'center',
                            display: 'flex',
                          }}
                        >
                          <Iconify
                            icon="mdi:clock-remove-outline"
                            width={30}
                            sx={{ color: 'text.disabled' }}
                          />
                        </Stack>
                        <Stack
                          alignItems="center"
                          sx={{
                            alignItems: 'center',
                            display: 'flex',
                          }}
                        >
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
                        </Stack>
                      </Stack>
                    )}
                    {currentEvent?.estatus === 4 ? (
                      <Stack spacing={1} sx={{ px: { xs: 1, md: 2 }, py: 1 }}>
                        <Stack direction="row" sx={{ alignItems: 'center' }}>
                          <Iconify
                            icon="solar:chat-round-line-outline"
                            width={30}
                            sx={{ color: 'text.disabled' }}
                          />
                          <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                            Motivos
                          </Typography>
                        </Stack>
                        <Stack
                          flexDirection="row"
                          flexWrap="wrap"
                          flex={1}
                          spacing={2}
                          sx={{ px: { xs: 1, md: 3 }, py: 1 }}
                        >
                          <Items />
                        </Stack>
                      </Stack>
                    ) : (
                      ''
                    )}
                    {currentEvent?.estatus === 1 ? (
                      <>
                        <Stack
                          sx={{
                            flexDirection: 'row',
                            px: { xs: 1, md: 2 },
                            py: 1,
                            alignItems: 'center',
                          }}
                          spacing={2}
                        >
                          <Typography variant="subtitle1" sx={{ py: { xs: 1, md: 1 } }}>
                            Notificar a externos
                          </Typography>
                          <Stack
                            onClick={() => handleSendEmails()}
                            sx={{
                              cursor: 'pointer', // Hace que aparezca la manita al pasar el ratón
                            }}
                          >
                            {!sendEmails ? (
                              <Iconify
                                icon="icons8:plus"
                                width={24}
                                sx={{ color: 'text.disabled' }}
                              />
                            ) : (
                              <Iconify
                                icon="icons8:minus"
                                width={24}
                                sx={{ color: 'text.disabled' }}
                              />
                            )}
                          </Stack>
                        </Stack>

                        {sendEmails === true && (
                          <>
                            <Stack
                              sx={{
                                px: { xs: 1, md: 2 },
                                pt: 1,
                                alignItems: 'start',
                              }}
                            >
                              <TextField
                                fullWidth
                                id="input-with-icon-textfield"
                                label="Correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                error={errorEmail}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <Button
                                        variant="contained"
                                        size="small"
                                        sx={{ backgroundColor: 'text.disabled' }}
                                        onClick={() => handleEmails(email)}
                                      >
                                        Invitar
                                      </Button>
                                    </InputAdornment>
                                  ),
                                }}
                              />
                              {errorEmail && (
                                <FormHelperText error={errorEmail}>{errorMessage}</FormHelperText>
                              )}
                            </Stack>

                            <Stack
                              flexDirection="row"
                              flexWrap="wrap"
                              flex={1}
                              spacing={2}
                              sx={{ px: { xs: 1, md: 3 }, py: 1 }}
                            >
                              {emails.length > 0 &&
                                emails.map((each) => (
                                  <Tooltip title={each} key={each}>
                                    <Chip
                                      label={each}
                                      variant="outlined"
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
                                            width: '24px',
                                            height: '24px',
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
                                      onDelete={() => deleteEmail(each)}
                                    />
                                  </Tooltip>
                                ))}
                            </Stack>
                          </>
                        )}
                      </>
                    ) : (
                      ''
                    )}
                  </>
                ) : (
                  <AppointmentSchedule
                    selectedValues={selectedValues}
                    handleChange={handleChange}
                    beneficios={beneficios}
                    errorBeneficio={errorBeneficio}
                    especialistas={especialistas}
                    errorEspecialista={errorEspecialista}
                    modalidades={modalidades}
                    errorModalidad={errorModalidad}
                    oficina={oficina}
                    isLoading={isLoading}
                    handleDateChange={handleDateChange}
                    shouldDisableDate={shouldDisableDate}
                    horariosDisponibles={horariosDisponibles}
                    horarioSeleccionado={horarioSeleccionado}
                    errorHorarioSeleccionado={errorHorarioSeleccionado}
                    btnDisabled={btnDisabled}
                    handleHorarioSeleccionado={handleHorarioSeleccionado}
                  />
                )}
              </DialogContent>
              <DialogActions
                sx={
                  !currentEvent?.id && selectedValues.modalidad
                    ? {
                        background: {
                          xs: 'white',
                          md: 'linear-gradient(90deg, #2c3239 50%, white 50%)',
                        },
                      }
                    : {}
                }
              >
                <Button variant="contained" color="error" onClick={onClose}>
                  Cerrar
                </Button>
                {currentEvent?.id && currentEvent?.estatus === 6 && (
                  <LoadingButton
                    variant="contained"
                    color="success"
                    disabled={currentEvent?.estatus !== 6}
                    loading={btnPayDisabled}
                    onClick={pagarCitaPendiente}
                  >
                    Pagar
                  </LoadingButton>
                )}
                {currentEvent?.id && currentEvent?.estatus === 1 && (
                  <LoadingButton
                    variant="contained"
                    color="success"
                    onClick={() => sendNotifications()}
                    loading={btnNotificationDisabled}
                  >
                    Notificar
                  </LoadingButton>
                )}
                {!currentEvent?.id && (
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    color="success"
                    loading={btnDisabled}
                  >
                    Agendar
                  </LoadingButton>
                )}
                {currentEvent?.estatus === 4 && currentEvent?.evaluacion === null && (
                  <LoadingButton
                    onClick={onEvaluate}
                    variant="contained"
                    color="success"
                    loading={btnEvaluateDisabled}
                  >
                    Evaluar
                  </LoadingButton>
                )}
              </DialogActions>
            </>
          )}
        </FormProvider>
      )}

      {/* REAGENDAR CITA */}
      <Dialog
        fullWidth
        maxWidth="md"
        open={reschedule}
        aria-labelledby="alert-dialog-title1"
        aria-describedby="alert-dialog-description1"
      >
        <DialogContent
          sx={
            // !currentEvent?.id && selectedValues.modalidad ?
            {
              p: { xs: 1, md: 2 },
              background: {
                xs: 'linear-gradient(180deg, #2c3239 54%, white 46%)',
                md: 'linear-gradient(90deg, #2c3239 50%, white 50%)',
              },
              position: 'relative',
              display: { xs: 'inline-table' },
            }
            //  : { p: { xs: 1, md: 2 } }
          }
          direction="row"
          justifycontent="space-between"
        >
          <AppointmentSchedule
            selectedValues={selectedValues}
            handleChange={handleChange}
            beneficios={beneficios}
            errorBeneficio={errorBeneficio}
            especialistas={especialistas}
            errorEspecialista={errorEspecialista}
            modalidades={modalidades}
            errorModalidad={errorModalidad}
            oficina={oficina}
            isLoading={isLoading}
            handleDateChange={handleDateChange}
            shouldDisableDate={shouldDisableDate}
            horariosDisponibles={horariosDisponibles}
            horarioSeleccionado={horarioSeleccionado}
            errorHorarioSeleccionado={errorHorarioSeleccionado}
            currentEvent={currentEvent}
            handleHorarioSeleccionado={handleHorarioSeleccionado}
          />
        </DialogContent>
        <DialogActions
          sx={
            // !currentEvent?.id && selectedValues.modalidad ?
            {
              background: {
                xs: 'white',
                md: 'linear-gradient(90deg, #2c3239 50%, white 50%)',
              },
            }
            //    : {}
          }
        >
          <Button variant="contained" color="error" onClick={() => setReschedule(false)}>
            Cerrar
          </Button>
          {currentEvent?.id && (
            <LoadingButton
              variant="contained"
              color="success"
              onClick={handleReSchedule}
              loading={btnDisabled}
            >
              Reagendar
            </LoadingButton>
          )}
        </DialogActions>
      </Dialog>

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

      <CalendarPreview event={event} open={open2} handleClose={handleClose} />
      {pendiente && openEvaluateDialog && (
        <EvaluateDialog
          open={openEvaluateDialog}
          pendiente={pendiente}
          mutate={() => {
            setOpenEvaluateDialog(false);
            appointmentMutate();
            onClose();
          }}
          cerrar={() => setOpenEvaluateDialog(false)}
        />
      )}
    </>
  );
}

CalendarDialog.propTypes = {
  currentEvent: PropTypes.object,
  onClose: PropTypes.func,
  selectedDate: PropTypes.instanceOf(Date),
  appointmentMutate: PropTypes.func,
};
