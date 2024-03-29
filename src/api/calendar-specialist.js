import dayjs from 'dayjs';
// import { Base64 } from 'js-base64';
import useSWR, { mutate } from 'swr';
import { useMemo, useEffect } from 'react';
import { enqueueSnackbar } from 'notistack';

import uuidv4 from 'src/utils/uuidv4';
import { endpoints, fetcherPost } from 'src/utils/axios';

// ----------------------------------------------------------------------

// cadenas de url extraidas de lo que se encuentra en el axios
const get_all_events = endpoints.calendario.getAllEvents;
const save_occupied = endpoints.calendario.saveOccupied;
const update_occupied = endpoints.calendario.updateOccupied;
const update_appointment = endpoints.calendario.updateAppointment;
const delete_event = endpoints.calendario.deleteOccupied;
const cancel_appointment = endpoints.calendario.cancelAppointment;
const create_appointment = endpoints.calendario.createAppointment;
const appointment_drop = endpoints.calendario.appointmentDrop;
const occupied_drop = endpoints.calendario.occupiedDrop;
const end_appointment = endpoints.calendario.endAppointment;
const get_reasons = endpoints.calendario.getReasons;
const get_pending_end = endpoints.calendario.getPendingEnd;
const get_event_reasons = endpoints.calendario.getEventReasons;
const registar_transaccion = endpoints.calendario.registrarTransaccion;
const check_invoice = endpoints.calendario.checkInvoice;
const sendMail = endpoints.calendario.mailEspecialista;
const update_detalle_paciente = endpoints.calendario.updateDetallePaciente;
const insert_google_event = endpoints.calendario.insertGoogleEvent;
const insert_google_id = endpoints.calendario.insertGoogleId;
const update_google_event = endpoints.calendario.updateGoogleEvent;
const delete_google_event = endpoints.calendario.deleteGoogleEvent;

const options = {
  revalidateIfStale: false,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  refreshInterval: 0,
};

// const session = sessionStorage.getItem('accessToken');
// const datosUser = session ? JSON.parse(Base64.decode(session.split('.')[2])) : [];

// ----------------------------------------------------------------------

export async function reRender() {
  // se separa la funcion del mutate unicamente para cuando se crea el evento (previsto en update)
  mutate(get_all_events);
}

// ----------------------------------------------------------------------

export function GetCustomEvents(current, idUsuario) {
  const year = current.getFullYear();
  const month = current.getMonth() + 1; // para obtener el mes que se debe se suma 1, ya que el default da 0

  const dataValue = {
    year,
    month,
    idUsuario,
  };

  const { data, isLoading, error, isValidating } = useSWR( get_all_events, (url) => fetcherPost(url, dataValue), options );

  if (data?.events?.length > 0) {
    data.events = data.events.map((item) => ({ ...item, id: item.id.toString() }));
  }

  useEffect(() => {
    // esta función ayuda a que se de un trigger para traer de nuevo los eventos del mes, cada que cambia month
    reRender();
  }, [month]);

  if (data?.events?.length > 0) {
    data.events = data.events.map((item) => ({ ...item, id: item.id.toString() }));
  }

  const memoizedValue = useMemo(() => {
    const events = data?.events?.map((event) => ({
      ...event,
      textColor: event?.tipoCita === 1 && event?.estatus === 1 ? 'yellow' : event?.color,
      type: event?.type,
      fechaInicio: event.start,
    }));

    return {
      events: events || [],
      eventsLoading: isLoading,
      eventsError: error,
      eventsValidating: isValidating,
      eventsEmpty: !isLoading && !data?.events?.length,
    };
  }, [data?.events, error, isLoading, isValidating]);

  return memoizedValue;
}

// ----------------------------------------------------------------------

export async function createCustom(eventData, idUsuario) {
  let create = '';
  const fechaInicio = dayjs(`${eventData.fechaInicio} ${eventData.hora_inicio}`).format(
    'YYYY/MM/DD HH:mm:ss'
  );
  const fechaFinal = dayjs(`${eventData.fechaFinal} ${eventData.hora_final}`).format(
    'YYYY/MM/DD HH:mm:ss'
  );

  const dataValue = {
    titulo: eventData.title,
    idUnico: eventData.id,
    idUsuario,
    fechaInicio,
    fechaFinal,
    idEspecialista: idUsuario,
    modificadoPor: idUsuario,
  };

  create = fetcherPost(save_occupied, dataValue);

  return create;
}

// ----------------------------------------------------------------------

export async function updateCustom(eventData, idUsuario) {
  let update = '';

  const start = dayjs(`${eventData.fechaInicio} ${eventData.hora_inicio}`).format(
    'YYYY/MM/DD HH:mm:ss'
  ); // fecha a la que se movera
  const end = dayjs(`${eventData.fechaFinal} ${eventData.hora_final}`).format(
    'YYYY/MM/DD HH:mm:ss'
  );
  const now = dayjs(new Date()).format('YYYY/MM/DD HH:mm:ss');
  const oldStart = dayjs(`${eventData.newDate} ${eventData.hora_inicio}`).format(
    'YYYY/MM/DD HH:mm:ss'
  ); // fecha original del evento

  const dataValue = {
    id: eventData.id,
    fechaInicio: start,
    fechaFinal: end,
    titulo: eventData.title,
    idUsuario,
    oldStart,
    modificadoPor: idUsuario,
  };

  if (oldStart > now) {
    if (start > now) {
      update = fetcherPost(update_occupied, dataValue);
    } else {
      update = { result: false, msg: 'No se pueden mover las fechas a un dia anterior o actual' };
    }
  } else {
    update = { result: false, msg: 'Las citas u horarios pasados no se pueden mover' };
  }

  return update;
}

// ----------------------------------------------------------------------

export async function deleteEvent(eventId, idUsuario) {
  const data = {
    eventId,
    modificadoPor: idUsuario,
    fechaModificacion: Date(),
  };

  const delEvent = fetcherPost(delete_event, data);

  return delEvent;
}

// ----------------------------------------------------------------------

export async function createAppointment(eventData, modalitie, datosUser) {
  let create = '';
  let transaction = '';
  let transactionId = 0;
  let especialidad = '';
  let sede = modalitie?.sede || 'virtual';
  let oficina = modalitie?.oficina || 'virtual';

  const fechaInicio = dayjs(`${eventData.fechaInicio} ${eventData.hora_inicio}`).format(
    'YYYY/MM/D HH:mm:ss'
  );
  const fechaFinal = dayjs(`${eventData.fechaFinal} ${eventData.hora_final}`).format(
    'YYYY/MM/D HH:mm:ss'
  );
  const fundacion = eventData.paciente.externo;

  const start = dayjs(`${eventData.newDate} ${eventData.hora_inicio}`).format(
    'YYYY/MM/DD HH:mm:ss'
  ); // fecha a la que se movera
  const now = dayjs(new Date()).format('YYYY/MM/DD HH:mm:ss');

  const fecha = dayjs(eventData.fechaInicio).format('DD/MM/YYYY');
  const horaInicio = dayjs(fechaInicio).format('HH:mm a');
  const horaFinal = dayjs(fechaFinal).format('HH:mm a');

  let bussinessHours = true;

  switch (datosUser.idPuesto) {
    case 537:
      especialidad = 'nutrición';
      break;

    case 585:
      especialidad = 'psicología';
      break;

    case 686:
      especialidad = 'guía espiritual';
      break;

    case 158:
      especialidad = 'quantum balance';
      break;

    default:
      especialidad = 'NA';
      break;
  }

  if (fundacion === 1) {
    sede = 'Querétaro';
    oficina = 'Confirmado por especialista';
  }

  if(eventData.hora_inicio < '08:00:00' || eventData.hora_final > '18:00:00'){
    bussinessHours = false;
  }

  const dataTransaction = {
    usuario: eventData.paciente.idUsuario,
    folio: uuidv4(),
    concepto: 1,
    cantidad: 0,
    metodoPago: 3,
  };

  if (start > now && bussinessHours) {
    if (fundacion === 1 || eventData.paciente.tipoPuesto === 'Operativa') {
      transaction = await fetcherPost(registar_transaccion, dataTransaction);

      if (transaction.result) {
        transactionId = transaction.data;
      }
    }

    const data = {
      idUsuario: datosUser.idUsuario,
      idPaciente: eventData.paciente.idUsuario,
      fechaInicio,
      fechaFinal,
      creadoPor: datosUser.idUsuario,
      titulo: eventData.title,
      modificadoPor: datosUser.idUsuario,
      idCatalogo: modalitie.idAtencionXSede,
      fundacion,
      idDetalle: transactionId,
      especialidad,
      reagenda: 0,
      tipoPuesto: eventData.paciente.tipoPuesto,
      idSede: eventData.paciente.idSede,
      modalidad: modalitie.modalidad
    };

    const mailMessage = {
      // datos para enviar el mail
      especialidad,
      especialista: datosUser.nombre,
      fecha,
      horaInicio,
      horaFinal,
      view: 'email-appointment',
      oficina,
      sede,
      tituloEmail: 'Reservación',
      temaEmail: 'Se ha agendado tu cita con: ',
      correo: eventData.paciente.correo,
    };

    const googleData = {
      title: eventData.title,
      start: dayjs(fechaInicio).format('YYYY-MM-DDTHH:mm:ss'),
      end: dayjs(fechaFinal).format('YYYY-MM-DDTHH:mm:ss'),
      location: `${oficina}, ${sede}`,
      description: `Cita agendada en: ${especialidad}`,
      attendees: [
        {
          email: 'programador.analista36@ciudadmaderas.com', // eventData.paciente.correo Sustituir correo
          responseStatus: 'accepted',
        },
        {
          email: 'programador.analista34@ciudadmaderas.com', // datosUser.correo Sustituir correo
          responseStatus: 'accepted',
        },
        {
          email: 'programador.analista32@ciudadmaderas.com', // Estan para pruebas
          responseStatus: 'accepted',
        },
        {
          email: 'programador.analista12@ciudadmaderas.com', // Estan para pruebas
          responseStatus: 'accepted',
        },
        {
          email: 'tester.ti2@ciudadmaderas.com', // Estan para pruebas
          responseStatus: 'accepted',
        },
        {
          email: 'tester.ti3@ciudadmaderas.com', // Estan para pruebas
          responseStatus: 'accepted',
        },
      ],

      email: datosUser.correo,
    };

    create = await fetcherPost(create_appointment, data);

    if ((create.result && fundacion === 1) || (create.result && eventData.paciente.tipoPuesto === 'Operativa')) {
      const googleEvent = await fetcherPost(insert_google_event, googleData);
      fetcherPost(sendMail, mailMessage);

      if (googleEvent.result) {
        const updateData = {
          idCita: create.data,
          idEventoGoogle: googleEvent.data.id,
        };

        fetcherPost(insert_google_id, updateData);
      }
    }
  } else {
    create = { result: false, msg: 'Se debe agendar dentro de límite del horario laboral' };
  }

  return create;
}

// ----------------------------------------------------------------------

export async function updateAppointment(eventData, idUsuario) {
  let update = '';

  const start = dayjs(`${eventData.fechaInicio} ${eventData.hora_inicio}`).format(
    'YYYY/MM/DD HH:mm:ss'
  ); // fecha a la que se movera
  const end = dayjs(`${eventData.fechaFinal} ${eventData.hora_final}`).format(
    'YYYY/MM/DD HH:mm:ss'
  ); // fecha a la que se movera
  const now = dayjs(new Date()).format('YYYY/MM/DD HH:mm:ss');

  const dataValue = {
    titulo: eventData.title,
    id: eventData.id,
    idUsuario,
    fechaInicio: start,
    fechaFinal: end,
    idPaciente: eventData.paciente,
  };

  if (start > now) {
    update = fetcherPost(update_appointment, dataValue);
  } else {
    update = { result: false, msg: 'No se pueden mover las fechas a un dia anterior' };
  }

  return update;
}

// ----------------------------------------------------------------------

export async function cancelAppointment(currentEvent, id, cancelType, idUsuario) {
  const startStamp = dayjs(currentEvent.start).format('YYYY/MM/DD HH:mm:ss');
  let tituloEmail = '';
  let imagen = '';

  switch (cancelType) {
    case 7:
      tituloEmail = 'CANCELADO POR ESPECIALISTA';
      imagen = 'cancel.png';
      break;

    case 3:
      tituloEmail = 'PENALIZACIÓN';
      imagen = 'penalization.png';
      break;

    default:
      tituloEmail = 'CANCELACIÓN';
      imagen = 'cancel.png';
      break;
  }

  const data = {
    idCita: id,
    start: startStamp,
    tipo: cancelType,
    modificadoPor: idUsuario,
  };

  const mailMessage = {
    titulo: tituloEmail,
    imagen,
    fecha: dayjs(currentEvent?.start).format('DD/MM/YYYY'),
    horaInicio: dayjs(currentEvent?.start).format('HH:mm a'),
    horaFinal: dayjs(currentEvent?.end).format('HH:mm a'),
    beneficio: currentEvent.beneficio,
    especialista: currentEvent.especialista,
    view: 'email-cancelar',
    correo: currentEvent?.correo,
  };

  const delDate = await fetcherPost(cancel_appointment, data);

  if (delDate.result) {
    fetcherPost(sendMail, mailMessage);

    const eventGoogleData = {
      id: currentEvent?.idEventoGoogle,
      email: currentEvent?.correo,
    };

    fetcherPost(delete_google_event, eventGoogleData);
  }

  return delDate;
}

// ----------------------------------------------------------------------

export async function dropUpdate(args, idUsuario) {
  let update = '';
  const type = args.type === 'date' ? appointment_drop : occupied_drop;
  const oldStart = dayjs(args.oldStart).format('YYYY/MM/DD HH:mm:ss'); // fecha original del evento

  const data = {
    id: args.id,
    fechaInicio: dayjs(args.start).format('YYYY/MM/DD HH:mm:ss'),
    fechaFinal: dayjs(args.end).format('YYYY/MM/DD HH:mm:ss'),
    idUsuario,
    idPaciente: args.idPaciente,
    oldStart,
    estatus: args.estatus,
  };

  update = await fetcherPost(type, data);

  if (update.result) enqueueSnackbar(update.msg);
  else {
    enqueueSnackbar(update.msg, { variant: 'error' });
    reRender(); // se utiliza el rerender aqui parta que pueda regresar el evento en caso de no quedar
  }
}
// ----------------------------------------------------------------------

export async function endAppointment(currentEvent, reason, idUsuario) {
  let sede = currentEvent?.sede || 'virtual';
  let oficina = currentEvent?.oficina || 'virtual';
  const fundacion = currentEvent?.externo;

  if (fundacion === 1) {
    sede = 'Querétaro';
    oficina = 'Confirmado por especialista';
  }

  const data = {
    // datos que se envian para la cancelación
    idCita: currentEvent?.id,
    reason,
    idUsuario,
  };

  const mailData = {
    // datos que se envian al correo
    idCita: currentEvent?.id,
    tituloEmail: 'FINALIZACIÓN',
    temaEmail: 'Se ha finalizado tu cita en: ',
    especialidad: currentEvent?.beneficio,
    especialista: currentEvent?.especialista,
    sede,
    oficina,
    fecha: dayjs(currentEvent?.start).format('DD/MM/YYYY'),
    horaInicio: dayjs(currentEvent?.start).format('HH:mm A'),
    horaFinal: dayjs(currentEvent?.end).format('HH:mm A'),
    view: 'email-end',
    correo: currentEvent?.correo,
    link: 'https://prueba.gphsis.com/beneficiosmaderas/dashboard/calendariobeneficiario',
  };

  const update = await fetcherPost(end_appointment, data);
  if (update.result) {
    fetcherPost(sendMail, mailData);
  }

  return update;
}

// ----------------------------------------------------------------------

export function useGetMotivos(idPuesto) {
  const data = useSWR(get_reasons, (url) => fetcherPost(url, idPuesto), options);

  const memoizedValue = useMemo(
    () => ({
      data: data?.data || [],
    }),
    [data?.data]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetPending(idUsuario) {
  const { data, mutate: revalidate } = useSWR(get_pending_end, (url) =>
    fetcherPost(url, idUsuario)
  );

  const memoizedValue = useMemo(
    () => ({
      data: data || [],
      pendingsMutate: revalidate,
    }),
    [data, revalidate]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetEventReasons(idCita) {
  const { data, mutate: revalidate } = useSWR(get_event_reasons, (url) => fetcherPost(url, idCita));

  useEffect(() => {
    // esta función ayuda a que se de un trigger para traer de nuevo los eventos del mes, cada que cambia month
    revalidate();
  }, [idCita, revalidate]);

  const memoizedValue = useMemo(
    () => ({
      data: data || [],
      reasonsMutate: revalidate,
    }),
    [data, revalidate]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export async function reschedule(eventData, idDetalle, cancelType, datosUser) {
  let response = '';
  const { fundacion } = eventData; // para verificar si es fundacion Lamat
  let sede = eventData?.sede || 'virtual';
  let oficina = eventData?.oficina || 'virtual';

  const startStamp = dayjs(eventData.oldEventStart).format('YYYY/MM/DD HH:mm:ss');

  const fechaInicio = dayjs(`${eventData.fechaInicio} ${eventData.hora_inicio}`).format(
    'YYYY/MM/D HH:mm:ss'
  );
  const fechaFinal = dayjs(`${eventData.fechaInicio} ${eventData.hora_final}`).format(
    'YYYY/MM/D HH:mm:ss'
  );

  const fecha = dayjs(eventData.fechaInicio).format('DD/MM/YYYY');
  const horaInicio = dayjs(fechaInicio).format('HH:mm:ss');
  const horaFinal = dayjs(fechaFinal).format('HH:mm:ss');

  if (fundacion === 1) {
    sede = 'Querétaro';
    oficina = 'Confirmado por especialista';
  }

  const data = {
    idUsuario: datosUser.idUsuario,
    idPaciente: eventData.paciente,
    fechaInicio,
    fechaFinal,
    fechaCreacion: eventData.fechaCreacion,
    creadoPor: datosUser.idUsuario,
    titulo: eventData.title,
    modificadoPor: datosUser.idUsuario,
    idCatalogo: eventData.idAtencionXSede,
    fundacion,
    idDetalle,
    reagenda: 1,
    tipoPuesto: eventData.tipoPuesto,
    idEventoGoogle: eventData.idEventoGoogle,
    oldEventTipo: eventData.oldEventTipo,
    idSede: eventData.idSede,
    modalidad: eventData.modalidad
  };

  const cancelData = {
    idCita: eventData?.idCancelar,
    tipo: cancelType,
    start: startStamp,
    modificadoPor: datosUser.idUsuario,
  };

  const mailReschedule = {
    titulo: 'REAGENDAMIENTO DE CITA',
    beneficio: eventData.beneficio,
    especialista: eventData.especialista,
    sede,
    oficina,
    fecha,
    horaInicio,
    horaFinal,
    fechaOld: dayjs(eventData.oldEventStart).format('DD/MM/YYYY'),
    horaInicioOld: dayjs(eventData.oldEventStart).format('HH:mm: a'),
    horaFinalOld: dayjs(eventData.oldEventEnd).format('HH:mm: a'),
    view: 'email-reschedule',
    correo: eventData?.correo,
  };

  response = await fetcherPost(check_invoice, idDetalle);

  if (response.result) {
    response = await fetcherPost(create_appointment, data);

    if (response.result) {
      const del = await fetcherPost(cancel_appointment, cancelData);
      if (del.result) {
        fetcherPost(sendMail, mailReschedule);

        const dataGoogle = {
          start: dayjs(fechaInicio).format('YYYY-MM-DDTHH:mm:ss'),
          end: dayjs(fechaFinal).format('YYYY-MM-DDTHH:mm:ss'),
          id: eventData?.idEventoGoogle,
          email: eventData?.correo,
          attendees: [
            {
              email: 'programador.analista36@ciudadmaderas.com', // eventData.correo Sustituir correo
              responseStatus: 'accepted',
            },
            {
              email: 'programador.analista34@ciudadmaderas.com', // datosUser.correo Sustituir correo
              responseStatus: 'accepted',
            },
            {
              email: 'programador.analista32@ciudadmaderas.com', // Estan para pruebas
              responseStatus: 'accepted',
            },
            {
              email: 'programador.analista12@ciudadmaderas.com', // Estan para pruebas
              responseStatus: 'accepted',
            },
            {
              email: 'tester.ti2@ciudadmaderas.com', // Estan para pruebas
              responseStatus: 'accepted',
            },
            {
              email: 'tester.ti3@ciudadmaderas.com', // Estan para pruebas
              responseStatus: 'accepted',
            },
          ],
        };

        fetcherPost(update_google_event, dataGoogle);
      }
    }
  }

  return response;
}

// ----------------------------------------------------------------------

export async function UpdateDetallePaciente(idPaciente, idPuesto) {

  const data = {
    usuario: idPaciente,
    beneficio: idPuesto,
  };

  const update = fetcherPost(update_detalle_paciente, data);

  return update;
}
