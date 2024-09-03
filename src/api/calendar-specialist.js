import dayjs from 'dayjs';
// import { Base64 } from 'js-base64';
import useSWR, { mutate } from 'swr';
import { useMemo, useEffect } from 'react';
import { enqueueSnackbar } from 'notistack';

import { endpoints, fetcherPost } from 'src/utils/axios';
import {
  horaCancun,
  horaTijuana,
  toLocalISOString,
  horaCancunAEstandar,
  horaTijuanaAEstandar,
  obtenerFechasConHoras,
} from 'src/utils/general';

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

// const session = localStorage.getItem('accessToken');
// const datosUser = session ? JSON.parse(Base64.decode(session.split('.')[2])) : [];

// ----------------------------------------------------------------------

export async function reRender() {
  // se separa la funcion del mutate unicamente para cuando se crea el evento (previsto en update)
  mutate(get_all_events);
}

// ----------------------------------------------------------------------

export function GetCustomEvents(current, idUsuario, idSede) {
  const year = current.getFullYear();
  const month = current.getMonth() + 1; // para obtener el mes que se debe se suma 1, ya que el default da 0

  const dataValue = {
    year,
    month,
    idUsuario,
  };

  const { data, isLoading, error, isValidating } = useSWR(
    get_all_events,
    (url) => fetcherPost(url, dataValue),
    options
  );

  if (data?.events?.length > 0) {
    data.events = data.events.map((item) => ({ ...item, id: item.id.toString() }));
  }

  useEffect(() => {
    // esta función ayuda a que se de un trigger para traer de nuevo los eventos del mes, cada que cambia month
    reRender();
  }, [month]);

  const memoizedValue = useMemo(() => {
    const events = data?.events?.map((event) => {
      if (event.type === 'date') {
        let startConverted = idSede === 11 ? horaTijuana(event.start) : horaCancun(event.start);
        startConverted = toLocalISOString(startConverted);
        startConverted = startConverted.slice(0, 19).replace('T', ' ');
        const inicioCita = idSede === 11 || idSede === 9 ? startConverted : event.start;
        let endConverted = idSede === 11 ? horaTijuana(event.end) : horaCancun(event.end);
        endConverted = toLocalISOString(endConverted);
        endConverted = endConverted.slice(0, 19).replace('T', ' ');
        const finCita = idSede === 11 || idSede === 9 ? endConverted : event.end;
        const fechasCitasReagendadas = obtenerFechasConHoras(event.fechasFolio);
        let fechas = '';
        fechasCitasReagendadas?.forEach((fecha) => {
          let fechaInicioCita = ''

          switch(idSede){
            case 11:
              fechaInicioCita = horaTijuana(fecha)
              break;
            
            case 9:
              fechaInicioCita = horaCancun(fecha)
              break;

              default:
                fechaInicioCita = fecha
                break;
          }
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
          textColor: event?.tipoCita === 1 && event?.estatus === 1 ? 'yellow' : event?.color,
          type: event?.type,
          fechaInicio: inicioCita,
          start: inicioCita,
          end: finCita,
          fechasFolio: fechas || event.fechasFolio,
        };
      }

      let startConverted = idSede === 11 ? horaTijuana(event.start) : horaCancun(event.start);
      startConverted = toLocalISOString(startConverted);
      startConverted = startConverted.slice(0, 19).replace('T', ' ');
      const inicioCita = idSede === 11 || idSede === 9 ? startConverted : event.start;

      function sumarRestarHora(fecha) {
        // Convertir la fecha a un objeto Date
        const fechaObjeto = new Date(fecha);

        if (idSede === 9) {
          fechaObjeto.setUTCHours(fechaObjeto.getUTCHours() + 1);
        } else if (idSede === 11) {
          fechaObjeto.setUTCHours(fechaObjeto.getUTCHours() - 1);
        }

        // Función auxiliar para formatear con ceros a la izquierda
        const pad = (num, size) => String(num).padStart(size, '0');

        // Obtener y formatear los componentes de la fecha y la hora
        const fechaFormateada = `${fechaObjeto.getFullYear()}-${pad(fechaObjeto.getMonth() + 1, 2)}-${pad(fechaObjeto.getDate(), 2)} ${pad(fechaObjeto.getHours(), 2)}:${pad(fechaObjeto.getMinutes(), 2)}:${pad(fechaObjeto.getSeconds(), 2)}.${pad(fechaObjeto.getMilliseconds(), 3)}`;

        return fechaFormateada;
      }

      const finCita = sumarRestarHora(event.end);

      const fechasCitasReagendadas = obtenerFechasConHoras(event.fechasFolio);
      let fechas = '';
      fechasCitasReagendadas?.forEach((fecha) => {
        const fechaInicioCita = idSede === 11 ? horaTijuana(fecha) : horaCancun(fecha);
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
        textColor: event?.tipoCita === 1 && event?.estatus === 1 ? 'yellow' : event?.color,
        type: event?.type,
        fechaInicio: inicioCita,
        start: inicioCita,
        end: finCita,
        fechasFolio: fechas || event.fechasFolio,
      };
    });

    return {
      events: events || [],
      eventsLoading: isLoading || isValidating,
      eventsError: error,
      eventsValidating: isValidating,
      eventsEmpty: !isLoading && !data?.events?.length,
    };
  }, [data?.events, error, isLoading, isValidating, idSede]);

  return memoizedValue;
}

// ----------------------------------------------------------------------

export async function createCustom(eventData, idUsuario, idSede) {
  let create = '';

  let fechaInicioCita = eventData.fechaInicio;
  let fechaFinCita = eventData.fechaFinal;
  let horaInicioCita = eventData.hora_inicio;
  let horaFinCita = eventData.hora_final;

  if (idSede === 11) {
    const partesInicio = eventData.hora_inicio.split(':');
    const inicioCita = new Date(`${eventData.fechaInicio} ${eventData.hora_inicio}`);
    inicioCita.setHours(partesInicio[0], partesInicio[1], partesInicio[2]);

    const partesFinal = eventData.hora_final.split(':');
    const finCita = new Date(`${eventData.fechaFinal} ${eventData.hora_final}`);
    finCita.setHours(partesFinal[0], partesFinal[1], partesFinal[2]);

    // Resultado en fecha tipo DATE
    fechaInicioCita = horaTijuanaAEstandar(inicioCita);
    fechaFinCita = horaTijuanaAEstandar(finCita);

    let horasI = fechaInicioCita.getHours();
    let minutosI = fechaInicioCita.getMinutes();
    let segundosI = fechaInicioCita.getSeconds();

    horasI = horasI < 10 ? `0${horasI}` : horasI;
    minutosI = minutosI < 10 ? `0${minutosI}` : minutosI;
    segundosI = segundosI < 10 ? `0${segundosI}` : segundosI;

    let horasF = fechaFinCita.getHours();
    let minutosF = fechaFinCita.getMinutes();
    let segundosF = fechaFinCita.getSeconds();

    horasF = horasF < 10 ? `0${horasF}` : horasF;
    minutosF = minutosF < 10 ? `0${minutosF}` : minutosF;
    segundosF = segundosF < 10 ? `0${segundosF}` : segundosF;

    // Resultado en horas en string
    horaInicioCita = `${horasI}:${minutosI}:${segundosI}`;
    horaFinCita = `${horasF}:${minutosF}:${segundosF}`;
  }

  if (idSede === 9) {
    const partesInicio = eventData.hora_inicio.split(':');
    const inicioCita = new Date(`${eventData.fechaInicio} ${eventData.hora_inicio}`);
    inicioCita.setHours(partesInicio[0], partesInicio[1], partesInicio[2]);

    const partesFinal = eventData.hora_final.split(':');
    const finCita = new Date(`${eventData.fechaFinal} ${eventData.hora_final}`);
    finCita.setHours(partesFinal[0], partesFinal[1], partesFinal[2]);

    // Resultado en fecha tipo DATE
    fechaInicioCita = horaCancunAEstandar(inicioCita);
    fechaFinCita = horaCancunAEstandar(finCita);

    let horasI = fechaInicioCita.getHours();
    let minutosI = fechaInicioCita.getMinutes();
    let segundosI = fechaInicioCita.getSeconds();

    horasI = horasI < 10 ? `0${horasI}` : horasI;
    minutosI = minutosI < 10 ? `0${minutosI}` : minutosI;
    segundosI = segundosI < 10 ? `0${segundosI}` : segundosI;

    let horasF = fechaFinCita.getHours();
    let minutosF = fechaFinCita.getMinutes();
    let segundosF = fechaFinCita.getSeconds();

    horasF = horasF < 10 ? `0${horasF}` : horasF;
    minutosF = minutosF < 10 ? `0${minutosF}` : minutosF;
    segundosF = segundosF < 10 ? `0${segundosF}` : segundosF;

    // Resultado en horas en string
    horaInicioCita = `${horasI}:${minutosI}:${segundosI}`;
    horaFinCita = `${horasF}:${minutosF}:${segundosF}`;
  }

  const fechaInicio = dayjs(`${eventData.fechaInicio} ${horaInicioCita}`).format(
    'YYYY/MM/DD HH:mm:ss'
  );
  const fechaFinal = dayjs(`${eventData.fechaFinal} ${horaFinCita}`).format('YYYY/MM/DD HH:mm:ss');

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

export async function createAppointment(eventData, modalitie, datosUser, defaultHour) {
  let create = '';
  let abreviatura = '';
  let especialidad = '';
  let sede = modalitie?.sede || 'virtual';
  let oficina = modalitie?.oficina || 'virtual';
  // const precio = 0.0;

  /* const organizador = eventData.paciente.correo
    ? 'programador.analista36@ciudadmaderas.com'
    : 'programador.analista12@ciudadmaderas.com'; */
  const organizador = eventData.paciente.correo; // Variable correcta

  const correosNotificar =
    /* eventData.paciente.correo */
    /* ?  */ [
      {
        email: datosUser.correo, // 'programador.analista32@ciudadmaderas.com' Sustituir correo
        responseStatus: 'accepted',
      },
      /* {
          email: 'programador.analista12@ciudadmaderas.com', // eventData.paciente.correo Sustituir correo
          responseStatus: 'accepted',
        }, */
    ];
  /* : [
        {
          email: 'programador.analista36@ciudadmaderas.com', // eventData.paciente.correo Sustituir correo
          responseStatus: 'accepted',
        },
        {
          email: 'programador.analista12@ciudadmaderas.com', // eventData.paciente.correo Sustituir correo
          responseStatus: 'accepted',
        },
      ]; */

  let fechaInicioCita = eventData.fechaInicio;
  let fechaFinCita = eventData.fechaFinal;
  let horaInicioCita = eventData.hora_inicio;
  let horaFinCita = eventData.hora_final;

  if (datosUser?.idSede === 11) {
    const partesInicio = eventData.hora_inicio.split(':');
    const inicioCita = new Date(`${eventData.fechaInicio} ${eventData.hora_inicio}`);
    inicioCita.setHours(partesInicio[0], partesInicio[1], partesInicio[2]);

    const partesFinal = eventData.hora_final.split(':');
    const finCita = new Date(`${eventData.fechaFinal} ${eventData.hora_final}`);
    finCita.setHours(partesFinal[0], partesFinal[1], partesFinal[2]);

    // Resultado en fecha tipo DATE
    fechaInicioCita = horaTijuanaAEstandar(inicioCita);
    fechaFinCita = horaTijuanaAEstandar(finCita);

    let horasI = fechaInicioCita.getHours();
    let minutosI = fechaInicioCita.getMinutes();
    let segundosI = fechaInicioCita.getSeconds();

    horasI = horasI < 10 ? `0${horasI}` : horasI;
    minutosI = minutosI < 10 ? `0${minutosI}` : minutosI;
    segundosI = segundosI < 10 ? `0${segundosI}` : segundosI;

    let horasF = fechaFinCita.getHours();
    let minutosF = fechaFinCita.getMinutes();
    let segundosF = fechaFinCita.getSeconds();

    horasF = horasF < 10 ? `0${horasF}` : horasF;
    minutosF = minutosF < 10 ? `0${minutosF}` : minutosF;
    segundosF = segundosF < 10 ? `0${segundosF}` : segundosF;

    // Resultado en horas en string
    horaInicioCita = `${horasI}:${minutosI}:${segundosI}`;
    horaFinCita = `${horasF}:${minutosF}:${segundosF}`;
  }
  if (datosUser?.idSede === 9) {
    const partesInicio = eventData.hora_inicio.split(':');
    const inicioCita = new Date(`${eventData.fechaInicio} ${eventData.hora_inicio}`);
    inicioCita.setHours(partesInicio[0], partesInicio[1], partesInicio[2]);

    const partesFinal = eventData.hora_final.split(':');
    const finCita = new Date(`${eventData.fechaFinal} ${eventData.hora_final}`);
    finCita.setHours(partesFinal[0], partesFinal[1], partesFinal[2]);

    // Resultado en fecha tipo DATE
    fechaInicioCita = horaCancunAEstandar(inicioCita);
    fechaFinCita = horaCancunAEstandar(finCita);

    let horasI = fechaInicioCita.getHours();
    let minutosI = fechaInicioCita.getMinutes();
    let segundosI = fechaInicioCita.getSeconds();

    horasI = horasI < 10 ? `0${horasI}` : horasI;
    minutosI = minutosI < 10 ? `0${minutosI}` : minutosI;
    segundosI = segundosI < 10 ? `0${segundosI}` : segundosI;

    let horasF = fechaFinCita.getHours();
    let minutosF = fechaFinCita.getMinutes();
    let segundosF = fechaFinCita.getSeconds();

    horasF = horasF < 10 ? `0${horasF}` : horasF;
    minutosF = minutosF < 10 ? `0${minutosF}` : minutosF;
    segundosF = segundosF < 10 ? `0${segundosF}` : segundosF;

    // Resultado en horas en string
    horaInicioCita = `${horasI}:${minutosI}:${segundosI}`;
    horaFinCita = `${horasF}:${minutosF}:${segundosF}`;
  }

  const fechaInicio = dayjs(`${eventData.fechaInicio} ${horaInicioCita}`).format(
    'YYYY/MM/DD HH:mm:ss'
  );
  const fechaFinal = dayjs(`${eventData.fechaFinal} ${horaFinCita}`).format('YYYY/MM/DD HH:mm:ss');
  const fundacion = eventData.paciente.externo;

  const start = dayjs(`${eventData.newDate} ${eventData.hora_inicio}`).format(
    'YYYY/MM/DD HH:mm:ss'
  ); // fecha a la que se movera
  const now = dayjs(new Date()).format('YYYY/MM/DD HH:mm:ss');

  const fecha = dayjs(eventData.fechaInicio).format('DD/MM/YYYY');
  const horaInicio = dayjs(eventData.fechaInicio).format('HH:mm a'); // Nadamas sirve para el mail
  const horaFinal = dayjs(eventData.fechaFinal).format('HH:mm a'); // Nadamas sirve para el mail

  let bussinessHours = true;

  switch (datosUser.idPuesto) {
    case 537:
      especialidad = 'nutrición';
      abreviatura = 'NUTR';
      break;

    case 585:
      especialidad = 'psicología';
      abreviatura = 'PSIC';
      break;

    case 686:
      especialidad = 'guía espiritual';
      abreviatura = 'GUIA';
      break;

    case 158:
      especialidad = 'quantum balance';
      abreviatura = 'QUAN';
      break;

    default:
      especialidad = 'NA';
      break;
  }

  if (fundacion === 1 || fundacion === '1') {
    sede = 'Querétaro';
    oficina = 'Confirmado por especialista';
  }

  // Compara las horas de la cita con el horario del especialista, ambas estan en formato tijuana.
  if (
    !(
      eventData.hora_inicio >= defaultHour.horaInicio &&
      eventData.hora_final <= defaultHour.horaFinal &&
      eventData.hora_final > eventData.hora_inicio
    )
  ) {
    bussinessHours = false;
  }

  if (start > now && bussinessHours) {
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
      idDetalle: 0,
      especialidad,
      reagenda: 0,
      tipoPuesto: eventData.paciente.tipoPuesto,
      idSede: eventData.paciente.idSede,
      modalidad: fundacion === 1 || fundacion === '1' ? 1 : modalitie.modalidad,
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
      correo: [eventData.paciente.correo], // [eventData.paciente.correo],
      idUsuario: datosUser.idUsuario,
    };

    const googleData = {
      title: eventData.title,
      start: dayjs(fechaInicio).format('YYYY-MM-DDTHH:mm:ss'),
      end: dayjs(fechaFinal).format('YYYY-MM-DDTHH:mm:ss'),
      location: `${oficina}, ${sede}`,
      description: `Cita agendada en: ${especialidad}`,
      attendees: correosNotificar,

      email: organizador,
    };

    create = await fetcherPost(create_appointment, data);

    if (create.result && (fundacion === 1 || fundacion === '1')) {
      const dataTransaction = {
        usuario: eventData.paciente.idUsuario,
        folio: `${eventData.paciente.idUsuario}${dayjs(new Date()).format('HHmmssYYYYMMDD')}`,
        referencia: `U${eventData.paciente.idUsuario}-${abreviatura}-E${datosUser.idPuesto}-C${create.data}`,
        concepto: 1, // 1: citas
        cantidad: 50.0,
        metodoPago: 7, // 7: No aplica (gratis)
        estatusPago: 1, // 1:cobrado
        idCita: create.data,
      };

      await fetcherPost(registar_transaccion, dataTransaction);
    }

    if (create.result && (fundacion === 1 || fundacion === '1')) {
      const googleEvent = await fetcherPost(insert_google_event, googleData);

      if (eventData.paciente.correo) {
        fetcherPost(sendMail, mailMessage);
      }

      if (googleEvent.result) {
        const updateData = {
          idCita: create.data,
          idEventoGoogle: googleEvent.data.id,
        };

        fetcherPost(insert_google_id, updateData);
      }
    }
    if (create.result && (fundacion === 0 || fundacion === '0')) {
      const pendingMail = {
        especialidad,
        especialista: datosUser.nombre,
        fecha,
        horaInicio,
        horaFinal,
        view: 'email-pending-appointment',
        oficina,
        sede,
        tituloEmail: 'Reservación pendiente',
        temaEmail: `Se te ha agendado una cita para el beneficio de ${especialidad} con un estatus pendiente de pago.`,
        correo: [eventData.paciente.correo], // [eventData.paciente.correo],
        idUsuario: datosUser.idUsuario,
      };
      if (eventData.paciente.correo) {
        fetcherPost(sendMail, pendingMail);
      }
    }
  } else {
    create = { result: false, msg: 'Se debe agendar dentro de límite del horario laboral' };
  }

  return create;
}

// ----------------------------------------------------------------------

export async function updateAppointment(eventData, idUsuario, idSede) {
  let update = '';

  let fechaInicioCita = eventData.fechaInicio; // todo tipo date
  let fechaFinCita = eventData.fechaFinal; // todo tipo date
  let horaInicioCita = eventData.hora_inicio;
  let horaFinCita = eventData.hora_final;

  if (idSede === 11) {
    const partesInicio = eventData.hora_inicio.split(':');
    const inicioCita = new Date(`${eventData.fechaInicio} ${eventData.hora_inicio}`);
    inicioCita.setHours(partesInicio[0], partesInicio[1], partesInicio[2]);

    const partesFinal = eventData.hora_final.split(':');
    const finCita = new Date(`${eventData.fechaFinal} ${eventData.hora_final}`);
    finCita.setHours(partesFinal[0], partesFinal[1], partesFinal[2]);

    // Resultado en fecha tipo DATE
    fechaInicioCita = horaTijuanaAEstandar(inicioCita);
    fechaFinCita = horaTijuanaAEstandar(finCita);

    let horasI = fechaInicioCita.getHours();
    let minutosI = fechaInicioCita.getMinutes();
    let segundosI = fechaInicioCita.getSeconds();

    horasI = horasI < 10 ? `0${horasI}` : horasI;
    minutosI = minutosI < 10 ? `0${minutosI}` : minutosI;
    segundosI = segundosI < 10 ? `0${segundosI}` : segundosI;

    let horasF = fechaFinCita.getHours();
    let minutosF = fechaFinCita.getMinutes();
    let segundosF = fechaFinCita.getSeconds();

    horasF = horasF < 10 ? `0${horasF}` : horasF;
    minutosF = minutosF < 10 ? `0${minutosF}` : minutosF;
    segundosF = segundosF < 10 ? `0${segundosF}` : segundosF;

    // Resultado en horas en string
    horaInicioCita = `${horasI}:${minutosI}:${segundosI}`;
    horaFinCita = `${horasF}:${minutosF}:${segundosF}`;
  }
  if (idSede === 9) {
    const partesInicio = eventData.hora_inicio.split(':');
    const inicioCita = new Date(`${eventData.fechaInicio} ${eventData.hora_inicio}`);
    inicioCita.setHours(partesInicio[0], partesInicio[1], partesInicio[2]);

    const partesFinal = eventData.hora_final.split(':');
    const finCita = new Date(`${eventData.fechaFinal} ${eventData.hora_final}`);
    finCita.setHours(partesFinal[0], partesFinal[1], partesFinal[2]);

    // Resultado en fecha tipo DATE
    fechaInicioCita = horaCancunAEstandar(inicioCita);
    fechaFinCita = horaCancunAEstandar(finCita);

    let horasI = fechaInicioCita.getHours();
    let minutosI = fechaInicioCita.getMinutes();
    let segundosI = fechaInicioCita.getSeconds();

    horasI = horasI < 10 ? `0${horasI}` : horasI;
    minutosI = minutosI < 10 ? `0${minutosI}` : minutosI;
    segundosI = segundosI < 10 ? `0${segundosI}` : segundosI;

    let horasF = fechaFinCita.getHours();
    let minutosF = fechaFinCita.getMinutes();
    let segundosF = fechaFinCita.getSeconds();

    horasF = horasF < 10 ? `0${horasF}` : horasF;
    minutosF = minutosF < 10 ? `0${minutosF}` : minutosF;
    segundosF = segundosF < 10 ? `0${segundosF}` : segundosF;

    // Resultado en horas en string
    horaInicioCita = `${horasI}:${minutosI}:${segundosI}`;
    horaFinCita = `${horasF}:${minutosF}:${segundosF}`;
  }
  const start = dayjs(`${eventData.fechaInicio} ${horaInicioCita}`).format('YYYY/MM/DD HH:mm:ss'); // fecha a la que se movera
  const end = dayjs(`${eventData.fechaFinal} ${horaFinCita}`).format('YYYY/MM/DD HH:mm:ss'); // fecha a la que se movera
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

export async function cancelAppointment(currentEvent, id, cancelType, idUsuario, idSede) {
  const startStamp = dayjs(currentEvent.start).format('YYYY/MM/DD HH:mm:ss');
  let tituloEmail = '';
  let imagen = '';

  const organizador = currentEvent?.correo; // Variable correcta // colaborador

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

  // Modificar startStamp, currentEvent?.start, currentEvent?.end
  let fechaInicioCita = currentEvent?.start;

  if (idSede === 11) {
    fechaInicioCita = horaTijuanaAEstandar(currentEvent?.start);
    fechaInicioCita = dayjs(fechaInicioCita).format('YYYY/MM/DD HH:mm:ss');
  }
  if (idSede === 9) {
    fechaInicioCita = horaCancunAEstandar(currentEvent?.start);
    fechaInicioCita = dayjs(fechaInicioCita).format('YYYY/MM/DD HH:mm:ss');
  }

  const data = {
    idCita: id,
    start: idSede === 11 ? fechaInicioCita : startStamp,
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
    correo: [currentEvent?.correo], // [currentEvent?.correo*,
    idUsuario,
  };

  const delDate = await fetcherPost(cancel_appointment, data);

  if (delDate.result) {
    if (currentEvent?.correo) {
      fetcherPost(sendMail, mailMessage);
    }

    const eventGoogleData = {
      id: currentEvent?.idEventoGoogle,
      email: organizador,
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

  if (fundacion === 1 || fundacion === '1') {
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
    correo: [currentEvent?.correo] /* ['programador.analista36@ciudadmaderas.com'], */,
    link: 'https://beneficiosmaderas.gphsis.com/',
    idUsuario,
  };

  const update = await fetcherPost(end_appointment, data);
  if (update.result) {
    if (currentEvent?.correo) {
      fetcherPost(sendMail, mailData);
    }
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

export async function reschedulee(eventData, idDetalle, cancelType, datosUser, defaultHour) {
  let response = '';
  const { fundacion } = eventData; // para verificar si es fundacion Lamat
  let sede = eventData?.sede || 'virtual';
  let oficina = eventData?.oficina || 'virtual';

  /* const organizador = eventData?.correo
    ? 'programador.analista36@ciudadmaderas.com'
    : 'programador.analista12@ciudadmaderas.com'; */

  const organizador = eventData.paciente.correo;

  const correosNotificar = /* eventData?.correo
    ?  */ [
    {
      email: eventData.paciente.correo, // eventData.paciente.correo Sustituir correo
      responseStatus: 'accepted',
    },
    /* {
          email: 'programador.analista12@ciudadmaderas.com', // eventData.paciente.correo Sustituir correo
          responseStatus: 'accepted',
        }, */
  ];
  /* : [
        {
          email: 'programador.analista36@ciudadmaderas.com', // eventData.paciente.correo Sustituir correo
          responseStatus: 'accepted',
        },
        {
          email: 'programador.analista12@ciudadmaderas.com', // eventData.paciente.correo Sustituir correo
          responseStatus: 'accepted',
        },
      ]; */

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

  if (fundacion === 1 || fundacion === '1') {
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
    modalidad: eventData.modalidad,
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
    correo: [eventData?.correo] /* ['programador.analista36@ciudadmaderas.com'], */,
    idUsuario: datosUser?.idUsuario,
  };

  if (
    !(
      eventData.hora_inicio >= defaultHour.horaInicio &&
      eventData.hora_final <= defaultHour.horaFinal &&
      eventData.hora_final > eventData.hora_inicio
    )
  ) {
    enqueueSnackbar('Horas seleccionadas fuera de horario', { variant: 'error' });
  } else {
    response = await fetcherPost(check_invoice, idDetalle);

    if (response.result) {
      response = await fetcherPost(create_appointment, data);

      if (response.result) {
        const del = await fetcherPost(cancel_appointment, cancelData);
        if (del.result) {
          if (eventData?.correo) {
            fetcherPost(sendMail, mailReschedule);
          }

          const dataGoogle = {
            start: dayjs(fechaInicio).format('YYYY-MM-DDTHH:mm:ss'),
            end: dayjs(fechaFinal).format('YYYY-MM-DDTHH:mm:ss'),
            id: eventData?.idEventoGoogle,
            email: organizador,
            attendees: correosNotificar,
          };

          fetcherPost(update_google_event, dataGoogle);
        }
      }
    }
  }

  return response;
}

// ----------------------------------------------------------------------

export async function reschedule(eventData, idDetalle, cancelType, datosUser, defaultHour) {
  let response = '';
  const { fundacion } = eventData; // para verificar si es fundacion Lamat
  let sede = eventData?.sede || 'virtual';
  let oficina = eventData?.oficina || 'virtual';

  const organizador = eventData?.correo;

  const correosNotificar = [
    {
      email: datosUser.correo, // eventData.paciente.correo Sustituir correo
      responseStatus: 'accepted',
    },
  ];

  let fechaInicioCita = eventData?.fechaInicio; // todo tipo date
  let fechaFinCita = eventData?.hora_inicio; // todo tipo date
  let horaInicioCita = eventData?.hora_inicio;
  let horaFinCita = eventData?.hora_final;

  if (datosUser?.idSede === 11) {
    const partesInicio = eventData.hora_inicio.split(':');
    const inicioCita = new Date(`${eventData.fechaInicio} ${eventData.hora_inicio}`);
    inicioCita.setHours(partesInicio[0], partesInicio[1], partesInicio[2]);

    const partesFinal = eventData.hora_final.split(':');
    const finCita = new Date(`${eventData.fechaInicio} ${eventData.hora_final}`);
    finCita.setHours(partesFinal[0], partesFinal[1], partesFinal[2]);

    // Resultado en fecha tipo DATE
    fechaInicioCita = horaTijuanaAEstandar(inicioCita);
    fechaFinCita = horaTijuanaAEstandar(finCita);

    let horasI = fechaInicioCita.getHours();
    let minutosI = fechaInicioCita.getMinutes();
    let segundosI = fechaInicioCita.getSeconds();

    horasI = horasI < 10 ? `0${horasI}` : horasI;
    minutosI = minutosI < 10 ? `0${minutosI}` : minutosI;
    segundosI = segundosI < 10 ? `0${segundosI}` : segundosI;

    let horasF = fechaFinCita.getHours();
    let minutosF = fechaFinCita.getMinutes();
    let segundosF = fechaFinCita.getSeconds();

    horasF = horasF < 10 ? `0${horasF}` : horasF;
    minutosF = minutosF < 10 ? `0${minutosF}` : minutosF;
    segundosF = segundosF < 10 ? `0${segundosF}` : segundosF;

    // Resultado en horas en string
    horaInicioCita = `${horasI}:${minutosI}:${segundosI}`;
    horaFinCita = `${horasF}:${minutosF}:${segundosF}`;
  }

  if (datosUser?.idSede === 9) {
    const partesInicio = eventData.hora_inicio.split(':');
    const inicioCita = new Date(`${eventData.fechaInicio} ${eventData.hora_inicio}`);
    inicioCita.setHours(partesInicio[0], partesInicio[1], partesInicio[2]);

    const partesFinal = eventData.hora_final.split(':');
    const finCita = new Date(`${eventData.fechaInicio} ${eventData.hora_final}`);
    finCita.setHours(partesFinal[0], partesFinal[1], partesFinal[2]);

    // Resultado en fecha tipo DATE
    fechaInicioCita = horaCancunAEstandar(inicioCita);
    fechaFinCita = horaCancunAEstandar(finCita);

    let horasI = fechaInicioCita.getHours();
    let minutosI = fechaInicioCita.getMinutes();
    let segundosI = fechaInicioCita.getSeconds();

    horasI = horasI < 10 ? `0${horasI}` : horasI;
    minutosI = minutosI < 10 ? `0${minutosI}` : minutosI;
    segundosI = segundosI < 10 ? `0${segundosI}` : segundosI;

    let horasF = fechaFinCita.getHours();
    let minutosF = fechaFinCita.getMinutes();
    let segundosF = fechaFinCita.getSeconds();

    horasF = horasF < 10 ? `0${horasF}` : horasF;
    minutosF = minutosF < 10 ? `0${minutosF}` : minutosF;
    segundosF = segundosF < 10 ? `0${segundosF}` : segundosF;

    // Resultado en horas en string
    horaInicioCita = `${horasI}:${minutosI}:${segundosI}`;
    horaFinCita = `${horasF}:${minutosF}:${segundosF}`;
  }

  const startStamp = dayjs(eventData.oldEventStart).format('YYYY/MM/DD HH:mm:ss');

  const fechaInicio =
    datosUser.idSede === 11
      ? dayjs(`${eventData.fechaInicio} ${horaInicioCita}`).format('YYYY/MM/D HH:mm:ss')
      : dayjs(`${eventData.fechaInicio} ${eventData.hora_inicio}`).format('YYYY/MM/D HH:mm:ss');
  const fechaFinal =
    datosUser.idSede === 11
      ? dayjs(`${eventData.fechaInicio} ${horaFinCita}`).format('YYYY/MM/D HH:mm:ss')
      : dayjs(`${eventData.fechaInicio} ${eventData.hora_final}`).format('YYYY/MM/D HH:mm:ss');

  const fecha = dayjs(eventData.fechaInicio).format('DD/MM/YYYY');
  const horaInicio = dayjs(fechaInicio).format('HH:mm:ss');
  const horaFinal = dayjs(fechaFinal).format('HH:mm:ss');

  if (fundacion === 1 || fundacion === '1') {
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
    modalidad: eventData.modalidad,
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
    correo: [organizador],
    idUsuario: datosUser?.idUsuario,
  };

  if (
    !(
      eventData.hora_inicio >= defaultHour.horaInicio.split('.')[0] &&
      eventData.hora_final <= defaultHour.horaFinal.split('.')[0] &&
      eventData.hora_final > eventData.hora_inicio
    )
  ) {
    enqueueSnackbar('Horas seleccionadas fuera de horario', { variant: 'error' });
  } else {
    response = await fetcherPost(check_invoice, idDetalle);

    if (response.result) {
      response = await fetcherPost(create_appointment, data);

      if (response.result) {
        const del = await fetcherPost(cancel_appointment, cancelData);
        if (del.result) {
          if (eventData?.correo) {
            fetcherPost(sendMail, mailReschedule);
          }

          const dataGoogle = {
            start: dayjs(fechaInicio).format('YYYY-MM-DDTHH:mm:ss'),
            end: dayjs(fechaFinal).format('YYYY-MM-DDTHH:mm:ss'),
            id: eventData?.idEventoGoogle,
            email: organizador,
            attendees: correosNotificar,
          };

          fetcherPost(update_google_event, dataGoogle);
        }
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
