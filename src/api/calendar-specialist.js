import dayjs from 'dayjs';
import { Base64 } from 'js-base64';
import useSWR, { mutate } from 'swr';
import { useMemo, useEffect } from 'react';
import { enqueueSnackbar } from 'notistack';

import { endpoints, fetcherPost  } from 'src/utils/axios';

// ----------------------------------------------------------------------

// cadenas de url extraidas de lo que se encuentra en el axios
const get_all_events = endpoints.calendario.getAllEvents;
const save_occupied = endpoints.calendario.saveOccupied;
const update_occupied = endpoints.calendario.updateOccupied;
const delete_occupied = endpoints.calendario.deleteOccupied;
const cancel_appointment = endpoints.calendario.cancelAppointment;
const save_appointment = endpoints.calendario.createAppointment;
const appointment_drop = endpoints.calendario.appointmentDrop;
const occupied_drop = endpoints.calendario.occupiedDrop;

const options = {
  revalidateIfStale: false,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  refreshInterval: 0
};

const datosUser = JSON.parse(Base64.decode(sessionStorage.getItem('accessToken').split('.')[2]));

// ----------------------------------------------------------------------

export async function reRender(){ // se separa la funcion del mutate unicamente para cuando se crea el evento (previsto en update)
  mutate(get_all_events);
}

// ----------------------------------------------------------------------

export function GetCustomEvents(current) {
  const year = current.getFullYear();
  const month = (current.getMonth() + 1); // para obtener el mes que se debe, ya que el default da 0
  
  const dataValue = {
    year,
    month,
    idUsuario: datosUser.idUsuario
  }

  const { data, isLoading, error, isValidating } = useSWR(get_all_events, url => fetcherPost(url, dataValue), options);

  useEffect(()=> { // esta función ayuda a que se de un trigger para traer de nuevo los eventos del mes, cada que cambia month
    // mutate(getAllEvents);
    reRender();
  },[month]);

  const memoizedValue = useMemo(() => {
    const events = data?.events?.map((event) => ({
      ...event,
      textColor: event?.color ? event.color : 'red',
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

export async function createCustom(fecha, eventData) {
  const fecha_inicio = dayjs(`${fecha} ${eventData.hora_inicio}`).format('YYYY/MM/D HH:mm:ss');

    const dataValue = {
        fecha,
        titulo: eventData.title,
        hora_inicio: eventData.hora_inicio,
        hora_final:  eventData.hora_final,
        id_unico: eventData.id,
        id_usuario: datosUser.idUsuario,
        fecha_inicio,
        fecha_final: `${fecha} ${eventData.hora_final}`,
        id_especialista: datosUser.idUsuario
    }

    const create = fetcherPost(save_occupied, dataValue);
 
  return create;
}

// ----------------------------------------------------------------------

export async function updateCustom(eventData) {
  let update = '';
  
  const start = dayjs(`${eventData.newDate} ${eventData.hora_inicio}`).format('YYYY/MM/DD HH:mm:ss'); // fecha a la que se movera
  const now = dayjs(new Date()).format('YYYY/MM/DD HH:mm:ss');
  const oldStart = dayjs(`${eventData.newDate} ${eventData.hora_inicio}`).format('YYYY/MM/DD HH:mm:ss'); // fecha original del evento

  const dataValue = {
        hora_inicio: eventData.hora_inicio,
        hora_final:  eventData.hora_final,
        titulo: eventData.title,
        id: eventData.id,
        fecha_ocupado: eventData.newDate,
        id_usuario: datosUser.idUsuario,
        fecha_inicio: `${eventData.newDate} ${eventData.hora_inicio}`,
        fecha_final: `${eventData.newDate} ${eventData.hora_final}`,
        start,
        oldStart
    }

    if(oldStart > now){
      if(start > now){
        update = fetcherPost(update_occupied, dataValue);
      }
      else{
        update = { result: false, msg: "No se pueden mover las fechas a un dia anterior o actual" }
      }
    }
    else{
      update = { result: false, msg: "Las citas u horarios pasados no se pueden mover" }
    }

    return update;
}

// ----------------------------------------------------------------------

export async function deleteEvent(eventId) {

  const delEvent = fetcherPost(delete_occupied, eventId);

  return delEvent;
}

// ----------------------------------------------------------------------

export async function cancelDate(eventId){

  const delDate = fetcherPost(cancel_appointment, eventId);

  return delDate;
}

// ----------------------------------------------------------------------

export async function createAppointment(fecha, eventData){

  const data = {
        fecha,
        id_usuario: datosUser.idUsuario,
        id_paciente: eventData.usuario,
        fecha_inicio: `${fecha} ${eventData.hora_inicio}`,
        fecha_final: `${fecha} ${eventData.hora_final}`,
        creado_por: datosUser.idUsuario,
        observaciones: eventData.title,
        modificado_por: datosUser.idUsuario
  }

    const create = fetcherPost(save_appointment, data);

    return create;
}

// ----------------------------------------------------------------------

export async function dropUpdate(args){
  let update = '';
  const tipo = args.color === "green" ? "cita" : "ocupado"; // para identificar si es cita u horario ocupado, mediante el color de la etiqueta
  const start = dayjs(args.start).format('YYYY/MM/DD HH:mm:ss'); // fecha a la que se movera
  const now = dayjs(new Date()).format('YYYY/MM/DD HH:mm:ss');
  const old_start = dayjs(args.oldStart).format('YYYY/MM/DD HH:mm:ss'); // fecha original del evento

  const data = {
    id: args.id,
    fecha: dayjs(args.start).format('YYYY/MM/DD'),
    fecha_inicio: dayjs(args.start).format('YYYY/MM/DD HH:mm:ss'),
    fecha_final: dayjs(args.end).format('YYYY/MM/DD HH:mm:ss'),
    id_usuario: datosUser.idUsuario,
    start,
    old_start
  }

  if(old_start > now){
    if(start > now){
      if(tipo === "cita"){
        update = await fetcherPost(appointment_drop, data);
      }
      else{
        update = await fetcherPost(occupied_drop, data);
      }

      if(update.result)
        enqueueSnackbar(update.msg);
      else{
        enqueueSnackbar(update.msg, {variant: "error"});
        reRender(); // se utiliza el rerender aqui parta que pueda regresar el evento en caso de no quedar
      }
    }
    else{
      enqueueSnackbar("No se pueden mover las fechas a un dia anterior o actual", { variant: "error" });
      reRender();
    }
  }
  else{
    enqueueSnackbar("Las citas u horarios pasados no se pueden mover", {variant: "error"});
    reRender();
  }
}
