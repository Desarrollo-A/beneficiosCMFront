import 'dayjs/locale/es';
import dayjs from 'dayjs';
import * as yup from 'yup';
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
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import uuidv4 from 'src/utils/uuidv4';
import { generarFechas } from 'src/utils/general';

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
  lastAppointment,
  checaPrimeraCita,
  getCitasSinPagar,
  getAtencionXSede,
  cancelAppointment,
  updateAppointment,
  getDiasDisponibles,
  getCitasSinEvaluar,
  getCitasFinalizadas,
  updateDetailPacient,
  getHorariosOcupados,
  getSedesPresenciales,
  getCitasSinFinalizar,
  getOficinaByAtencion,
  registrarDetalleDePago,
  insertGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
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
  const [open, setOpen] = useState(false);
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
      enqueueSnackbar('¡Existe un error con la fecha de antigüedad!', {
        variant: 'error',
      });
      onClose();
      return false;
    }

    // Validamos la antiguedad: Mandamos fechaIngreso, fechaDeHoy, isPracticante, idBeneficio.
    const tieneAntiguedad = validarAntiguedad(datosUser.fechaIngreso, fechaActual);

    // 25 Es ventas :)
    if (!tieneAntiguedad && datosUser.idArea !== 25) {
      enqueueSnackbar('¡No cuentas con la antigüedad suficiente para hacer uso del beneficio!', {
        variant: 'error',
      });
      onClose();
      return false;
    }

    // Consultamos su atencionXSede
    const idAtencionPorSede = await getAtencionXSede(
      selectedValues.especialista,
      datosUser.idSede,
      selectedValues.modalidad
    );
    if (!idAtencionPorSede.result) {
      enqueueSnackbar(
        '¡Surgió un error al intentar conocer los beneficios brindados para su sede!',
        {
          variant: 'error',
        }
      );
      onClose();
      return false;
    }

    // Revisamos si tiene citas sin estatus de finalizar
    const citasSinFinalizar = await getCitasSinFinalizar(
      datosUser.idUsuario,
      selectedValues.beneficio
    );

    // Si tiene citas en proceso no lo tengo que dejar agendar citas
    if (citasSinFinalizar.result) {
      enqueueSnackbar('Ya tienes una cita en proceso de este beneficio', {
        variant: 'error',
      });
      onClose();
      return false;
    }

    // Si tiene citas sin evaluar no lo deja agendar
    const citasSinEvaluar = await getCitasSinEvaluar(datosUser.idUsuario);
    // Si tiene citas en proceso no lo tengo que dejar agendar citas
    if (citasSinEvaluar.result) {
      enqueueSnackbar('Evalúa tus citas previas para poder agendar otra cita', {
        variant: 'error',
      });
      onClose();
      return false;
    }

    // Si tiene citas sin pagar no lo deja agendar
    const citasSinPagar = await getCitasSinPagar(datosUser.idUsuario);
    // Si tiene citas en proceso no lo tengo que dejar agendar citas
    if (citasSinPagar.result) {
      enqueueSnackbar('Realiza el pago de tus citas por asistir para poder agendar otra cita', {
        variant: 'error',
      });
      onClose();
      return false;
    }

    const citasFinalizadas = await getCitasFinalizadas(datosUser.idUsuario, mes, año);

    if (citasFinalizadas.result === true && citasFinalizadas?.data.length >= 2) {
      enqueueSnackbar(
        'Ya cuentas con la cantidad máxima de beneficios brindados en el mes seleccionado',
        {
          variant: 'error',
        }
      );
      onClose();
      return false;
    }

    // Proceso de agenda
    const tieneCitas = await checaPrimeraCita(datosUser.idUsuario, selectedValues.especialista);

    let tipoCita = 2;
    let precio = 50;
    let metodoPago = 1;
    // PROCESO DE AGENDAR: Se le valida que es nuevo usuario y se le agenda su cita.
    if (tieneCitas.result === true) {
      tipoCita = 1;
    }
    if (datosUser.tipoPuesto.toLowerCase() === 'operativa') {
      tipoCita = 1;
      precio = 0;
      metodoPago = 3;
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
      selectedValues.especialista,
      '',
      horarioSeleccionado,
      1,
      idAtencionPorSede.data[0].idAtencionXSede,
      datosUser.idUsuario,
      null,
      selectedValues.beneficio,
      null,
      selectedValues.modalidad
    );
    if (!agendar.result) {
      enqueueSnackbar(agendar.msg, {
        variant: 'error',
      });
      return onClose();
    }
    if (metodoPago === 1) {
      setOpen(true);
      // SIMULACIÓN DE PAGO
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setOpen(false);
    }
    const registrarPago = await registrarDetalleDePago(
      datosUser.idUsuario,
      uuidv4().substring(0, 20),
      tipoCita,
      precio,
      metodoPago
    );
    if (!registrarPago.result) {
      enqueueSnackbar('¡Ha surgido un error al generar el detalle de pago!', {
        variant: 'error',
      });
      return onClose();
    }

    // Evento de google
    const startDate = dayjs(horarioSeleccionado);
    const endDate = startDate.add(1, 'hour');

    let organizador = 'programador.analista36@ciudadmaderas.com';
    let correosNotificar = [
      organizador, // datosUser.correo Sustituir correo de analista
      'programador.analista34@ciudadmaderas.com',
      'programador.analista32@ciudadmaderas.com',
      'programador.analista12@ciudadmaderas.com',
      'tester.ti2@ciudadmaderas.com',
      'tester.ti3@ciudadmaderas.com',
      // algun correo de especialista
    ];

    if (datosUser.correo === null) {
      organizador = 'programador.analista12@ciudadmaderas.com'; // especialista
      correosNotificar = [
        organizador, // datosUser.correo Sustituir correo de analista
        'programador.analista36@ciudadmaderas.com',
        'programador.analista34@ciudadmaderas.com',
        'programador.analista32@ciudadmaderas.com',
        'tester.ti2@ciudadmaderas.com',
        'tester.ti3@ciudadmaderas.com',
      ];
    }
    const newGoogleEvent = await insertGoogleCalendarEvent(
      `Cita ${nombreBeneficio} - ${datosUser.nombre}`,
      startDate.format('YYYY-MM-DDTHH:mm:ss'),
      endDate.format('YYYY-MM-DDTHH:mm:ss'),
      oficina?.data ? oficina.data[0].ubicación : 'Oficina virtual ',
      `Cita de ${datosUser.nombre} en ${nombreBeneficio}`,
      correosNotificar, // Sustituir valores de correos
      organizador // datosUser.correo
    );

    if (!newGoogleEvent.result) {
      enqueueSnackbar('Error al conectar con la cuenta de google', {
        variant: 'error',
      });
      return onClose();
    }
    // Mandar datos de google calendar
    const update = await updateAppointment(
      datosUser.idUsuario,
      agendar.data,
      1,
      registrarPago.data,
      null,
      newGoogleEvent.data.id
    );
    if (!update.result) {
      enqueueSnackbar('¡Ha surgido un error al intentar registrar el detalle de pago!', {
        variant: 'error',
      });
      return onClose();
    }

    enqueueSnackbar('¡Se ha agendado la cita con éxito!', {
      variant: 'success',
    });
    appointmentMutate();
    const scheduledAppointment = await consultarCita(agendar.data);
    if (!scheduledAppointment.result) {
      enqueueSnackbar('¡Surgió un error al poder mostrar la previsualización de la cita!', {
        variant: 'error',
      });
      onClose();
      return false;
    }

    // const email = await sendMail(
    //   scheduledAppointment.data[0],
    //   1,
    //   correosNotificar,
    //   datosUser.idUsuario
    // );

    // if (!email.result) {
    //   console.error('No se pudo notificar al usuario');
    // }

    setEvent({ ...scheduledAppointment.data[0] });
    setOpen2(true);
    return true;
  });

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
      'tester.ti2@ciudadmaderas.com',
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
        'tester.ti2@ciudadmaderas.com',
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
      return onClose();
    }

    const scheduledAppointment = await consultarCita(currentEvent.id);
    if (!scheduledAppointment.result) {
      enqueueSnackbar('¡Surgió un error al poder mostrar la previsualización de la cita!', {
        variant: 'error',
      });
      onClose();
      return false;
    }

    const email = await sendMail(
      scheduledAppointment.data[0],
      2,
      correosNotificar,
      datosUser.idUsuario
    );

    if (!email.result) {
      console.error('No se pudo notificar al usuario');
    }
    appointmentMutate();
    return onClose();
  };

  const onPay = async () => {
    setBtnPayDisabled(true);
    let precio = 50;
    let metodoPago = 1;
    if (datosUser.tipoPuesto.toLowerCase() === 'operativa') {
      precio = 0;
      metodoPago = 3;
    }
    const registrarPago = await registrarDetalleDePago(
      datosUser.idUsuario,
      uuidv4().substring(0, 20),
      1,
      precio,
      metodoPago
    );
    if (registrarPago.result) {
      const update = await updateAppointment(
        datosUser.idUsuario,
        currentEvent.id,
        1,
        registrarPago.data,
        null,
        currentEvent.idEventoGoogle
      );
      setOpen(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setOpen(false);
      if (update.result) {
        enqueueSnackbar('¡Se ha generado el pago con éxito!', {
          variant: 'success',
        });
        return onClose();
      }
      if (!update.result) {
        enqueueSnackbar('¡Se obtuvo un error al intentar generar el pago de cita!', {
          variant: 'error',
        });
        return onClose();
      }
    }
    if (!registrarPago.result) {
      enqueueSnackbar('¡Ha surgido un error al intentar registrar el detalle de pago!', {
        variant: 'error',
      });
    }
    onClose();
    return !registrarPago.result;
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

  const getHorariosDisponibles = async (beneficio, especialistah) => {
    setIsLoading(true);
    // Consultamos el horario del especialista segun su beneficio.
    const horarioACubrir = await getHorario(beneficio);
    if (!horarioACubrir.result) return; // En caso de que no halla horario detenemos el proceso.

    // Teniendo en cuenta el dia actual, consultamos los dias restantes del mes actual y todos los dias del mes que sigue.
    let diasProximos = generarFechas(initialValue, lastDayOfNextMonth);

    // Le quitamos los registros del dia domingo y tambien sabados en el caso de que no lo trabaje el especialista.
    diasProximos = diasProximos.filter((date) => {
      const dayOfWeek = dayjs(date).day();

      return dayOfWeek !== 0 && (horarioACubrir?.data[0]?.sabados !== '0' || dayOfWeek !== 6);
    });

    // Traemos citas y horarios bloqueados por parte del usuario y especialsita
    const horariosOcupados = await getHorariosOcupados(
      especialistah,
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

    const diasOcupadosFiltro = filtradoDias(diasProximos, diasDisponibles);

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

  const isWeekend = (date) => {
    const day = date.day();

    return selectedValues.beneficio === 158 || selectedValues.beneficio === 686
      ? day === 0
      : day === 0 || day === 6; // Deshabilitar los sábados
  };

  const shouldDisableDate = (date) => {
    // Verificar si la fecha es un fin de semana
    const isWeekendDay = isWeekend(date);

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
    return isWeekendDay || isDisabledFromSQLServer || noPresencial;
  };

  const agendarCita = async (
    titulo,
    especialistah,
    observaciones,
    horarioCita,
    tipoCita,
    atencionPorSede,
    idUsuario,
    detallePago,
    beneficio,
    idGoogleEvent,
    modalidad
  ) => {
    const registrarCita = await crearCita(
      titulo,
      especialistah,
      idUsuario,
      observaciones,
      horarioCita,
      tipoCita,
      atencionPorSede,
      datosUser.idSede,
      1,
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
      currentEvent.modalidad
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
      'tester.ti2@ciudadmaderas.com',
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
        'tester.ti2@ciudadmaderas.com',
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
    const email = await sendMail(
      {
        ...scheduledAppointment.data[0],
        oldEventStart: currentEvent.start,
        oldEventEnd: currentEvent.end,
      },
      3,
      correosNotificar,
      datosUser.idUsuario
    );
    if (!email.result) {
      console.error('No se pudo notificar al usuario');
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
                        {currentEvent?.estatus === 2 || currentEvent?.estatus === 7 ? (
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
                          {currentEvent?.idDetalle === null || currentEvent?.idDetalle === 0
                            ? 'Sin pago'
                            : 'Pagado'}
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
                    onClick={onPay}
                  >
                    Pagar
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

      <Dialog
        open={open}
        maxWidth="sm"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
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
          {/* eos-icons:bubble-loading */}
        </DialogContent>
      </Dialog>

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
