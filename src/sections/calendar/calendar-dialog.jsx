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
import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/system/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { esES } from '@mui/x-date-pickers/locales';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import ToggleButton from '@mui/material/ToggleButton';
import { MobileDatePicker } from '@mui/x-date-pickers';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormHelperText from '@mui/material/FormHelperText';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
/*********************************** */
import Badge from '@mui/material/Badge';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';

import { fTimestamp } from 'src/utils/format-time';

import {
  crearCita,
  cancelDate,
  getHorario,
  getContactoQB,
  getModalities,
  getSpecialists,
  useGetBenefits,
  getAtencionXSede,
  checaPrimeraCita,
  getCitasFinalizadas,
  getHorariosOcupados,
  getCitasSinFinalizar,
  getOficinaByAtencion,
} from 'src/api/calendar-colaborador';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { RHFTextField } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';

dayjs.locale('es');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);

const initialValue = dayjs().tz('America/Mexico_City');
const lastDayOfNextMonth = initialValue.add(2, 'month').startOf('month').subtract(1, 'day');
const datosUser = JSON.parse(Base64.decode(sessionStorage.getItem('accessToken').split('.')[2]));
console.log(datosUser);

export default function CalendarDialog({ currentEvent, onClose, selectedDate, appointmentMutate }) {
  const [selectedValues, setSelectedValues] = useState({
    beneficio: '',
    especialista: '',
    modalidad: '',
  });
  const [beneficios, setBeneficios] = useState([]);
  const [especialistas, setEspecialistas] = useState([]);
  const [modalidades, setModalidades] = useState([]);
  const [errorBeneficio, setErrorBeneficio] = useState(false);
  const [errorEspecialista, setErrorEspecialista] = useState(false);
  const [errorModalidad, setErrorModalidad] = useState(false);
  const [errorHorarioSeleccionado, setErrorHorarioSeleccionado] = useState(false);
  const [infoContact, setInfoContact] = useState('');
  const [oficina, setOficina] = useState('');
  const [diasOcupados, setDiasOcupados] = useState([]);
  const [diasHabilitados, setDiasHabilitados] = useState([]);
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState('');

  const { data: benefits } = useGetBenefits(datosUser.idSede);

  const [isLoading, setIsLoading] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const formSchema = yup.object().shape({});

  const methods = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: currentEvent,
  });

  const { watch, handleSubmit } = methods;

  const fechaTitulo = dayjs(selectedDate).format('dddd, DD MMMM YYYY');

  const values = watch();
  const dateError =
    values.start && values.end ? fTimestamp(values.start) >= fTimestamp(values.end) : false; // Se dan los datos de star y end, para la validacion que el fin no sea antes que el inicio

  const onSubmit = handleSubmit(async (data) => {
    // Validaciones de inputs: Coloca leyenda de error debajo de cada input en caso que le falte cumplir con el valor
    if (selectedValues.beneficio === '') setErrorBeneficio(true);
    if (selectedValues.especialista === '') setErrorEspecialista(true);
    if (selectedValues.modalidad === '') setErrorModalidad(true);
    if (horarioSeleccionado === '') return setErrorHorarioSeleccionado(true);

    console.log('Comenzamos con las validaciones');
    console.log('Valores seleccionados', selectedValues);

    const ahora = new Date();
    const fechaActual = dayjs(ahora).format('YYYY-MM-DD');

    const año = horarioSeleccionado.substring(0, 4);
    const mes = horarioSeleccionado.substring(5, 7);
    const dia = horarioSeleccionado.substring(8, 10);
    console.log('Año', año, ' y mes;', mes, ' dia', dia);

    const isPracticante = datosUser.puesto.toLowerCase() === 'practicante';
    console.log('Practicante?', isPracticante);

    if (datosUser.fechaIngreso > fechaActual) {
      return enqueueSnackbar('¡Surgio un problema con la antiguedad del colaborador!', {
        variant: 'error',
      });
    }

    console.log('FECHA', fechaActual);
    // Validamos la antiguedad: Mandamos fechaIngreso, fechaDeHoy, isPracticante, idBeneficio.
    const tieneAntiguedad = validarAntiguedad(
      datosUser.fechaIngreso,
      fechaActual,
      isPracticante,
      selectedValues.beneficio
    );
    console.log('ANTIGUEDAD', tieneAntiguedad);

    if (!tieneAntiguedad) {
      onClose();
      return enqueueSnackbar('¡No cuentas con la antiguedad suficiente para agendar una cita!', {
        variant: 'error',
      });
    }

    // Consultamos su atencionXSede
    const idAtencionPorSede = await getAtencionXSede(
      selectedValues.especialista,
      datosUser.idSede,
      selectedValues.modalidad
    );
    // console.log('Este es mi idAtencionXSede', idAtencionPorSede.data.idAtencionXSede);

    // Checo si tiene citas para saber si es nuevo Paciente o no.
    const tieneCitas = await checaPrimeraCita(datosUser.idUsuario, selectedValues.especialista);
    console.log('¿Tiene citas usuario?', tieneCitas.result);

    // Si tiene citas, esto para determinar si es usuario nuevo
    if (tieneCitas.result === false) {
      // AGENDAR
      const agendarCita = await crearCita(
        `CITA ${datosUser.nombre} ${año}-${mes}-${dia}`,
        selectedValues.especialista,
        datosUser.idUsuario,
        '',
        horarioSeleccionado,
        1,
        idAtencionPorSede,
        1,
        datosUser.idUsuario,
        datosUser.idUsuario
      );
      // titulo, idEspecialista, idPaciente, observaciones, fechaInicio, tipoCita, idAtencionXSede, estatusCita, creadoPor, modificadoPor
      console.log('AGENDO Y AQUI TERMINA MI PROCESO', agendarCita);
      return true;
    }

    console.log('--- SI TIENE CITAS POR LO QUE HAGO MÁS PROCESOS  ---');

    const citasSinFinalizar = await getCitasSinFinalizar(
      datosUser.idUsuario,
      selectedValues.beneficio
    );
    console.log('CITAS SIN FINALIZAR', citasSinFinalizar);

    // Si tiene citas en proceso no lo tengo que dejar agendar citas
    if (citasSinFinalizar.result) {
      return enqueueSnackbar('Ya tienes una cita en proceso de este beneficio', {
        variant: 'error',
      });
    }

    const citasFinalizadas = await getCitasFinalizadas(datosUser.idUsuario, mes, año);
    console.log('CitasFinalizadas', citasFinalizadas);

    if (citasFinalizadas.result === true && citasFinalizadas?.data.length >= 2) {
      return enqueueSnackbar(
        'Ya cuentas con la cantidad maxima de beneficios brindados en el mes',
        { variant: 'error' }
      );
    }

    // AGENDAR
    // const agendarCita = await crearCita();
    // titulo, idEspecialista, idPaciente, observaciones, fechaInicio, tipoCita, idAtencionXSede, estatusCita, creadoPor, modificadoPor

    const agendarCita = await crearCita(
      `CITA ${datosUser.nombre} ${año}-${mes}-${dia}`,
      selectedValues.especialista,
      datosUser.idUsuario,
      '',
      horarioSeleccionado,
      2,
      idAtencionPorSede,
      1,
      datosUser.idUsuario,
      datosUser.idUsuario
    );
    // titulo, idEspecialista, idPaciente, observaciones, fechaInicio, tipoCita, idAtencionXSede, estatusCita, creadoPor, modificadoPor
    console.log('AGENDO Y AQUI TERMINA MI PROCESO', agendarCita);
    return false;
  });

  const onCancel = useCallback(async () => {
    try {
      const resp = await cancelDate(`${currentEvent?.id}`);

      if (resp.status) {
        enqueueSnackbar(resp.message);
      } else {
        enqueueSnackbar(resp.message, { variant: 'error' });
      }

      onClose();
    } catch (error) {
      enqueueSnackbar('Error', { variant: 'error' });
      onClose();
    }
  }, [currentEvent?.id, enqueueSnackbar, onClose]);

  const handleChange = async (input, value) => {
    setInfoContact('');
    setOficina('');
    setHorarioSeleccionado('');
    setErrorHorarioSeleccionado(false);
    setHorariosDisponibles([]);

    if (input === 'beneficio') {
      setErrorBeneficio(false);
      setSelectedValues({
        beneficio: value,
        especialista: '',
        modalidad: '',
      });
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
      getHorariosDisponibles(value);
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
        beneficio: value,
        especialista: value,
        modalidad: value,
      });
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

  const getHorariosDisponibles = async (especialista) => {
    setIsLoading(true);
    // Consultamos el horario del especialista segun su beneficio.
    const horarioACubrir = await getHorario(selectedValues.beneficio);
    // console.log('horarioACubrir', horarioACubrir);
    if (!horarioACubrir) return; // En caso de que no halla horario detenemos el proceso.

    // Teniendo en cuenta el dia actual, consultamos los dias restantes del mes actual y todos los dias del mes que sigue.
    let diasProximos = generarFechas(initialValue, lastDayOfNextMonth);
    // console.log('Dias proximos', diasProximos);

    // Le quitamos los registros del dia domingo y tambien sabados en el caso de que no lo trabaje el especialista.
    // console.log('Trabaja sabados', horarioACubrir.data[0].sabados);

    diasProximos = diasProximos.filter((date) => {
      const dayOfWeek = dayjs(date).day();
      return dayOfWeek !== 0 && (horarioACubrir.data[0].sabados || dayOfWeek !== 6);
    });
    // console.log('Dias proximos laborables', diasProximos);

    const horariosOcupados = await getHorariosOcupados(
      especialista,
      initialValue.format('YYYY-MM-DD'),
      lastDayOfNextMonth.format('YYYY-MM-DD')
    );
    // console.log('horariosOcupados', horariosOcupados?.data);

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

    // console.log('Dias laborables con horario', diasLaborablesConHorario);

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

    // console.log('Dias laborables en registros de 5 minutos', fechasEn5minutos);

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

    // console.log('Registros filtrados', registrosFiltrados);

    const registrosCadaHora = getRegistrosEn1hora(registrosFiltrados);

    // console.log('Fechas disponibles', registrosCadaHora);

    setFechasDisponibles(registrosCadaHora);

    const diasDisponibles = obtenerSoloFechas(registrosFiltrados);
    setDiasHabilitados(diasDisponibles);

    // console.log('Dias dispoibles', diasDisponibles);

    const diasOcupadosFiltro = filtradoDias(diasProximos, diasDisponibles);

    // console.log('DIAS A BLOQUEAR CALENDAR', diasOcupadosFiltro);

    setDiasOcupados(diasOcupadosFiltro);
    setIsLoading(false);
  };

  const handleDateChange = (newDate) => {
    // console.log('Cambiando...');
    // console.log('Dias Ocupados', diasHabilitados);
    // console.log('Dia de hoy', dayjs(newDate).format('YYYY-MM-DD'));
    setErrorHorarioSeleccionado(false);

    // Bloque para obtener las horas del dia actual mas una cant de horas para validar registros del mismo dia actual.
    const ahora = new Date();
    const horaActual = ((ahora.getHours() + 3) % 24).toString().padStart(2, '0');

    const minutosActuales = ahora.getMinutes().toString().padStart(2, '0');
    const segundosActuales = ahora.getSeconds().toString().padStart(2, '0');
    // console.log(`La hora actual es: ${horaActual}:${minutosActuales}:${segundosActuales}`);

    // Bloque para validar que no seleccione otro día que no sean los permitidos.
    const diaSeleccionado = dayjs(newDate).format('YYYY-MM-DD');
    const estaHabilitado = diasHabilitados.includes(diaSeleccionado);
    if (!estaHabilitado) {
      setHorariosDisponibles([]);
      return;
    }

    // Función para regresar los registros de horarios del dia seleccionado
    const arregloFiltrado = obtenerRegistrosPorFecha(fechasDisponibles, diaSeleccionado);
    // console.log('Solo registros del día', arregloFiltrado);

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
      // console.log('Las fechas son iguales');
      // console.log(resultadosFiltrados);
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

  const validarAntiguedad = (fechaIngreso, fechaHoy, isPracticante, beneficio) => {
    // Convierte las fechas a objetos de tipo Date
    const ingreso = new Date(fechaIngreso);
    const hoy = new Date(fechaHoy);

    // Calcula la diferencia en milisegundos
    const diferenciaMilisegundos = hoy - ingreso;
    console.log('1', diferenciaMilisegundos, hoy, ingreso, fechaHoy, fechaIngreso);

    // Calcula la diferencia en años, meses y días
    const milisegundosEnUnDia = 24 * 60 * 60 * 1000; // Milisegundos en un día
    const milisegundosEnUnAnio = milisegundosEnUnDia * 365.25; // Milisegundos en un año, considerando años bisiestos
    console.log('2', milisegundosEnUnDia, milisegundosEnUnAnio);

    const diferenciaAnios = Math.floor(diferenciaMilisegundos / milisegundosEnUnAnio);
    const diferenciaMeses = Math.floor(
      (diferenciaMilisegundos % milisegundosEnUnAnio) / (milisegundosEnUnDia * 30.44)
    );
    console.log('MESES CONTRATADO:', diferenciaMeses, beneficio, isPracticante);
    // Compara la diferencia de meses beneficio, y  puesto.
    if (
      (beneficio !== 158 && (diferenciaMeses >= 3 || diferenciaAnios > 0)) ||
      (!isPracticante && beneficio === 158 && (diferenciaMeses >= 2 || diferenciaAnios > 0)) ||
      (isPracticante && beneficio === 158 && (diferenciaMeses >= 1 || diferenciaAnios > 0))
    ) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (benefits) {
      setBeneficios(benefits);
    }
  }, [benefits]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <DialogTitle sx={{ p: { xs: 1, md: 2 } }}>
        <Stack direction="row" justifycontent="space-between" sx={{ p: { xs: 1, md: 2 } }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
            {currentEvent?.id ? 'DATOS DE CITA' : 'AGENDAR CITA' + JSON.stringify(selectedValues)}
          </Typography>
          {!!currentEvent?.id && (
            <Tooltip title="Cancelar cita">
              <IconButton onClick={onCancel}>
                <Iconify icon="solar:trash-bin-trash-bold" width={22} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 1, md: 2 } }} direction="row" justifycontent="space-between">
        {currentEvent?.id ? (
          <>
            <Stack spacing={3} sx={{ p: { xs: 1, md: 2 } }}>
              <Typography variant="subtitle1" sx={{ pl: { xs: 1, md: 1 } }}>
                {fechaTitulo}
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
              <Iconify icon="mdi:account-circle" width={30} sx={{ color: 'text.disabled' }} />
              <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                TERAPIA CM
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
                10:00 - 11:00 PM 2022/02/02
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
              <Iconify icon="mdi:earth" width={30} sx={{ color: 'text.disabled' }} />

              <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                Ciudad de Querétaro
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
              <Iconify icon="ic:outline-place" width={30} sx={{ color: 'text.disabled' }} />

              <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                Calle Venustiano Carranza #36 Centro 76000
              </Typography>
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
                  beneficiario1@ciudadmaderas.com.mx
                </Typography>
              </Stack>
            </Stack>
          </>
        ) : (
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
                        disabled={beneficios.length === 0}
                      >
                        {beneficios.map((e) => (
                          <MenuItem key={e.id} value={e.id}>
                            {e.puesto.toUpperCase()}
                          </MenuItem>
                        ))}
                      </Select>
                      {errorBeneficio && selectedValues.beneficio === '' && (
                        <FormHelperText error={errorBeneficio}>
                          Seleccione un beneficio
                        </FormHelperText>
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
                        disabled={especialistas.length === 0}
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
                        disabled={modalidades.length === 0}
                      >
                        {modalidades.map((e, index) => (
                          <MenuItem key={e.tipoCita} value={e.tipoCita}>
                            {e.modalidad.toUpperCase()}
                          </MenuItem>
                        ))}
                      </Select>
                      {errorModalidad && selectedValues.modalidad === '' && (
                        <FormHelperText error={errorModalidad}>
                          Seleccione una modalidad
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Stack>
                  {selectedValues.modalidad && selectedValues.beneficio === 158 && (
                    <Stack sx={{ px: 1 }}>
                      Contacte al especialista seleccionado para agendar una cita de Quantum
                      Balance:
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
                              <Iconify
                                icon="ic:outline-email"
                                width={30}
                                sx={{ color: 'text.disabled' }}
                              />
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
                              <Iconify
                                icon="mdi:phone"
                                width={30}
                                sx={{ color: 'text.disabled' }}
                              />
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
                display:
                  selectedValues.especialista && selectedValues.beneficio !== 158
                    ? 'block'
                    : 'none',
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
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="contained" color="error" onClick={onClose}>
          Cerrar
        </Button>
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
              <LoadingButton type="submit" variant="contained" disabled={dateError} color="success">
                Agendar
              </LoadingButton>
            )}
          </>
        )}
      </DialogActions>
    </FormProvider>
  );
}

CalendarDialog.propTypes = {
  currentEvent: PropTypes.object,
  onClose: PropTypes.func,
  selectedDate: PropTypes.instanceOf(Date),
  appointmentMutate: PropTypes.func,
};
