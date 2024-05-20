import 'dayjs/locale/es';
import useSWR from 'swr';
import dayjs from 'dayjs';
import { useMemo, useEffect } from 'react';

import { endpoints, fetcherPost } from 'src/utils/axios';
import {
  horaCancun,
  horaTijuana,
  toLocalISOString,
  finHorarioVerano,
  inicioHorarioVerano,
  horaCancunAEstandar,
  horaTijuanaAEstandar,
  obtenerFechasConHoras,
} from 'src/utils/general';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

// Trae todos los beneficios que puede gozar la sede.
export function useGetBenefits(sede, area) {
  const URL_BENEFITS = [endpoints.benefits.list];
  const {
    data,
    mutate: revalidate,
    isLoading,
    error,
    isValidating,
  } = useSWR(URL_BENEFITS, (url) => fetcherPost(url, { sede, area }));

  const memoizedValue = useMemo(
    () => ({
      data: data?.data || [],
      benefitsLoading: isLoading,
      benefitsError: error,
      benefitsValidating: isValidating,
      benefitsEmpty: !isLoading && !data?.data?.length,
      benefitsMutate: revalidate,
    }),
    [data?.data, error, isLoading, isValidating, revalidate]
  );

  return memoizedValue;
}

// Trae todos los especialistas que atienden en mi area, sede.
export function getSpecialists(sede, area, beneficio) {
  const URL_ESPECIALISTA = [endpoints.especialistas.list];
  const specialists = fetcherPost(URL_ESPECIALISTA, { sede, area, beneficio });

  return specialists;
}

// Trae las modalidades de los datos seleccionados (presencial o en linea)
export function getModalities(sede, especialista, area) {
  const URL = [endpoints.especialistas.modalities];
  const modalities = fetcherPost(URL, { sede, especialista, area });

  return modalities;
}

// Trae el horario de un beneficio
export async function getHorario(beneficio, especialista, idSede, idSedeEsp) {
  const URL = [endpoints.calendarioColaborador.getHorarioBeneficio];
  const horario = await fetcherPost(URL, { beneficio, especialista });

  let dataModificada = horario.data;

  if (idSede === 11 && idSede !== idSedeEsp) {
    const hoy = new Date();
    const año = hoy.getFullYear();

    const horasARestar =
      hoy >= inicioHorarioVerano(año) && hoy <= finHorarioVerano(año) ? 1 : 2;
    dataModificada = dataModificada.map((item) => {
      const horaInicio = new Date(`1970-01-01T${item.horaInicio}Z`);
      const tempTime = horaInicio.getHours() - horasARestar;
      horaInicio.setHours(tempTime);
      const horaFin = new Date(`1970-01-01T${item.horaFin}Z`);
      horaFin.setHours(horaFin.getHours() - horasARestar);
      const horaInicioSabado = new Date(`1970-01-01T${item.horaInicioSabado}Z`);
      horaInicioSabado.setHours(horaInicioSabado.getHours() - horasARestar);
      const horaFinSabado = new Date(`1970-01-01T${item.horaFinSabado}Z`);
      horaFinSabado.setHours(horaFinSabado.getHours() - horasARestar);

      return {
        ...item,
        horaInicio: horaInicio.toISOString().substring(11, 19),
        horaFin: horaFin.toISOString().substring(11, 19),
        horaInicioSabado: item.horaInicioSabado
          ? horaInicioSabado.toISOString().substring(11, 19)
          : null,
        horaFinSabado: item.horaFinSabado ? horaFinSabado.toISOString().substring(11, 19) : null,
      };
    });
    horario.data = dataModificada;
  }
  if (idSede === 9 && idSede !== idSedeEsp) {
    const hoy = new Date();
    const año = hoy.getFullYear();

    const horasASumar =
      hoy >= inicioHorarioVerano(año) && hoy <= finHorarioVerano(año) ? 1 : 2;
    dataModificada = dataModificada.map((item) => {
      const horaInicio = new Date(`1970-01-01T${item.horaInicio}Z`);
      const tempTime = horaInicio.getHours() + horasASumar;
      horaInicio.setHours(tempTime);
      const horaFin = new Date(`1970-01-01T${item.horaFin}Z`);
      horaFin.setHours(horaFin.getHours() - horasASumar);
      const horaInicioSabado = new Date(`1970-01-01T${item.horaInicioSabado}Z`);
      horaInicioSabado.setHours(horaInicioSabado.getHours() + horasASumar);
      const horaFinSabado = new Date(`1970-01-01T${item.horaFinSabado}Z`);
      horaFinSabado.setHours(horaFinSabado.getHours() + horasASumar);

      return {
        ...item,
        horaInicio: horaInicio.toISOString().substring(11, 19),
        horaFin: horaFin.toISOString().substring(11, 19),
        horaInicioSabado: item.horaInicioSabado
          ? horaInicioSabado.toISOString().substring(11, 19)
          : null,
        horaFinSabado: item.horaFinSabado ? horaFinSabado.toISOString().substring(11, 19) : null,
      };
    });
    horario.data = dataModificada;
  }

  return horario;
}

// Trae los horarios ocupados de especialista seleccionado y del usuario para ver disponibilidad en horario
export function getHorariosOcupados(especialista, usuario, fechaInicio, fechaFin) {
  const URL = [endpoints.calendarioColaborador.getAllEventsWithRange];
  const horarios = fetcherPost(URL, { especialista, usuario, fechaInicio, fechaFin });

  if (horarios?.data?.length > 0) {
    horarios.data = horarios.data.map((item) => ({ ...item, id: item.id.toString() }));
  }

  return horarios;
}

// Obtiene las oficinas de atención de los datos seleccionados para cita.
export function getOficinaByAtencion(sede, beneficio, especialista, modalidad) {
  const URL = [endpoints.calendarioColaborador.getOficina];
  const oficina = fetcherPost(URL, { sede, beneficio, especialista, modalidad });

  return oficina;
}

// Checa si el usuario tiene primera cita
export function _isPrimeraCita(usuario, beneficio) {
  const URL = [endpoints.calendarioColaborador.isPrimeraCita];
  const primeraCita = fetcherPost(URL, { usuario, beneficio });

  return primeraCita;
}

// Traer las citas sin finalizar o pendientes del beneficio
export function getCitasSinFinalizar(usuario, beneficio) {
  const URL = [endpoints.calendarioColaborador.getCitasSinFinalizar];
  const cita = fetcherPost(URL, { usuario, beneficio });

  return cita;
}

// Traer las citas sin evaluar y ya terminadas
export function getCitasSinEvaluar(usuario) {
  const URL = [endpoints.calendarioColaborador.getCitasSinEvaluar];
  const cita = fetcherPost(URL, { usuario });

  return cita;
}

// Traer las citas sin evaluar y ya terminadas
export function getCitasSinPagar(usuario) {
  const URL = [endpoints.calendarioColaborador.getCitasSinPagar];
  const cita = fetcherPost(URL, { usuario });

  return cita;
}

// Traer las citas finalizadas del mes que se consulte.
export function getCitasFinalizadas(usuario, mes, año) {
  const URL = [endpoints.calendarioColaborador.getCitasFinalizadas];
  const cita = fetcherPost(URL, { usuario, mes, anio: año });

  return cita;
}

// Saber la atencion x sede de la cita.
export function getAtencionXSede(especialista, sede, area, modalidad) {
  const URL = [endpoints.calendarioColaborador.getAtencionPorSede];
  const axs = fetcherPost(URL, { especialista, sede, area, modalidad });

  return axs;
}

// Registrar el detalle de pago
export function registrarDetalleDePago(
  usuario,
  folio,
  referencia,
  concepto,
  cantidad,
  metodoPago,
  estatusPago,
  idCita
) {
  const URL = [endpoints.calendarioColaborador.registrarDetallePago];
  const detalle = fetcherPost(URL, {
    usuario,
    folio,
    referencia,
    concepto,
    cantidad,
    metodoPago,
    estatusPago,
    idCita,
  });

  return detalle;
}

// Trae la ultima cita que tuvo en el beneficio para poder cargar todos los datos a la cita.
export function lastAppointment(usuario, beneficio) {
  const URL = [endpoints.calendarioColaborador.getLastAppointment];
  const detalle = fetcherPost(URL, { usuario, beneficio });

  return detalle;
}

// Actualizar algun dato de cita como estatus de la cita, o su detalle de pago.
export function updateAppointment(idUsuario, idCita, estatus, detalle, evaluacion, googleEventId) {
  const URL = [endpoints.calendarioColaborador.updateAppointment];
  const update = fetcherPost(URL, {
    idUsuario,
    idCita,
    estatus,
    detalle,
    evaluacion,
    googleEventId,
  });

  return update;
}

// Actualizar solo algun estatus de cita
export function updateStatusAppointment(idUsuario, idCita, estatus) {
  const URL = [endpoints.calendarioColaborador.updateStatusAppointment];
  const update = fetcherPost(URL, {
    idUsuario,
    idCita,
    estatus,
  });

  return update;
}

// Actualizar el registro de detalle paciente que indica que un usuario esta activo en el beneficio.
export function updateDetailPacient(usuario, beneficio) {
  const URL = [endpoints.calendarioColaborador.updateDetail];
  const update = fetcherPost(URL, { usuario, beneficio });

  return update;
}

// Actualizar el registro de detalle paciente que indica que un usuario esta activo en el beneficio.
export function checkInvoice(id) {
  const URL = [endpoints.calendario.checkInvoice];
  const check = fetcherPost(URL, { id });

  return check;
}

// Función para traer citas con estatus en pediente de pago
export function useGetPendientes() {
  const { user: datosUser } = useAuthContext();

  const pendientes = endpoints.calendarioColaborador.getPendientes;
  const { data, mutate: revalidate } = useSWR(pendientes, (url) =>
    fetcherPost(url, { idUsuario: datosUser?.idUsuario })
  );

  if (data?.data?.pago?.length > 0) {
    data.data.pago = data.data.pago.map((item) => ({ ...item, id: item.id.toString() }));
  }

  if (data?.data?.evaluacion?.length > 0) {
    data.data.evaluacion = data.data.evaluacion.map((item) => ({
      ...item,
      id: item.id.toString(),
    }));
  }

  const memoizedValue = useMemo(() => {

    let pagos = [];
    let evaluaciones = [];
    switch (datosUser.idSede) {
      case 11:

        pagos = data?.data?.pago?.map((i) => {
          let startConverted = horaTijuana(i.start);
          startConverted = toLocalISOString(startConverted);
          startConverted = startConverted.slice(0, 19).replace('T', ' ');
          const inicioCita = datosUser.idSede !== 11 ? i.start : startConverted;
          let endConverted = horaTijuana(i.end);
          endConverted = toLocalISOString(endConverted);
          endConverted = endConverted.slice(0, 19).replace('T', ' ');
          const finCita = datosUser.idSede !== 11 ? i.end : endConverted;
          return {
            ...i,
            start: inicioCita,
            end: finCita,
            textColor: i?.color ? i.color : 'black',
          }
        });

        evaluaciones = data?.data?.evaluacion?.map((i) => {
          let startConverted = horaTijuana(i.start);
          startConverted = toLocalISOString(startConverted);
          startConverted = startConverted.slice(0, 19).replace('T', ' ');
          const inicioCita = datosUser.idSede !== 11 ? i.start : startConverted;
          let endConverted = horaTijuana(i.end);
          endConverted = toLocalISOString(endConverted);
          endConverted = endConverted.slice(0, 19).replace('T', ' ');
          const finCita = datosUser.idSede !== 11 ? i.end : endConverted;
          return {
            ...i,
            start: inicioCita,
            end: finCita,
            textColor: i?.color ? i.color : 'black',
          }
        });
        break;
      case 9:

        pagos = data?.data?.pago?.map((i) => {
          let startConverted = horaCancun(i.start);
          startConverted = toLocalISOString(startConverted);
          startConverted = startConverted.slice(0, 19).replace('T', ' ');
          const inicioCita = datosUser.idSede !== 9 ? i.start : startConverted;
          let endConverted = horaCancun(i.end);
          endConverted = toLocalISOString(endConverted);
          endConverted = endConverted.slice(0, 19).replace('T', ' ');
          const finCita = datosUser.idSede !== 9 ? i.end : endConverted;
          return {
            ...i,
            start: inicioCita,
            end: finCita,
            textColor: i?.color ? i.color : 'black',
          }
        });

        evaluaciones = data?.data?.evaluacion?.map((i) => {
          let startConverted = horaCancun(i.start);
          startConverted = toLocalISOString(startConverted);
          startConverted = startConverted.slice(0, 19).replace('T', ' ');
          const inicioCita = datosUser.idSede !== 11 ? i.start : startConverted;
          let endConverted = horaCancun(i.end);
          endConverted = toLocalISOString(endConverted);
          endConverted = endConverted.slice(0, 19).replace('T', ' ');
          const finCita = datosUser.idSede !== 11 ? i.end : endConverted;
          return {
            ...i,
            start: inicioCita,
            end: finCita,
            textColor: i?.color ? i.color : 'black',
          }
        });
        break;
      default:
        pagos = [];
        evaluaciones = [];
    }

    const citas = {
      result: data?.result || false,
      data: {
        pago: pagos || [],
        evaluacion: evaluaciones || [],
      },
      msg: data?.msg || '¡Ocurrió un error!',
    };

    return {
      data: data ? citas : [],
      pendingsMutate: revalidate,
    };
  }, [data, revalidate, datosUser.idSede]);

  return memoizedValue;
}

export function getSedesPresenciales(id) {
  const URL = [endpoints.calendarioColaborador.getSedesEspecialista];
  const pendientes = fetcherPost(URL, { idUsuario: id });

  return pendientes;
}

export function getDiasDisponibles(idUsuario, idSede) {
  const URL = [endpoints.calendarioColaborador.getDisponibilidadEspecialista];
  const dias = fetcherPost(URL, { idUsuario, idSede });

  return dias;
}

// Función para crear cita
export function crearCita(
  titulo,
  idEspecialista,
  idPaciente,
  observaciones,
  fechaInicio,
  tipoCita,
  idAtencionXSede,
  idSede,
  estatusCita,
  creadoPor,
  modificadoPor,
  detallePago,
  idGoogleEvent,
  modalidad
) {
  const URL_CITA = [endpoints.calendarioColaborador.createAppointment];

  let horaDeTijuana = horaTijuanaAEstandar(fechaInicio);
  horaDeTijuana = toLocalISOString(horaDeTijuana);
  horaDeTijuana = horaDeTijuana.slice(0, 19).replace('T', ' ');
  fechaInicio = idSede !== 11 ? fechaInicio : horaDeTijuana;

  let horaDeCancun = horaCancunAEstandar(fechaInicio);
  horaDeCancun = toLocalISOString(horaDeCancun);
  horaDeCancun = horaDeCancun.slice(0, 19).replace('T', ' ');
  fechaInicio = idSede !== 9 ? fechaInicio : horaDeCancun;

  const axs = fetcherPost(URL_CITA, {
    titulo,
    idEspecialista,
    idPaciente,
    observaciones,
    fechaInicio,
    tipoCita,
    idAtencionXSede,
    idSede,
    estatusCita,
    creadoPor,
    modificadoPor,
    detallePago,
    idGoogleEvent,
    modalidad,
  });

  return axs;
}

// Trae todas las citas del usuario
export function useGetAppointmentsByUser(current, id, idSede) {
  const URL_APPOINTMENTS = [endpoints.calendarioColaborador.getAppointmentsByUser];
  const year = current.getFullYear();
  const month = current.getMonth() + 1;

  const dataValue = {
    year,
    month,
    idUsuario: id,
  };

  const {
    data,
    mutate: revalidate,
    isLoading,
    error,
    isValidating,
  } = useSWR(URL_APPOINTMENTS, (url) => fetcherPost(url, dataValue));

  if (data?.data?.length > 0) {
    data.data = data.data.map((item) => ({ ...item, id: item.id.toString() }));
  }

  useEffect(() => {
    revalidate();
  }, [current, revalidate]);

  const memoizedValue = useMemo(() => {

    let events = [];
    switch (idSede) {
      case 11:
        events = data?.data?.map((event) => {
          let startConverted = horaTijuana(event.start);
          startConverted = toLocalISOString(startConverted);
          startConverted = startConverted.slice(0, 19).replace('T', ' ');
          const inicioCita = idSede !== 9 ? event.start : startConverted;
          let endConverted = horaTijuana(event.end);
          endConverted = toLocalISOString(endConverted);
          endConverted = endConverted.slice(0, 19).replace('T', ' ');
          const finCita = idSede !== 9 ? event.end : endConverted;
          const fechasCitasReagendadas = obtenerFechasConHoras(event.fechasFolio);
          let fechas = '';
          fechasCitasReagendadas?.forEach((fecha) => {
            const fechaInicioCita = horaCancun(fecha);
            fechas +=
              fechas === ''
                ? `${dayjs(fechaInicioCita).format('DD / MM / YYYY')} A las ${dayjs(
                    fechaInicioCita
                  ).format('HH:mm')} horas.`
                : `,${dayjs(fechaInicioCita).format('DD / MM / YYYY')} A las ${dayjs(
                    fechaInicioCita
                  ).format('HH:mm')} horas.`;
          });
          return {
            ...event,
            start: inicioCita,
            end: finCita,
            textColor: event?.color ? event.color : 'black',
            fechasFolio: fechas || event.fechasFolio,
          };
        });
        break;

      case 9:
        events = data?.data?.map((event) => {
          let startConverted = horaCancun(event.start);
          startConverted = toLocalISOString(startConverted);
          startConverted = startConverted.slice(0, 19).replace('T', ' ');
          const inicioCita = idSede !== 9 ? event.start : startConverted;
          let endConverted = horaCancun(event.end);
          endConverted = toLocalISOString(endConverted);
          endConverted = endConverted.slice(0, 19).replace('T', ' ');
          const finCita = idSede !== 9 ? event.end : endConverted;
          const fechasCitasReagendadas = obtenerFechasConHoras(event.fechasFolio);
          let fechas = '';
          fechasCitasReagendadas?.forEach((fecha) => {
            const fechaInicioCita = horaCancun(fecha);
            fechas +=
              fechas === ''
                ? `${dayjs(fechaInicioCita).format('DD / MM / YYYY')} A las ${dayjs(
                    fechaInicioCita
                  ).format('HH:mm')} horas.`
                : `,${dayjs(fechaInicioCita).format('DD / MM / YYYY')} A las ${dayjs(
                    fechaInicioCita
                  ).format('HH:mm')} horas.`;
          });
          return {
            ...event,
            start: inicioCita,
            end: finCita,
            textColor: event?.color ? event.color : 'black',
            fechasFolio: fechas || event.fechasFolio,
          };
        });
        break;
      default:
        events = [];
    }

    return {
      data: events || [],
      appointmentLoading: isLoading,
      appointmentError: error,
      appointmentValidating: isValidating,
      appointmentEmpty: !isLoading && !data?.data?.length,
      appointmentMutate: revalidate,
    };
  }, [data?.data, error, isLoading, isValidating, revalidate, idSede]);

  return memoizedValue;
}

export function cancelAppointment(currentEvent, id, cancelType, idUsuario) {
  const URL = [endpoints.calendario.cancelAppointment];
  const data = {
    idCita: id,
    startStamp: dayjs(currentEvent.start).format('YYYY/MM/DD HH:mm:ss'),
    start: currentEvent.start,
    tipo: cancelType,
    modificadoPor: idUsuario,
  };
  const cancel = fetcherPost(URL, data);

  return cancel;
}

export async function consultarCita(idCita, idSede) {
  const URL = [endpoints.calendarioColaborador.getCitaById];
  const cita = await fetcherPost(URL, { idCita });

  let startConverted = [];
  let endConverted = [];
  let inicioCita = [];
  let finCita = [];

  switch (idSede) {
    case 11:
      startConverted = horaTijuana(cita.data[0].start);
      startConverted = toLocalISOString(startConverted);
      startConverted = startConverted.slice(0, 19).replace('T', ' ');

      endConverted = horaTijuana(cita.data[0].end);
      endConverted = toLocalISOString(endConverted);
      endConverted = endConverted.slice(0, 19).replace('T', ' ');

      inicioCita = startConverted;
      finCita = endConverted;
      break;
    case 9:
      startConverted = horaTijuana(cita.data[0].start);
      startConverted = toLocalISOString(startConverted);
      startConverted = startConverted.slice(0, 19).replace('T', ' ');

      endConverted = horaTijuana(cita.data[0].end);
      endConverted = toLocalISOString(endConverted);
      endConverted = endConverted.slice(0, 19).replace('T', ' ');

      inicioCita = startConverted;
      finCita = endConverted;
      
      break;
    default:
      startConverted = [];
      endConverted = [];
      startConverted = cita.data[0].start;
      finCita = cita.data[0].end;
  }

  if (cita?.data?.length > 0) {
    cita.data = cita.data.map((item) => ({
      ...item,
      id: item.id.toString(),
      start: inicioCita,
      end: finCita,
    }));
  }

  return cita;
}

// Actualizar el registro de detalle paciente que indica que un usuario esta activo en el beneficio.
export function sendMail(event, typeEmail, correo, idUsuario) {
  const URL = [endpoints.calendario.mailEspecialista];
  let imagen = '';
  let view = '';
  let tituloEmail = '';
  let temaEmail = '';
  let fechaOld = '';
  let horaInicioOld = '';
  let horaFinalOld = '';

  switch (typeEmail) {
    case 1: // Agendar
      tituloEmail = 'Reservación';
      imagen = 'appointment.png';
      view = 'email-appointment';
      temaEmail = 'Has realizado con éxito tu reservación para el beneficio de ';
      break;
    case 2: // Cancelar
      tituloEmail = 'Cancelación';
      imagen = 'cancel.png';
      view = 'email-cancelar';
      temaEmail = 'Se ha cancelado su cita de ';
      break;
    case 3: // Reagendar
      tituloEmail = 'Reagenda';
      imagen = 'appointment.png';
      view = 'email-reschedule';
      temaEmail = 'Se ha reagendado su cita de ';
      fechaOld = dayjs(event.oldEventStart).format('DD/MM/YYYY');
      horaInicioOld = dayjs(event.oldEventStart).format('HH:mm: a');
      horaFinalOld = dayjs(event.oldEventEnd).format('HH:mm: a');
      break;
    default:
      tituloEmail = 'Test';
      imagen = 'appointment.png';
      view = 'email-appointment';
      temaEmail = 'Test de ';
      break;
  }

  const data = {
    tituloEmail,
    titulo: tituloEmail,
    temaEmail,
    imagen,
    beneficio: event.beneficio,
    especialidad: event.beneficio,
    oficina: event.ubicación,
    especialista: event.especialista,
    sede: event.sede,
    fecha: dayjs(event.start).format('DD/MM/YYYY'),
    horaInicio: dayjs(event.start).format('HH:mm a'),
    horaFinal: dayjs(event.end).format('HH:mm a'),
    fechaOld,
    horaInicioOld,
    horaFinalOld,
    view,
    correo,
    idUsuario,
  };

  const mail = fetcherPost(URL, data);

  return mail;
}

export function insertGoogleCalendarEvent(
  title,
  start,
  end,
  location,
  description,
  attendees,
  email
) {
  const URL = [endpoints.calendarioColaborador.insertGoogleEvent];

  const guest = attendees
    .filter((each) => each !== email)
    .map((each) => ({ email: each, responseStatus: 'accepted' })); // needsAction

  attendees = [{ email, responseStatus: 'accepted' }, ...guest];

  const insertEvent = fetcherPost(URL, {
    title,
    start,
    end,
    location,
    description,
    attendees,
    email,
  });

  return insertEvent;
}

export function updateGoogleCalendarEvent(id, start, end, email, attendees) {
  const URL = [endpoints.calendarioColaborador.updateGoogleEvent];

  const guest = attendees
    .filter((each) => each !== email)
    .map((each) => ({ email: each, responseStatus: 'accepted' })); // needsAction

  attendees = [{ email, responseStatus: 'accepted' }, ...guest];

  const updateEvent = fetcherPost(URL, { id, start, end, email, attendees });

  return updateEvent;
}

export function deleteGoogleCalendarEvent(id, email) {
  const URL = [endpoints.calendarioColaborador.deleteGoogleEvent];
  const deleteEvent = fetcherPost(URL, { id, email });

  return deleteEvent;
}

// Actualizar la fecha de intento de pago en las citas para que se les inhabilite.
export function actualizarFechaIntentoPago(idUsuario, idCita) {
  const URL = [endpoints.calendarioColaborador.actualizaFechaIntentoPago];
  const update = fetcherPost(URL, { idUsuario, idCita });

  return update;
}

export function getBeneficioActivo(idUsuario){
  const URL = [endpoints.calendarioColaborador.getBeneficioActivo];

  const get = fetcherPost(URL, { idUsuario });

  return get;
}

export function getDocumento(beneficio){
  const URL = [endpoints.calendarioColaborador.getDocumento];

  const get = fetcherPost(URL, { beneficio });

  return get;
}

// Traer las citas sin evaluar y ya terminadas
export function getSedeEsp(especialista) {
  const URL = [endpoints.calendarioColaborador.getSedeEsp];
  const idSede = fetcherPost(URL, { especialista });

  return idSede;
}