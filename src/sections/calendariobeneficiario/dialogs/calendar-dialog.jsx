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

import { Grid } from '@mui/material';
import Chip from '@mui/material/Chip';
import Stack from '@mui/system/Stack';
import Timeline from '@mui/lab/Timeline';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TimelineDot from '@mui/lab/TimelineDot';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import TimelineContent from '@mui/lab/TimelineContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';

import { endpoints } from 'src/utils/axios';
import {
  horaTijuana,
  generarFechas,
  finHorarioVerano,
  generarDiasFestivos,
  inicioHorarioVerano,
} from 'src/utils/general';

import { getEncodedHash } from 'src/api/api';
import { useAuthContext } from 'src/auth/hooks';
import { useGetEventReasons } from 'src/api/calendar-specialist';
import { creaEvaluaciones, evaluacionReagenda, evaluacionCancelacion } from 'src/api/evaluacion';
import {
  sendMail,
  crearCita,
  getHorario,
  getSedeEsp,
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
  // getCitasSinEvaluar,
  getBeneficioActivo,
  // getCitasFinalizadas,
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

import '../style.css';
import ConfirmAction from './confirm-action';
import CalendarPreview from './calendar-preview';
import ReescheduleDialog from './reeschedule-dialog';
import AppointmentSchedule from '../appointment-schedule';
import ConfirmDoblePayment from './confirm-doble-payment';

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
  // const [btnEvaluateDisabled, setBtnEvaluateDisabled] = useState(false);
  const [btnConfirmAction, setBtnConfirmAction] = useState(false);
  // const [openEvaluateDialog, setOpenEvaluateDialog] = useState(false);
  // const [pendiente, setPendiente] = useState({});
  const [sedesAtencionEspecialista, setSedesAtencionEspecialista] = useState({});
  const [diasPresenciales, setDiasPresenciales] = useState([]);
  const [aceptar, setAceptar] = useState(false);
  const [confirmDoblePago, setConfirmDoblePago] = useState(false);
  const [citaPayment, setCitaPayment] = useState([]);

  const [btnNotificationDisabled, setBtnNotificationDisabled] = useState(false);
  const [email, setEmail] = useState('');
  const [emails, setEmails] = useState([]);
  const [errorMessage, setErrorMessage] = useState('Formato de correo erróneo');
  const [errorEmail, setErrorEmail] = useState(false);
  const [sendEmails, setSendEmails] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const theme = useTheme();

  const onAceptar = () => {
    if (aceptar) setAceptar(false);
    else setAceptar(true);
  };

  const [beneficioActivo, setBeneficioActivo] = useState({
    beneficio: '',
    primeraCita: '',
  });

  const { user: datosUser } = useAuthContext();

  const { data: benefits } = useGetBenefits(datosUser?.idSede, datosUser?.idArea);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEspecialidad, setIsLoadingEspecialidad] = useState(false);
  const [isLoadingModalidad, setIsLoadingModalidad] = useState(false);

  const [beneficioDisabled, setBeneficioDisabled] = useState(false);
  const [especialistaDisabled, setEspecialistaDisabled] = useState(false);
  const [modalidadDisabled, setModalidadDisabled] = useState(false);
  const [horariosDisabled, setHorariosDisabled] = useState(false);
  const [cerrarDisabled, setCerrarDisabled] = useState(false);
  const [calendarDisabled, setCalendarDisabled] = useState(false);

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
    setBeneficioDisabled(true);
    setEspecialistaDisabled(true);
    setModalidadDisabled(true);
    setHorariosDisabled(true);
    setCalendarDisabled(true);
    setCerrarDisabled(true);
    setBtnDisabled(true);

    const ahora = new Date();
    const añoDate = ahora.getFullYear();
    const horasARestar =
      ahora >= inicioHorarioVerano(añoDate) && ahora <= finHorarioVerano(añoDate) ? 1 : 2;
    ahora.setHours(ahora.getHours() - horasARestar);

    // const año = horarioSeleccionado.substring(0, 4);
    // const mes = horarioSeleccionado.substring(5, 7);

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
    // const citasSinEvaluar = await getCitasSinEvaluar(datosUser.idUsuario);
    // Si tiene citas en proceso no lo tengo que dejar agendar citas
    /* if (citasSinEvaluar.result) {
      enqueueSnackbar('Evalúa tus citas previas para poder agendar otra cita', {
        variant: 'danger',
      });
      onClose();
      return false;
    } */

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
    // const citasFinalizadas = await getCitasFinalizadas(datosUser.idUsuario, mes, año);
    // if (citasFinalizadas.result === true && citasFinalizadas?.data.length >= 2) {
    //   enqueueSnackbar(
    //     'Ya cuentas con la cantidad máxima de beneficios brindados en el mes seleccionado',
    //     { variant: 'error' }
    //   );
    //   onClose();
    //   return false;
    // }

    // *** VERIFICAMOS QUE EXISTA LA ATENCIÓN A SU SEDE O AREA ***
    const idAtencionPorSede = await getAtencionXSede(
      selectedValues.especialista,
      datosUser.idSede,
      datosUser.idArea,
      selectedValues.modalidad
    );
    if (!idAtencionPorSede.result) {
      enqueueSnackbar('¡Surgió un error al consultar los beneficios brindados en tu sede!', {
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
    let organizador = datosUser.correo;
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
    let precio = 50.0;
    if (datosUser.tipoPuesto.toLowerCase() === 'operativa') precio = 0.0;

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

    enqueueSnackbar('¡Se ha agendado tu cita con éxito!', {
      variant: 'success',
    });
    appointmentMutate();

    mutate(endpoints.reportes.citas);
    mutate(endpoints.dashboard.getCtDisponibles);
    mutate(endpoints.reportes.pacientes);
    mutate(endpoints.dashboard.getCountModalidades);
    mutate(endpoints.citas.getCitas);
    mutate(endpoints.dashboard.getCountModalidades);
    mutate(endpoints.dashboard.getCountEstatusCitas);
    setCerrarDisabled(false);

    /* *** PROCESO DE MUESTRA DE PREVIEW *** */
    const scheduledAppointment = await consultarCita(agendar.data, datosUser.idSede);
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

    await evaluacionCancelacion(currentEvent.id);

    enqueueSnackbar('¡Has cancelado la cita!', {
      variant: 'success',
    });

    mutate(endpoints.encuestas.evaluacionEncuesta);
    mutate(endpoints.reportes.citas);
    mutate(endpoints.dashboard.getCountEstatusCitas);
    mutate(endpoints.dashboard.getCtCanceladas);

    const organizador = datosUser.correo; /* 'programador.analista36@ciudadmaderas.com'; */
    const correosNotificar = [
      organizador,
      /* 'programador.analista34@ciudadmaderas.com',
      'programador.analista32@ciudadmaderas.com',
      'programador.analista12@ciudadmaderas.com',
      'tester.ti3@ciudadmaderas.com', */
      currentEvent.correoEspecialista,
    ];

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

  const pagarCitaPendiente = async (cita) => {
    setBtnPayDisabled(true);
    /* VALIDAR SI ES GRATUITA LA CITA */
    let precio = 50;
    if (datosUser.tipoPuesto.toLowerCase() === 'operativa') precio = 0.0;

    let nombreBeneficio = '';
    let abreviatura = '';
    switch (cita.idPuesto) {
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
      PROCESAND_PAGO: 10,
    });

    const DATOS_CITA = Object.freeze({
      TITULO: `Cita ${nombreBeneficio} - ${datosUser.nombre}`,
      ID_ESPECIALISTA: cita.idEspecialista,
      ID_USUARIO: datosUser.idUsuario,
    });

    const DATOS_PAGO = Object.freeze({
      FOLIO: `${DATOS_CITA.ID_USUARIO}${dayjs(new Date()).format('HHmmssYYYYMMDD')}`,
      REFERENCIA: `U${DATOS_CITA.ID_USUARIO}-${abreviatura}-E${DATOS_CITA.ID_ESPECIALISTA}-C${cita.id}`,
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
          cita.id,
          ESTATUS_CITA.PENDIENTE_PAGO
        );
        if (!update) console.error('La cita no se pudo actualizar para realizar el pago');
      }
      if (resultadoPago && cita.fechaIntentoPago == null) {
        if (cita.fechaIntentoPago == null) {
          await actualizarFechaIntentoPago(DATOS_CITA.ID_USUARIO, cita.id);
        } else {
          const update = await updateStatusAppointment(
            DATOS_CITA.ID_USUARIO,
            cita.id,
            ESTATUS_CITA.PROCESAND_PAGO
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
        cita.id
      );

      enqueueSnackbar('¡El pago de cita se ha realizado con exito!', {
        variant: 'success',
      });
    }

    setBtnPayDisabled(false);
    appointmentMutate();
  };

  // const onEvaluate = async () => {
  //   setBtnEvaluateDisabled(true);
  //   setPendiente(currentEvent);
  //   setOpenEvaluateDialog(true);
  //   return true;
  // };

  const handleChange = async (input, value) => {
    setBtnDisabled(false);
    setOficina({});
    setHorarioSeleccionado('');
    setErrorHorarioSeleccionado(false);
    setHorariosDisponibles([]);
    setSelectedDay(null);

    if (input === 'beneficio') {
      setErrorBeneficio(false); // Por si tiene error lo limpia
      setIsLoadingEspecialidad(true); // Marcamos que recibimos input
      setEspecialistas([]);
      setModalidades([]);
      setSelectedValues({
        beneficio: value,
        especialista: '',
        modalidad: '',
      });

      const especialistasRS = await getSpecialists(datosUser.idSede, datosUser.idArea, value);
      if (!especialistasRS?.data) {
        enqueueSnackbar('¡No hay especialistas atendiendo tu sede/área!', { variant: 'error' });
        setEspecialistas([]);
      } else {
        setEspecialistas(especialistasRS?.data);
      }
      // HACER PROCESO DE DETALLE PACIENTE
      const datosUltimaCita = await lastAppointment(datosUser.idUsuario, value);
      if (datosUltimaCita.result) {
        const data = await getOficinaByAtencion(
          datosUser.idSede,
          value,
          datosUltimaCita.data[0].idEspecialista,
          datosUltimaCita.data[0].tipoCita
        );
        setOficina(data); // Asignamos la oficina donde va a ser.
        // Traemos los horarios disponibles para citas
        getHorariosDisponibles(value, datosUltimaCita.data[0].idEspecialista);
        /* ************************************* */
        // Traemos cuantas sedes tiene el especialista
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
        // Asignamos valores a los inputs
        setSelectedValues({
          beneficio: value,
          especialista: datosUltimaCita.data[0].idEspecialista,
          modalidad: datosUltimaCita.data[0].tipoCita,
        }); // Asignamos valores
      }
    } else if (input === 'especialista') {
      setIsLoadingModalidad(true);
      setModalidades([]);
      setSelectedValues({
        ...selectedValues,
        especialista: value,
        modalidad: '',
      });
      /* ************************************* */
      const sedesEspecialista = await getSedesPresenciales(value);
      setSedesAtencionEspecialista(sedesEspecialista.result ? sedesEspecialista.data : []);
      const diasDisponibles = await getDiasDisponibles(value, datosUser.idSede);
      setDiasPresenciales(diasDisponibles.result ? diasDisponibles.data : []);
      /* ************************************* */
      setErrorEspecialista(false);
      const modalitiesData = await getModalities(datosUser.idSede, value, datosUser.idArea); // Modalidades input

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
      }
      setModalidades(modalitiesData?.data);
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

      /* ************************************* */
      const sedesEspecialista = await getSedesPresenciales(value.idEspecialista);
      setSedesAtencionEspecialista(sedesEspecialista.result ? sedesEspecialista.data : []);
      const diasDisponibles = await getDiasDisponibles(value.idEspecialista, datosUser.idSede);
      setDiasPresenciales(diasDisponibles.result ? diasDisponibles.data : []);
      /* ************************************* */
      setSelectedDay(null);
    }
    setIsLoadingEspecialidad(false);
    setIsLoadingModalidad(false);
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
    const sedeEsp = await getSedeEsp(especialista);

    // Consultamos el horario del especialista segun su beneficio.
    const horarioACubrir = await getHorario(
      beneficio,
      especialista,
      datosUser.idSede,
      sedeEsp.data[0].idsede
    );

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

    // Retiramos los registros de las 3 proximas horas para que no las muestre.
    const ahora = new Date();
    const ahoraMasTresHoras = new Date(ahora.getTime() + 3 * 60 * 60 * 1000);

    const fechaActual = ahora.toISOString().split('T')[0]; // Formato 'YYYY-MM-DD'
    const horaLimite = ahoraMasTresHoras.toTimeString().split(' ')[0]; // Formato 'HH:MM:SS'

    const registrosCadaHoraConMargen = registrosCadaHora.filter((registro) => {
      if (registro.fecha === fechaActual) {
        return !(registro.inicio <= horaLimite);
      }
      return true;
    });

    // Resultado final de los horarios de todos los dias para agendar
    setFechasDisponibles(registrosCadaHoraConMargen);

    // ////////////////////////////////////////////////////////////////////////////////////////
    // Este proceso solo es para quitar en el calendario visualmente los dias que no están ///
    // ///////////////////////////////////////////////////////////////////////////////////////
    const diasDisponibles = obtenerSoloFechas(registrosCadaHoraConMargen);
    setDiasHabilitados(diasDisponibles);

    const diasOcupadosFiltro = filtradoDias(todosLosDiasSiguientes, diasDisponibles);

    const year = initialValue.year();

    const diasFestivos = beneficio === 158 ? [] : generarDiasFestivos(year);

    const diasADeshabilitar = new Set([...diasOcupadosFiltro, ...diasFestivos]);

    const activo = await getBeneficioActivo(datosUser?.idUsuario);

    switch (beneficio) {
      case 537:
        setBeneficioActivo({ beneficio, primeraCita: activo[0].estatusNut });
        break;

      case 585:
        setBeneficioActivo({ beneficio, primeraCita: activo[0].estatusPsi });
        break;

      case 686:
        setBeneficioActivo({ beneficio, primeraCita: activo[0].estatusGE });
        break;

      case 158:
        setBeneficioActivo({ beneficio, primeraCita: activo[0].estatusQB });
        break;

      default:
        enqueueSnackbar('Error en terminos y condiciones', { variant: 'error' });
        break;
    }

    setDiasOcupados([...diasADeshabilitar]);
    setIsLoading(false);
  };

  const handleHorarioSeleccionado = (val) => {
    setBtnDisabled(false);
    setHorarioSeleccionado(val);
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

  const handleDateChange = (newDate) => {
    setErrorHorarioSeleccionado(false);
    setBtnDisabled(false);
    setSelectedDay(newDate);

    // Bloque para obtener las horas del dia actual mas una cant de horas para validar registros del mismo dia actual.
    // 3 HORAS DE MARGEN PARA NO PENALIZARLOS.
    let ahora = new Date();
    if (datosUser.idSede === 11) {
      ahora = horaTijuana(ahora);
    }

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

  const shouldDisableDate = (date) => {
    // Verificar si la fecha es un fin de semana

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

  const handleReSchedule = async () => {
    // Validaciones de inputs: Coloca leyenda de error debajo de cada input en caso que le falte cumplir con el valor
    if (selectedValues.beneficio === '') return setErrorBeneficio(true);
    if (selectedValues.especialista === '') return setErrorEspecialista(true);
    if (selectedValues.modalidad === '') return setErrorModalidad(true);
    if (horarioSeleccionado === '') return setErrorHorarioSeleccionado(true);
    setBeneficioDisabled(true);
    setEspecialistaDisabled(true);
    setModalidadDisabled(true);
    setHorariosDisabled(true);
    setCalendarDisabled(true);
    setCerrarDisabled(true);
    setBtnDisabled(true);

    const ahora = new Date();
    const añoDate = ahora.getFullYear();
    const horasARestar =
      ahora >= inicioHorarioVerano(añoDate) && ahora <= finHorarioVerano(añoDate) ? 1 : 2;
    ahora.setHours(ahora.getHours() - horasARestar);

    // const año = horarioSeleccionado.substring(0, 4);
    // const mes = horarioSeleccionado.substring(5, 7);
    // const dia = horarioSeleccionado.substring(8, 10);

    const checkInvoiceDetail = await checkInvoice(currentEvent.idDetalle);

    if (!checkInvoiceDetail.result) {
      enqueueSnackbar('¡No puedes reagendar más veces esta cita!', {
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

    // SE COMENTARON LAS VALIDACIONES DEBIDO A QUE ESTAS REGLAS YA NO VAN A APLICAR
    // const citasSinFinalizar = await getCitasSinFinalizar(
    //   datosUser.idUsuario,
    //   selectedValues.beneficio
    // );

    // // Si tiene citas en proceso no lo tengo que dejar agendar citas
    // if (citasSinFinalizar.result) {
    //   enqueueSnackbar('Ya tienes una cita en proceso de este beneficio', {
    //     variant: 'error',
    //   });
    //   return onClose();
    // }

    // const citasFinalizadas = await getCitasFinalizadas(datosUser.idUsuario, mes, año);

    // if (citasFinalizadas.result === true && citasFinalizadas?.data.length >= 3) {
    //   enqueueSnackbar(
    //     'Ya cuentas con la cantidad máxima de beneficios brindados en el mes seleccionado',
    //     {
    //       variant: 'error',
    //     }
    //   );
    //   return onClose();
    // }

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

    /* if (!agendar.result) {
      return enqueueSnackbar(agendar.msg, {
        variant: 'error',getCitasSinEvaluarUsuario
      });
    } */

    await creaEvaluaciones(agendar.data);
    await evaluacionReagenda(agendar.data);

    const startDate = dayjs(horarioSeleccionado);
    const endDate = startDate.add(1, 'hour');

    const organizador = datosUser.correo; /* 'programador.analista36@ciudadmaderas.com'; */
    const correosNotificar = [organizador, currentEvent.correoEspecialista];

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
    onClose();
    mutate(endpoints.encuestas.evaluacionEncuesta);
    appointmentMutate();
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
    /* let organizador = 'programador.analista36@ciudadmaderas.com';
    let correosNotificar = [
      organizador, // datosUser.correo Sustituir correo de analista
      // 'programador.analista34@ciudadmaderas.com',
      // 'programador.analista32@ciudadmaderas.com',
      // 'programador.analista12@ciudadmaderas.com',
      // 'tester.ti3@ciudadmaderas.com',
      // algun correo de especialista
      ...emails,
    ]; */

    const organizador = datosUser.correo; /* 'programador.analista36@ciudadmaderas.com'; */
    const correosNotificar = [organizador, ...emails, currentEvent.correoEspecialista];

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
        <Tooltip title="Motivos por agregar por especialista">
          <Typography
            variant="body2"
            sx={{
              color: 'text.disabled',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
            }}
            mb={3}
          >
            Motivos por agregar por especialista
          </Typography>
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
            <DialogTitle sx={{ p: { xs: 1, md: 1 } }}>
              <Stack spacing={1} sx={{ p: { xs: 1, md: 2 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h5">
                    {currentEvent?.id ? 'DATOS DE CITA' : 'AGENDAR CITA'}
                  </Typography>
                  {currentEvent?.id &&
                    (currentEvent?.estatus === 1 || currentEvent?.estatus === 6) && (
                      <Stack direction="row" spacing={1}>
                        {dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss') <
                          dayjs(currentEvent.start)
                            .subtract(3, 'hour')
                            .format('YYYY-MM-DD HH:mm:ss') &&
                          currentEvent?.estatus === 1 && (
                            <Tooltip title="Reagendar cita">
                              <IconButton
                                className="buttonActions"
                                onClick={() => rescheduleAppointment()}
                              >
                                <Iconify icon="fluent-mdl2:date-time-12" className="bell" />
                              </IconButton>
                            </Tooltip>
                          )}
                        <Tooltip title="Cancelar cita">
                          <IconButton
                            className="buttonActions"
                            onClick={() => setConfirmCancel(true)}
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" className="bell" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    )}
                </Stack>
                <Typography variant="subtitle1">{selectedDateTittle}</Typography>
              </Stack>
            </DialogTitle>
          )}
          {!reschedule && (
            <>
              <DialogContent
                // sx={{ p: { xs: 1, md: 2 } }}
                style={{
                  maxHeight: currentEvent?.id ? '400px' : 'fit-content',
                  overflowY: currentEvent?.id ? 'auto' : 'hidden',
                }}
                sx={
                  !currentEvent?.id && selectedValues.modalidad
                    ? {
                        p: { xs: 1, md: 2 },
                        background: {
                          xs: 'linear-gradient(180deg, #2c3239 54%, white 46%)',
                          md: 'linear-gradient(90deg, #2c3239 50%, white 50%)',
                        },
                        backgroundColor: theme.palette.mode === 'dark' ? '#25303d' : '#f6f7f8',
                      }
                    : {
                        p: { xs: 1, md: 2 },
                        backgroundColor: theme.palette.mode === 'dark' ? '#25303d' : '#f6f7f8',
                      }
                }
                direction="row"
                justifycontent="space-between"
              >
                {currentEvent?.id ? (
                  <>
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
                                  <Iconify
                                    icon="fluent:form-28-filled"
                                    width={30}
                                    sx={{ color: '#5551dd' }}
                                  />
                                </TimelineDot>
                                <TimelineConnector />
                              </TimelineSeparator>

                              <TimelineContent>
                                <Typography variant="subtitle1">Cita</Typography>

                                {currentEvent?.estatus === 1 && currentEvent?.tipoCita === 1 ? (
                                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                                    {`${currentEvent?.beneficio} (por asistir - ${currentEvent?.modalidad === 1 ? 'presencial' : 'en línea'} - primera cita)`}
                                  </Typography>
                                ) : (
                                  ''
                                )}
                                {currentEvent?.estatus === 1 && currentEvent?.tipoCita === 2 ? (
                                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                                    {`${currentEvent?.beneficio} (por asistir - ${currentEvent?.modalidad === 1 ? 'presencial' : 'en línea'})`}
                                  </Typography>
                                ) : (
                                  ''
                                )}
                                {currentEvent?.estatus === 1 && currentEvent?.tipoCita === 3 ? (
                                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                                    {`${currentEvent?.beneficio} (por asistir - ${currentEvent?.modalidad === 1 ? 'presencial' : 'en línea'} - agendada por especialista)`}
                                  </Typography>
                                ) : (
                                  ''
                                )}
                                {currentEvent?.estatus === 2 ? (
                                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                                    {`${currentEvent?.beneficio} (cancelado)`}
                                  </Typography>
                                ) : (
                                  ''
                                )}
                                {currentEvent?.estatus === 3 ? (
                                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                                    {`${currentEvent?.beneficio} (penalizado)`}
                                  </Typography>
                                ) : (
                                  ''
                                )}
                                {currentEvent?.estatus === 4 ? (
                                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                                    {`${currentEvent?.beneficio} (finalizada)`}
                                  </Typography>
                                ) : (
                                  ''
                                )}
                                {currentEvent?.estatus === 5 ? (
                                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                                    {`${currentEvent?.beneficio} (justificado)`}
                                  </Typography>
                                ) : (
                                  ''
                                )}
                                {currentEvent?.estatus === 6 ? (
                                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                                    {`${currentEvent?.beneficio} (pendiente de pago)`}
                                  </Typography>
                                ) : (
                                  ''
                                )}
                                {currentEvent?.estatus === 7 ? (
                                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                                    {`${currentEvent?.beneficio} (cancelado por especialista)`}
                                  </Typography>
                                ) : (
                                  ''
                                )}
                                {currentEvent?.estatus === 8 ? (
                                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                                    {`${currentEvent?.beneficio} (reagendado)`}
                                  </Typography>
                                ) : (
                                  ''
                                )}
                                {currentEvent?.estatus === 9 ? (
                                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                                    Cita en {`${currentEvent?.beneficio} (cita expirada)`}
                                  </Typography>
                                ) : (
                                  ''
                                )}
                                {currentEvent?.estatus === 10 ? (
                                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                                    Cita en {`${currentEvent?.beneficio} (proceso de pago)`}
                                  </Typography>
                                ) : (
                                  ''
                                )}
                              </TimelineContent>
                            </TimelineItem>

                            <TimelineItem>
                              <TimelineSeparator>
                                <TimelineDot className="icons">
                                  <Iconify
                                    icon="mdi:account-circle"
                                    width={30}
                                    sx={{ color: '#c9a61d' }}
                                  />
                                </TimelineDot>
                                <TimelineConnector />
                              </TimelineSeparator>

                              <TimelineContent>
                                <Typography variant="subtitle1">Especialista</Typography>

                                <Typography variant="body2" sx={{ color: 'text.disabled' }} mb={3}>
                                  {currentEvent?.especialista
                                    ? currentEvent?.especialista
                                    : 'Especialista'}
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
                                  {currentEvent?.telefonoEspecialista
                                    ? currentEvent?.telefonoEspecialista
                                    : 'n/a'}
                                </Typography>
                              </TimelineContent>
                            </TimelineItem>

                            <TimelineItem>
                              <TimelineSeparator>
                                <TimelineDot className="icons">
                                  <Iconify
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
                                  {currentEvent?.id
                                    ? `${dayjs(currentEvent?.start).format('HH:mm a')} - ${dayjs(
                                        currentEvent?.end
                                      ).format('HH:mm a')}`
                                    : 'Fecha'}
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
                                  {currentEvent?.sede ? currentEvent?.sede : 'Sede desconocida'}
                                </Typography>
                              </TimelineContent>
                            </TimelineItem>

                            <TimelineItem>
                              <TimelineSeparator>
                                <TimelineDot className="icons">
                                  <Iconify
                                    icon="ic:outline-place"
                                    width={30}
                                    sx={{ color: '#084a73' }}
                                  />
                                </TimelineDot>
                                <TimelineConnector />
                              </TimelineSeparator>

                              <TimelineContent>
                                <Typography variant="subtitle1">Ubicación</Typography>

                                <Typography variant="body2" sx={{ color: 'text.disabled' }} mb={3}>
                                  {currentEvent?.ubicación
                                    ? currentEvent?.ubicación
                                    : 'Ubicación desconocida'}
                                </Typography>
                              </TimelineContent>
                            </TimelineItem>

                            <TimelineItem>
                              <TimelineSeparator>
                                <TimelineDot className="icons">
                                  <Iconify
                                    icon="ic:outline-email"
                                    width={30}
                                    sx={{ color: 'gray' }}
                                  />
                                </TimelineDot>
                                <TimelineConnector />
                              </TimelineSeparator>

                              <TimelineContent>
                                <Typography variant="subtitle1">Correo</Typography>

                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: 'text.disabled',
                                    whiteSpace: 'normal',
                                    wordBreak: 'break-word', // Esto permitirá que las palabras largas se dividan y se envuelvan a la siguiente línea
                                  }}
                                  mb={3}
                                >
                                  {currentEvent?.correoEspecialista
                                    ? currentEvent?.correoEspecialista
                                    : 'correo-demo@ciudadmaderas.com.mx'}
                                </Typography>
                              </TimelineContent>
                            </TimelineItem>

                            <TimelineItem>
                              <TimelineSeparator>
                                <TimelineDot className="icons">
                                  <Iconify
                                    icon="fa-solid:money-bill"
                                    width={30}
                                    sx={{ color: '#16d6d7' }}
                                  />
                                </TimelineDot>
                                <TimelineConnector />
                              </TimelineSeparator>

                              <TimelineContent>
                                <Typography variant="subtitle1">Pago</Typography>

                                <Typography variant="body2" sx={{ color: 'text.disabled' }} mb={3}>
                                  {currentEvent?.idDetalle === null ||
                                  currentEvent?.idDetalle === 0 ? (
                                    'Sin pago'
                                  ) : (
                                    <>
                                      {currentEvent?.estatusPago === 1 ||
                                      currentEvent?.estatusPago === 3
                                        ? 'Pago aprobado'
                                        : 'Pago declinado'}
                                    </>
                                  )}
                                </Typography>
                              </TimelineContent>
                            </TimelineItem>
                          </Timeline>
                        </Grid>
                      </Grid>
                    </Grid>

                    {currentEvent?.fechasFolio && (
                      <Timeline
                        sx={{
                          m: 0,
                          p: 2,
                          [`& .${timelineItemClasses.root}:before`]: {
                            flex: 0,
                            padding: 0,
                          },
                        }}
                      >
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
                                variant="body2"
                                style={{ color: 'text.disabled', textDecoration: 'line-through' }}
                              >
                                {fecha}
                              </Typography>,
                            ])}
                          </TimelineContent>
                        </TimelineItem>
                      </Timeline>
                    )}
                    {currentEvent?.estatus === 4 ? (
                      <Timeline
                        sx={{
                          m: 0,
                          p: 2,
                          [`& .${timelineItemClasses.root}:before`]: {
                            flex: 0,
                            padding: 0,
                          },
                        }}
                      >
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
                          <Typography
                            className="notificar"
                            variant="subtitle1"
                            sx={{ py: { xs: 1, md: 1, cursor: 'pointer' } }}
                            onClick={() => handleSendEmails()}
                          >
                            Notificar a externos
                            {!sendEmails ? (
                              <Iconify
                                icon="icons8:plus"
                                width={24}
                                sx={{ color: 'text.disabled' }}
                                className="notificarIcon"
                              />
                            ) : (
                              <Iconify
                                icon="icons8:minus"
                                sx={{ color: 'text.disabled' }}
                                width={24}
                              />
                            )}
                          </Typography>
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
                    isLoadingEspecialidad={isLoadingEspecialidad}
                    isLoadingModalidad={isLoadingModalidad}
                    handleDateChange={handleDateChange}
                    shouldDisableDate={shouldDisableDate}
                    horariosDisponibles={horariosDisponibles}
                    horarioSeleccionado={horarioSeleccionado}
                    errorHorarioSeleccionado={errorHorarioSeleccionado}
                    btnDisabled={btnDisabled}
                    handleHorarioSeleccionado={handleHorarioSeleccionado}
                    beneficioActivo={beneficioActivo}
                    aceptarTerminos={onAceptar}
                    aceptar={aceptar}
                    beneficioDisabled={beneficioDisabled}
                    especialistaDisabled={especialistaDisabled}
                    modalidadDisabled={modalidadDisabled}
                    horariosDisabled={horariosDisabled}
                    calendarDisabled={calendarDisabled}
                    selectedDay={selectedDay}
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
                <Button
                  variant="contained"
                  color="error"
                  onClick={onClose}
                  disabled={cerrarDisabled}
                >
                  Cerrar
                </Button>
                {currentEvent?.id &&
                (currentEvent?.estatus === 6 || currentEvent?.estatus === 10) ? (
                  <LoadingButton
                    variant="contained"
                    color="success"
                    disabled={currentEvent?.estatus !== 6 && currentEvent?.estatus !== 10}
                    loading={btnPayDisabled}
                    onClick={() => handlePayment(currentEvent)}
                  >
                    Pagar
                  </LoadingButton>
                ) : null}
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
                    disabled={
                      (beneficioActivo.primeraCita === 0 || beneficioActivo.primeraCita === null) &&
                      !aceptar
                    }
                    loading={btnDisabled} // para desactivar en caso de que tenga terminos sin aceptar
                  >
                    Agendar
                  </LoadingButton>
                )}
                {/* {currentEvent?.estatus === 4 && currentEvent?.evaluacion === null && (
                  <LoadingButton
                    onClick={onEvaluate}
                    variant="contained"
                    color="success"
                    loading={btnEvaluateDisabled}
                  >
                    Evaluar
                  </LoadingButton>
                )} */}
              </DialogActions>
            </>
          )}
        </FormProvider>
      )}

      {/* REAGENDAR CITA 
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
              p: { xs: 1, md: 1 },
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
            isLoadingEspecialidad={isLoadingEspecialidad}
            isLoadingModalidad={isLoadingModalidad}
            handleDateChange={handleDateChange}
            shouldDisableDate={shouldDisableDate}
            horariosDisponibles={horariosDisponibles}
            horarioSeleccionado={horarioSeleccionado}
            errorHorarioSeleccionado={errorHorarioSeleccionado}
            currentEvent={currentEvent}
            handleHorarioSeleccionado={handleHorarioSeleccionado}
            beneficioActivo={beneficioActivo}
            aceptarTerminos={onAceptar}
            aceptar={aceptar}
            beneficioDisabled={beneficioDisabled}
            especialistaDisabled={especialistaDisabled}
            modalidadDisabled={modalidadDisabled}
            horariosDisabled={horariosDisabled}
            calendarDisabled={calendarDisabled}
            selectedDay={selectedDay}
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
      */}

      <ReescheduleDialog
        open={reschedule}
        onClose={() => setReschedule(false)}
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
        isLoadingEspecialidad={isLoadingEspecialidad}
        isLoadingModalidad={isLoadingModalidad}
        handleDateChange={handleDateChange}
        shouldDisableDate={shouldDisableDate}
        horariosDisponibles={horariosDisponibles}
        horarioSeleccionado={horarioSeleccionado}
        errorHorarioSeleccionado={errorHorarioSeleccionado}
        currentEvent={currentEvent}
        handleHorarioSeleccionado={handleHorarioSeleccionado}
        beneficioActivo={beneficioActivo}
        aceptarTerminos={onAceptar}
        aceptar={aceptar}
        beneficioDisabled={beneficioDisabled}
        especialistaDisabled={especialistaDisabled}
        modalidadDisabled={modalidadDisabled}
        horariosDisabled={horariosDisabled}
        calendarDisabled={calendarDisabled}
        selectedDay={selectedDay}
        handleReSchedule={handleReSchedule}
        btnDisabled={btnDisabled}
      />

      <ConfirmAction
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onCancel={onCancel}
        btnConfirmAction={btnConfirmAction}
      />

      <ConfirmDoblePayment
        open={confirmDoblePago}
        onClose={() => setConfirmDoblePago(false)}
        paymentFunc={() => pagarCitaPendiente(currentEvent)}
        cita={citaPayment}
      />

      <CalendarPreview
        event={event}
        open={open2}
        handleClose={handleClose}
        handlePayment={handlePayment}
      />
    </>
  );
}

CalendarDialog.propTypes = {
  currentEvent: PropTypes.object,
  onClose: PropTypes.func,
  selectedDate: PropTypes.instanceOf(Date),
  appointmentMutate: PropTypes.func,
};
