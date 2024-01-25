import 'dayjs/locale/es';
import dayjs from 'dayjs';
import * as yup from 'yup';
import { Base64 } from 'js-base64';
import PropTypes from 'prop-types';
import utc from 'dayjs/plugin/utc';
import { useForm } from 'react-hook-form';
import timezone from 'dayjs/plugin/timezone';
import { yupResolver } from '@hookform/resolvers/yup';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/system/Stack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormHelperText from '@mui/material/FormHelperText';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import uuidv4 from 'src/utils/uuidv4';
import { fTimestamp } from 'src/utils/format-time';

import { useAuthContext } from 'src/auth/hooks';
import { cancelAppointment, useGetEventReasons } from 'src/api/calendar-specialist';
import {
  crearCita,
  getHorario,
  getContactoQB,
  getModalities,
  getSpecialists,
  useGetBenefits,
  lastAppointment,
  checaPrimeraCita,
  getAtencionXSede,
  updateAppointment,
  getCitasFinalizadas,
  updateDetailPacient,
  getHorariosOcupados,
  getCitasSinFinalizar,
  getOficinaByAtencion,
  registrarDetalleDePago,
} from 'src/api/calendar-colaborador';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider from 'src/components/hook-form/form-provider';

dayjs.locale('es');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);

const initialValue = dayjs().tz('America/Mexico_City'); // Objeto con todo los datos de fecha y hora
const lastDayOfNextMonth = initialValue.add(2, 'month').startOf('month').subtract(1, 'day');
// const now = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');

// const datosUser = JSON.parse(Base64.decode(sessionStorage.getItem('accessToken').split('.')[2]));
// console.log('Datos de sesión', datosUser);

export default function CalendarDialog({ currentEvent, onClose, selectedDate, appointmentMutate }) {
  const [selectedValues, setSelectedValues] = useState({
    beneficio: '',
    especialista: '',
    modalidad: '',
  });
  const [open, setOpen] = useState(false);
  const [reschedule, setReschedule] = useState(false);
  const [beneficios, setBeneficios] = useState([]);
  const [especialistas, setEspecialistas] = useState([]);
  const [modalidades, setModalidades] = useState([]);
  const [errorBeneficio, setErrorBeneficio] = useState(false);
  const [errorEspecialista, setErrorEspecialista] = useState(false);
  const [errorModalidad, setErrorModalidad] = useState(false);
  const [errorHorarioSeleccionado, setErrorHorarioSeleccionado] = useState(false);
  const [infoContact, setInfoContact] = useState({});
  const [oficina, setOficina] = useState({});
  const [diasOcupados, setDiasOcupados] = useState([]);
  const [diasHabilitados, setDiasHabilitados] = useState([]);
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState('');

  const { user: datosUser } = useAuthContext();

  const { data: benefits } = useGetBenefits(datosUser.idSede);

  const [isLoading, setIsLoading] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const formSchema = yup.object().shape({});

  const { data: eventReasons, reasonsMutate } = useGetEventReasons(currentEvent?.id || 0);

  const methods = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: currentEvent,
  });

  const { watch, handleSubmit } = methods;

  const selectedDateTittle = dayjs(selectedDate).format('dddd, DD MMMM YYYY');

  const values = watch();

  const onSubmit = handleSubmit(async () => {
    // Validaciones de inputs: Coloca leyenda de error debajo de cada input en caso que le falte cumplir con el valor
    if (selectedValues.beneficio === '') return setErrorBeneficio(true);
    if (selectedValues.especialista === '') return setErrorEspecialista(true);
    if (selectedValues.modalidad === '') return setErrorModalidad(true);
    if (horarioSeleccionado === '') return setErrorHorarioSeleccionado(true);

    const ahora = new Date();
    const fechaActual = dayjs(ahora).format('YYYY-MM-DD');

    const año = horarioSeleccionado.substring(0, 4);
    const mes = horarioSeleccionado.substring(5, 7);
    const dia = horarioSeleccionado.substring(8, 10);

    if (datosUser.fechaIngreso > fechaActual) {
      enqueueSnackbar('¡Existe un error con la fecha de antiguedad!', {
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
      return onClose();
    }

    // Checo si tiene citas para saber si es nuevo Paciente o no.
    const tieneCitas = await checaPrimeraCita(datosUser.idUsuario, selectedValues.especialista);

    // PROCESO DE AGENDAR: Se le valida que es nuevo usuario y se le agenda su cita.
    if (tieneCitas.result === false) {
      if (datosUser.tipoPuesto.toLowerCase() === 'operativa' || datosUser.idDepto === 13) {
        // PARAMS: idUsuario, folio (generado con uuidv4), concepto (1-cita, 2-pulsera), cantidad en pesos, metodoPago(1 tarjeta, 2 efectivo, 3 no aplica) .
        const registrarPago = await registrarDetalleDePago(datosUser.idUsuario, uuidv4(), 1, 0, 3);
        if (registrarPago.result) {
          return agendarCita(
            `CITA ${datosUser.nombre} ${año}-${mes}-${dia}`,
            selectedValues.especialista,
            '',
            horarioSeleccionado,
            1,
            idAtencionPorSede.data[0].idAtencionXSede,
            datosUser.idUsuario,
            registrarPago.data,
            selectedValues.beneficio
          );
        }
        if (!registrarPago.result) {
          enqueueSnackbar('¡Ha surgido un error al intentar registrar el detalle de pago!', {
            variant: 'error',
          });
          return onClose();
        }
      } else {
        setOpen(true);
        // SIMULACIÓN DE PAGO
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setOpen(false);
        const registrarPago = await registrarDetalleDePago(datosUser.idUsuario, uuidv4(), 1, 50, 1);
        if (registrarPago.result) {
          enqueueSnackbar('¡Detalle de pago registrado!', {
            variant: 'success',
          });
          return agendarCita(
            `CITA ${datosUser.nombre} ${año}-${mes}-${dia}`,
            selectedValues.especialista,
            ' ',
            horarioSeleccionado,
            1,
            idAtencionPorSede.data[0].idAtencionXSede,
            datosUser.idUsuario,
            registrarPago.data,
            selectedValues.beneficio
          );
        }
        if (!registrarPago.result) {
          enqueueSnackbar('¡Ha surgido un error al intentar registrar el detalle de pago!', {
            variant: 'error',
          });
          return onClose();
        }
        return onClose();
      }
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
    console.log('Citas sin finalizar: ', citasSinFinalizar);

    const citasFinalizadas = await getCitasFinalizadas(datosUser.idUsuario, mes, año);
    console.log('Cant de citas usadas:', citasFinalizadas);

    if (citasFinalizadas.result === true && citasFinalizadas?.data.length >= 2) {
      enqueueSnackbar('Ya cuentas con la cantidad maxima de beneficios brindados en el mes', {
        variant: 'error',
      });
      return onClose();
    }

    // PROCESO DE AGENDAR: Ya pasó por todas las validaciones y puede agendar
    if (datosUser.tipoPuesto.toLowerCase() === 'operativa' || datosUser.idDepto === 13) {
      // PARAMS: idUsuario, folio (generado con uuidv4), concepto (1-cita, 2-pulsera), cantidad en pesos, metodoPago(1 tarjeta, 2 efectivo, 3 no aplica) .
      const registrarPago = await registrarDetalleDePago(datosUser.idUsuario, uuidv4(), 1, 0, 3);
      if (registrarPago.result) {
        return agendarCita(
          `CITA ${datosUser.nombre} ${año}-${mes}-${dia}`,
          selectedValues.especialista,
          '',
          horarioSeleccionado,
          2,
          idAtencionPorSede.data[0].idAtencionXSede,
          datosUser.idUsuario,
          registrarPago.data,
          selectedValues.beneficio
        );
      }
      if (!registrarPago.result) {
        enqueueSnackbar('¡Ha surgido un error al intentar registrar el detalle de pago!', {
          variant: 'error',
        });
        return onClose();
      }
    } else {
      setOpen(true);
      // SIMULACIÓN DE PAGO
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setOpen(false);
      const registrarPago = await registrarDetalleDePago(datosUser.idUsuario, uuidv4(), 1, 50, 1);
      if (registrarPago.result) {
        enqueueSnackbar('¡Detalle de pago registrado!', {
          variant: 'success',
        });
        return agendarCita(
          `CITA ${datosUser.nombre} ${año}-${mes}-${dia}`,
          selectedValues.especialista,
          ' ',
          horarioSeleccionado,
          2,
          idAtencionPorSede.data[0].idAtencionXSede,
          datosUser.idUsuario,
          registrarPago.data,
          selectedValues.beneficio
        );
      }
      if (!registrarPago.result) {
        enqueueSnackbar('¡Ha surgido un error al intentar registrar el detalle de pago!', {
          variant: 'error',
        });
        return onClose();
      }
      return onClose();
    }
    return onClose();
  });

  const onCancel = async () => {
    // Reagendar
    // const now = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');
    // const deadline = dayjs(currentEvent.start).subtract(3, 'hour').format('YYYY-MM-DD HH:mm:ss');
    // console.log('Ahora', now);
    // console.log('Limite', deadline);
    // console.log('Estoy antes de la cita?', now < deadline);
    // console.log('Estoy despues de la cita?', now > deadline);

    const cancel = await cancelAppointment(currentEvent, currentEvent.id, 0);
    if (cancel.result) {
      enqueueSnackbar('¡Se ha cancelado la cita!', {
        variant: 'success',
      });
      appointmentMutate();
      return onClose();
    }
    if (!cancel.result) {
      enqueueSnackbar('¡Se generó un error al intentar cancelar la cita!', {
        variant: 'error',
      });
      appointmentMutate();
      return onClose();
    }
    appointmentMutate();

    return 'onClose()';
  };

  const onPay = async () => {
    const update = await updateAppointment(currentEvent.id, 1, currentEvent.idDetalle);
    setOpen(true);
    // SIMULACIÓN DE PAGO
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setOpen(false);
    if (update.result) {
      enqueueSnackbar('¡Se ha generado el pago con éxito!', {
        variant: 'success',
      });
      return onClose();
    }
    if (!update.result) {
      enqueueSnackbar('¡Se obtuvó un error al intentar generar el pago de cita!', {
        variant: 'error',
      });
      return onClose();
    }
    return '';
  };

  const handleChange = async (input, value) => {
    setInfoContact({});
    setOficina({});
    setHorarioSeleccionado('');
    setErrorHorarioSeleccionado(false);
    setHorariosDisponibles([]);

    if (input === 'beneficio') {
      setErrorBeneficio(false);
      // HACER PROCESO DE DETALLE PACIENTE
      const datosUltimaCita = await lastAppointment(datosUser.idSede, value);
      console.log('infoDetalle', datosUltimaCita);
      if (datosUltimaCita.result) {
        const modalitiesData = await getModalities(
          datosUser.idSede,
          datosUltimaCita.data[0].idEspecialista
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
      } else {
        // DEFAULT SELECTED VALUES
        setSelectedValues({
          beneficio: value,
          especialista: '',
          modalidad: '',
        });
      }
      const data = await getSpecialists(datosUser.idSede, datosUser.idArea, value);
      setEspecialistas(data?.data);
    } else if (input === 'especialista') {
      setErrorEspecialista(false);
      const modalitiesData = await getModalities(datosUser.idSede, value);
      setModalidades(modalitiesData?.data);
      if (modalitiesData.data.length > 0 && modalitiesData?.data.length === 1) {
        setSelectedValues({
          ...selectedValues,
          especialista: value,
          modalidad: modalitiesData.data[0].tipoCita,
        });
        setErrorModalidad(false);
        if (selectedValues.beneficio === 158) {
          const data = await getContactoQB(value);
          setInfoContact(data);
        } else {
          const data = await getOficinaByAtencion(
            datosUser.idSede,
            selectedValues.beneficio,
            value,
            modalitiesData.data[0].tipoCita
          );
          setOficina(data);
        }
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
      setSelectedValues({
        beneficio: value.idPuesto,
        especialista: value.idEspecialista,
        modalidad: value.modalidad,
      });
      const data = await getSpecialists(value.idSede, value.idArea, value.idPuesto);
      setEspecialistas(data?.data);
      const modalitiesData = await getModalities(value.idSede, value.idEspecialista);
      setModalidades(modalitiesData?.data);
      if (value.idPuesto === 158) {
        const cotactQB = await getContactoQB(value.idEspecialista);
        setInfoContact(cotactQB);
      } else {
        const oficinaAtencion = await getOficinaByAtencion(
          value.idSede,
          value.idPuesto, // Beneficio id
          value.idEspecialista,
          value.modalidad
        );
        setOficina(oficinaAtencion);
      }
      getHorariosDisponibles(value.idPuesto, value.idEspecialista);
    }
  };

  const generarFechas = (fechaInicial, fechaFinal) => {
    const resultado = [];
    let fechaActual = dayjs(fechaInicial);

    while (fechaActual.isSameOrBefore(fechaFinal, 'day')) {
      resultado.push(fechaActual.format('YYYY-MM-DD'));
      fechaActual = fechaActual.add(1, 'day');
    }

    return resultado;
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
    const horarioACubrir = await getHorario(beneficio);
    if (!horarioACubrir) return; // En caso de que no halla horario detenemos el proceso.

    // if (horarioACubrir?.data.length === 0) {
    //   horarioACubrir.data;
    // }
    // Teniendo en cuenta el dia actual, consultamos los dias restantes del mes actual y todos los dias del mes que sigue.
    let diasProximos = generarFechas(initialValue, lastDayOfNextMonth);

    // Le quitamos los registros del dia domingo y tambien sabados en el caso de que no lo trabaje el especialista.
    diasProximos = diasProximos.filter((date) => {
      const dayOfWeek = dayjs(date).day();
      return dayOfWeek !== 0 && (horarioACubrir?.data[0]?.sabados || dayOfWeek !== 6);
    });

    // Traemos citas y horarios bloqueados por parte del usuario y especialsita
    const horariosOcupados = await getHorariosOcupados(
      especialista,
      datosUser.idUsuario,
      initialValue.format('YYYY-MM-DD'),
      lastDayOfNextMonth.format('YYYY-MM-DD')
    );

    // Dias laborables con horario
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

    setFechasDisponibles(registrosCadaHora);

    const diasDisponibles = obtenerSoloFechas(registrosFiltrados);
    setDiasHabilitados(diasDisponibles);

    const diasOcupadosFiltro = filtradoDias(diasProximos, diasDisponibles);

    const año = new Date().getFullYear();

    // Dias festivos
    const diasFestivos = [
      `${año}-01-01`,
      `${año}-02-05`,
      `${año}-03-21`,
      `${año}-05-01`,
      `${año}-09-16`,
      `${año}-11-20`,
      `${año}-12-01`,
      `${año}-03-21`,
      `${año + 1}-01-01`,
      `${año + 1}-02-05`,
      `${año + 1}-03-21`,
      `${año + 1}-05-01`,
      `${año + 1}-09-16`,
      `${año + 1}-11-20`,
      `${año + 1}-12-01`,
      `${año + 1}-03-21`,
    ];

    const diasADeshabilitar = new Set([...diasOcupadosFiltro, ...diasFestivos]);

    setDiasOcupados([...diasADeshabilitar]);
    setIsLoading(false);
  };

  const handleDateChange = (newDate) => {
    setErrorHorarioSeleccionado(false);

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

    // Deshabilitar la fecha si es un fin de semana o está en la lista de fechas deshabilitadas
    return isWeekendDay || isDisabledFromSQLServer;
  };

  const contactSpecialist = () => {
    const phoneNumber = infoContact.data[0].telPersonal;
    // Construye el enlace de WhatsApp
    const whatsappLink = `https://wa.me/${phoneNumber}?text=¡Hola,%20me%20gustaría%20agendar%20una%20cita!%20`;

    // Abre una nueva ventana con el enlace de WhatsApp
    window.open(whatsappLink, '_blank');
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
    beneficio
  ) => {
    const registrarCita = await crearCita(
      titulo,
      especialista,
      idUsuario,
      observaciones,
      horarioCita,
      tipoCita,
      atencionPorSede,
      1,
      idUsuario,
      idUsuario,
      detallePago
    );
    if (registrarCita.result) {
      const updateDetail = updateDetailPacient(datosUser.idUsuario, beneficio);
      console.log(updateDetail);
      if (!updateDetail.result) {
        enqueueSnackbar('¡Surgió un error con el uso del beneficio para el paciente!', {
          variant: 'error',
        });
      }
      enqueueSnackbar('¡Se ha agendado la cita con éxito!', {
        variant: 'success',
      });
      appointmentMutate();
      return onClose();
    }
    if (!registrarCita.result) {
      enqueueSnackbar(registrarCita.msg, {
        variant: 'error',
      });
      return onClose();
    }

    enqueueSnackbar('¡Ha surgido un error al intentar agendar la cita!', {
      variant: 'error',
    });
    return onClose();
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
    // Validaciones de inputs: Coloca leyenda de error debajo de cada input en caso que le falte cumplir con el valor
    if (selectedValues.beneficio === '') return setErrorBeneficio(true);
    if (selectedValues.especialista === '') return setErrorEspecialista(true);
    if (selectedValues.modalidad === '') return setErrorModalidad(true);
    if (horarioSeleccionado === '') return setErrorHorarioSeleccionado(true);

    const ahora = new Date();
    const fechaActual = dayjs(ahora).format('YYYY-MM-DD');

    const año = horarioSeleccionado.substring(0, 4);
    const mes = horarioSeleccionado.substring(5, 7);
    const dia = horarioSeleccionado.substring(8, 10);

    if (datosUser.fechaIngreso > fechaActual) {
      enqueueSnackbar('¡Existe un error con la fecha de antiguedad!', {
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

    const cancel = await cancelAppointment(currentEvent, currentEvent.id, 8);
    console.log('Regreso de cancel', cancel);

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
    console.log('Citas sin finalizar: ', citasSinFinalizar);

    const citasFinalizadas = await getCitasFinalizadas(datosUser.idUsuario, mes, año);
    console.log('Cant de citas usadas:', citasFinalizadas);

    if (citasFinalizadas.result === true && citasFinalizadas?.data.length >= 2) {
      enqueueSnackbar('Ya cuentas con la cantidad maxima de beneficios brindados en el mes', {
        variant: 'error',
      });
      return onClose();
    }

    agendarCita(
      `CITA ${datosUser.nombre} ${año}-${mes}-${dia}`,
      currentEvent?.idEspecialista,
      ' ',
      horarioSeleccionado,
      currentEvent.tipoCita,
      currentEvent.idAtencionXSede,
      datosUser.idUsuario,
      currentEvent.idDetalle
    );

    return setReschedule(false);
  };

  const rescheduleAppointment = () => {
    handleChange('all', currentEvent);
    setReschedule(true);
  };

  const Items = () => {
    // items de los motivos que se trae el evento
    let items = '';
    // reasonsMutate();
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
        <Tooltip title="Sin motivos de cita">
          <Chip
            label="Sin motivos de cita"
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
      <FormProvider methods={methods} onSubmit={onSubmit}>
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
            {currentEvent?.id && (currentEvent?.estatus === 1 || currentEvent?.estatus === 6) && (
              <Stack sx={{ flexDirection: 'row' }}>
                {dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss') <
                  dayjs(currentEvent.start).subtract(3, 'hour').format('YYYY-MM-DD HH:mm:ss') && (
                  <Tooltip title="Reagendar cita">
                    <IconButton onClick={() => rescheduleAppointment()}>
                      <Iconify icon="fluent-mdl2:date-time-12" width={22} />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Cancelar cita">
                  <IconButton onClick={() => onCancel()}>
                    <Iconify icon="solar:trash-bin-trash-bold" width={22} />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1, md: 2 } }} direction="row" justifycontent="space-between">
          {currentEvent?.id ? (
            <>
              <Stack spacing={3} sx={{ p: { xs: 1, md: 2 } }}>
                <Typography variant="subtitle1">{selectedDateTittle}</Typography>
              </Stack>

              <Stack
                alignItems="center"
                sx={{
                  flexDirection: { sm: 'row', md: 'col' },
                  px: { xs: 1, md: 2 },
                  py: 1,
                }}
              >
                <Iconify icon="mdi:account-circle" width={30} sx={{ color: 'text.disabled' }} />
                <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                  Cita en {currentEvent?.beneficio ? currentEvent?.beneficio : 'Beneficio'}
                </Typography>
              </Stack>
              <Stack
                alignItems="center"
                sx={{
                  flexDirection: { sm: 'row', md: 'col' },
                  px: { xs: 1, md: 2 },
                  py: 1,
                }}
              >
                <Iconify icon="solar:user-id-broken" width={30} sx={{ color: 'text.disabled' }} />
                <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                  {currentEvent?.especialista ? currentEvent?.especialista : 'Especialista'}
                </Typography>
              </Stack>
              <Stack
                alignItems="center"
                sx={{
                  flexDirection: { sm: 'row', md: 'col' },
                  px: { xs: 1, md: 2 },
                  py: 1,
                }}
              >
                <Iconify icon="mdi:calendar-clock" width={30} sx={{ color: 'text.disabled' }} />
                <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                  {currentEvent?.id
                    ? `${dayjs(currentEvent?.start).format('HH:mm a')} - ${dayjs(
                        currentEvent?.end
                      ).format('HH:mm a')}`
                    : 'Fecha'}
                </Typography>
              </Stack>
              <Stack
                alignItems="center"
                sx={{
                  flexDirection: { sm: 'row', md: 'col' },
                  px: { xs: 1, md: 2 },
                  py: 1,
                }}
              >
                {currentEvent?.modalidad === 1 ? (
                  <>
                    <Iconify icon="mdi:earth" width={30} sx={{ color: 'text.disabled' }} />

                    <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                      {currentEvent?.sede ? currentEvent?.sede : 'Querétaro'}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Iconify icon="mdi:earth" width={30} sx={{ color: 'text.disabled' }} />

                    <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                      {currentEvent?.sede ? `${currentEvent?.sede} (En línea)` : 'En línea'}
                    </Typography>
                  </>
                )}
              </Stack>
              <Stack
                alignItems="center"
                sx={{
                  flexDirection: { sm: 'row', md: 'col' },
                  px: { xs: 1, md: 2 },
                  py: 1,
                }}
              >
                {currentEvent?.modalidad === 1 ? (
                  <>
                    <Iconify icon="ic:outline-place" width={30} sx={{ color: 'text.disabled' }} />

                    <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                      {currentEvent?.ubicación
                        ? currentEvent?.ubicación
                        : 'Calle Callerinas, 00, Centro, 76000'}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Iconify icon="ic:outline-place" width={30} sx={{ color: 'text.disabled' }} />

                    <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                      {currentEvent?.ubicación ? currentEvent?.ubicación : 'Remoto (En línea)'}
                    </Typography>
                  </>
                )}
              </Stack>
              <Stack
                sx={{
                  flexDirection: 'row',
                  px: { xs: 1, md: 2 },
                  py: 1,
                }}
              >
                <Stack>
                  <Iconify icon="ic:outline-email" width={30} sx={{ color: 'text.disabled' }} />
                </Stack>
                <Stack sx={{ flexDirection: 'col' }}>
                  <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                    {currentEvent?.correo
                      ? currentEvent?.correo.toLowerCase()
                      : 'correo-demo@ciudadmaderas.com.mx'}
                  </Typography>
                </Stack>
              </Stack>
              <Stack
                sx={{
                  flexDirection: 'row',
                  px: { xs: 1, md: 2 },
                  py: 1,
                }}
              >
                <Stack>
                  <Iconify icon="fa-solid:money-bill" width={30} sx={{ color: 'text.disabled' }} />
                </Stack>
                <Stack sx={{ flexDirection: 'col' }}>
                  <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                    {currentEvent?.estatus === 6 ? 'Pendiente de pago' : 'Pagado'}
                  </Typography>
                </Stack>
              </Stack>
              <Stack spacing={1} sx={{ px: { xs: 1, md: 2 }, py: 1 }}>
                <Stack spacing={1} direction="row">
                  <Iconify icon="solar:chat-round-line-outline" />
                  <Typography>Motivos</Typography>
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
              infoContact={infoContact}
              oficina={oficina}
              isLoading={isLoading}
              handleDateChange={handleDateChange}
              shouldDisableDate={shouldDisableDate}
              horariosDisponibles={horariosDisponibles}
              horarioSeleccionado={horarioSeleccionado}
              setHorarioSeleccionado={setHorarioSeleccionado}
              errorHorarioSeleccionado={errorHorarioSeleccionado}
            />
          )}
        </DialogContent>

        <DialogActions>
          <Button variant="contained" color="error" onClick={onClose}>
            Cerrar
          </Button>
          {currentEvent?.id && currentEvent?.estatus === 6 && (
            <Button
              variant="contained"
              color="success"
              disabled={currentEvent?.estatus !== 6}
              onClick={onPay}
            >
              Pagar
            </Button>
          )}
          {!currentEvent?.id && (
            <>
              {selectedValues.beneficio === 158 ? (
                <Button
                  variant="contained"
                  color="success"
                  disabled={!infoContact.result}
                  onClick={contactSpecialist}
                >
                  Contactar
                </Button>
              ) : (
                <LoadingButton type="submit" variant="contained" color="success">
                  Agendar
                </LoadingButton>
              )}
            </>
          )}
        </DialogActions>
      </FormProvider>
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

      <Dialog
        fullWidth
        maxWidth="md"
        open={reschedule}
        aria-labelledby="alert-dialog-title1"
        aria-describedby="alert-dialog-description1"
      >
        <DialogTitle sx={{ p: { xs: 1, md: 2 } }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            useFlexGap
            flexWrap="wrap"
            sx={{ p: { xs: 1, md: 2 } }}
          >
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
              REAGENDAR CITA
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1, md: 2 } }} direction="row" justifycontent="space-between">
          <AppointmentSchedule
            selectedValues={selectedValues}
            setSelectedValues={setSelectedValues}
            handleChange={handleChange}
            beneficios={beneficios}
            errorBeneficio={errorBeneficio}
            especialistas={especialistas}
            errorEspecialista={errorEspecialista}
            modalidades={modalidades}
            errorModalidad={errorModalidad}
            infoContact={infoContact}
            oficina={oficina}
            isLoading={isLoading}
            handleDateChange={handleDateChange}
            shouldDisableDate={shouldDisableDate}
            horariosDisponibles={horariosDisponibles}
            horarioSeleccionado={horarioSeleccionado}
            setHorarioSeleccionado={setHorarioSeleccionado}
            errorHorarioSeleccionado={errorHorarioSeleccionado}
            currentEvent={currentEvent}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={() => setReschedule(false)}>
            Cerrar
          </Button>
          {currentEvent?.id && (
            <>
              {selectedValues.beneficio === 158 ? (
                <Button
                  variant="contained"
                  color="success"
                  disabled={!infoContact.result}
                  onClick={contactSpecialist}
                >
                  Contactar
                </Button>
              ) : (
                <Button variant="contained" color="success" onClick={handleReSchedule}>
                  Reagendar
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}

const AppointmentSchedule = ({
  selectedValues,
  handleChange,
  beneficios,
  errorBeneficio,
  especialistas,
  errorEspecialista,
  modalidades,
  errorModalidad,
  infoContact,
  oficina,
  isLoading,
  handleDateChange,
  shouldDisableDate,
  horariosDisponibles,
  horarioSeleccionado,
  setHorarioSeleccionado,
  errorHorarioSeleccionado,
  currentEvent,
  Items,
}) => (
  <Grid sx={{ display: 'flex' }}>
    <Grid sx={{ width: '100%' }}>
      <Box
        sx={{
          width: { xs: '100%', md: '100%' },
          p: { xs: 1, md: 2 },
          borderRight: 'lightgray solid',
          borderRightWidth:
            selectedValues.especialista && selectedValues.beneficio !== 158
              ? '2px' // Puedes ajustar el grosor según tus necesidades
              : '0',
        }}
      >
        <Stack spacing={3}>
          <Typography variant="subtitle1">
            {dayjs().locale('es').format('dddd, DD MMMM YYYY')}
          </Typography>
          <Stack direction="column" spacing={3} justifyContent="space-between">
            <FormControl error={!!errorBeneficio} fullWidth>
              <InputLabel id="beneficio-input" name="beneficio">
                Beneficio
              </InputLabel>
              <Select
                labelId="Beneficio"
                id="select-beneficio"
                label="Beneficio"
                value={selectedValues.beneficio || ''}
                defaultValue=""
                onChange={(e) => handleChange('beneficio', e.target.value)}
                disabled={!!(beneficios.length === 0 || currentEvent?.id)}
              >
                {beneficios.map((e) => (
                  <MenuItem key={e.idPuesto} value={e.idPuesto}>
                    {e.puesto.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
              {errorBeneficio && selectedValues.beneficio === '' && (
                <FormHelperText error={errorBeneficio}>Seleccione un beneficio</FormHelperText>
              )}
            </FormControl>
            <FormControl error={!!errorEspecialista} fullWidth>
              <InputLabel id="especialista-input">Especialista</InputLabel>
              <Select
                labelId="especialista-input"
                id="select-especialista"
                label="Especialista"
                name="especialista"
                value={selectedValues.especialista}
                defaultValue=""
                onChange={(e) => handleChange('especialista', e.target.value)}
                disabled={!!(especialistas.length === 0 || currentEvent?.id)}
              >
                {especialistas.map((e, index) => (
                  <MenuItem key={e.id} value={e.id}>
                    {e.especialista.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
              {errorEspecialista && selectedValues.especialista === '' && (
                <FormHelperText error={errorEspecialista}>
                  Seleccione un especialista
                </FormHelperText>
              )}
            </FormControl>
            <FormControl error={!!errorModalidad} fullWidth>
              <InputLabel id="modalidad-input">Modalidad</InputLabel>
              <Select
                labelId="Modalidad"
                id="select-modalidad"
                label="Modalidad"
                name="Modalidad"
                defaultValue=""
                value={selectedValues.modalidad}
                onChange={(e) => handleChange('modalidad', e.target.value)}
                disabled={!!(modalidades.length === 0 || currentEvent?.id)}
              >
                {modalidades.map((e, index) => (
                  <MenuItem key={e.tipoCita} value={e.tipoCita}>
                    {e.modalidad.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
              {errorModalidad && selectedValues.modalidad === '' && (
                <FormHelperText error={errorModalidad}>Seleccione una modalidad</FormHelperText>
              )}
            </FormControl>
          </Stack>
          {selectedValues.modalidad && selectedValues.beneficio === 158 && (
            <Stack sx={{ px: 1 }}>
              Contacte al especialista seleccionado para agendar una cita de Quantum Balance:
              <br />
              {infoContact.result ? (
                <>
                  <Stack
                    sx={{
                      flexDirection: 'row',
                      px: { xs: 1, md: 2 },
                      py: 1,
                    }}
                  >
                    <Stack>
                      <Iconify icon="ic:outline-email" width={30} sx={{ color: 'text.disabled' }} />
                    </Stack>
                    <Stack sx={{ flexDirection: 'col' }}>
                      <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                        {infoContact.data[0].correo}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Stack
                    sx={{
                      flexDirection: 'row',
                      px: { xs: 1, md: 2 },
                      py: 1,
                    }}
                  >
                    <Stack>
                      <Iconify icon="mdi:phone" width={30} sx={{ color: 'text.disabled' }} />
                    </Stack>
                    <Stack sx={{ flexDirection: 'col' }}>
                      <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                        {infoContact.data[0].telPersonal}
                      </Typography>
                    </Stack>
                  </Stack>
                </>
              ) : (
                ' Cargando...'
              )}
            </Stack>
          )}
          {selectedValues.modalidad === 1 && selectedValues.beneficio !== 158 && (
            <Stack spacing={1} sx={{ p: { xs: 1, md: 1 } }}>
              Dirección de la oficina :
              {oficina && oficina.result ? (
                <Stack
                  sx={{
                    flexDirection: 'row',
                  }}
                >
                  <Stack>
                    <Iconify
                      icon="mdi:office-building-marker"
                      width={30}
                      sx={{ color: 'text.disabled' }}
                    />
                  </Stack>
                  <Stack sx={{ flexDirection: 'col' }}>
                    <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                      {oficina.data[0].ubicación}
                    </Typography>
                  </Stack>
                </Stack>
              ) : (
                ' Cargando...'
              )}
            </Stack>
          )}
        </Stack>
      </Box>
    </Grid>
    <Grid
      sx={{
        width: '100%',
        display: selectedValues.especialista && selectedValues.beneficio !== 158 ? 'block' : 'none',
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
        <DateCalendar
          loading={isLoading}
          onChange={handleDateChange}
          renderLoading={() => <DayCalendarSkeleton />}
          minDate={initialValue}
          maxDate={lastDayOfNextMonth}
          shouldDisableDate={shouldDisableDate}
          views={['year', 'month', 'day']}
        />
      </LocalizationProvider>
      <Stack
        direction="column"
        spacing={3}
        justifyContent="space-between"
        sx={{ px: { xs: 1, md: 10 } }}
      >
        {horariosDisponibles ? (
          <FormControl error={!!errorHorarioSeleccionado} fullWidth>
            <InputLabel id="modalidad-input">Horarios disponibles</InputLabel>
            <Select
              labelId="Horarios disponibles"
              id="select-horario"
              label="Horarios disponibles"
              name="Horarios disponibles"
              value={horarioSeleccionado}
              onChange={(e) => setHorarioSeleccionado(e.target.value)}
              disabled={horariosDisponibles.length === 0}
            >
              {horariosDisponibles.map((e, index) => (
                <MenuItem key={e.inicio} value={`${e.fecha} ${e.inicio}`}>
                  {e.inicio}
                </MenuItem>
              ))}
            </Select>
            {errorHorarioSeleccionado && horarioSeleccionado === '' && (
              <FormHelperText error={errorHorarioSeleccionado}>
                Seleccione fecha y horario
              </FormHelperText>
            )}
          </FormControl>
        ) : (
          <>Fecha sin horarios disponibles</>
        )}
      </Stack>
    </Grid>
  </Grid>
);

AppointmentSchedule.propTypes = {
  selectedValues: PropTypes.object,
  handleChange: PropTypes.func,
  beneficios: PropTypes.array,
  errorBeneficio: PropTypes.bool,
  especialistas: PropTypes.array,
  errorEspecialista: PropTypes.bool,
  modalidades: PropTypes.array,
  errorModalidad: PropTypes.bool,
  infoContact: PropTypes.object,
  oficina: PropTypes.object,
  isLoading: PropTypes.bool,
  handleDateChange: PropTypes.func,
  shouldDisableDate: PropTypes.func,
  horariosDisponibles: PropTypes.array,
  horarioSeleccionado: PropTypes.string,
  setHorarioSeleccionado: PropTypes.func,
  errorHorarioSeleccionado: PropTypes.bool,
  currentEvent: PropTypes.object,
  Items: PropTypes.any,
};
CalendarDialog.propTypes = {
  currentEvent: PropTypes.object,
  onClose: PropTypes.func,
  selectedDate: PropTypes.instanceOf(Date),
  appointmentMutate: PropTypes.func,
};
