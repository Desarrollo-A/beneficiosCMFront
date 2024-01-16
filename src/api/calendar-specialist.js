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
const update_appointment = endpoints.calendario.updateAppointment;
const delete_occupied = endpoints.calendario.deleteOccupied;
const cancel_appointment = endpoints.calendario.cancelAppointment;
const create_appointment = endpoints.calendario.createAppointment;
const appointment_drop = endpoints.calendario.appointmentDrop;
const occupied_drop = endpoints.calendario.occupiedDrop;
const end_appointment = endpoints.calendario.endAppointment;
const get_reasons = endpoints.calendario.getReasons;
const get_pending_end = endpoints.calendario.getPendingEnd;

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
  const month = (current.getMonth() + 1); // para obtener el mes que se debe se suma 1, ya que el default da 0
  
  const dataValue = {
    year,
    month,
    idUsuario: datosUser.idUsuario
  }

  const { data, isLoading, error, isValidating } = useSWR(get_all_events, url => fetcherPost(url, dataValue), options);

  useEffect(()=> { // esta función ayuda a que se de un trigger para traer de nuevo los eventos del mes, cada que cambia month
    reRender();
  },[month]);

  const memoizedValue = useMemo(() => {
    const events = data?.events?.map((event) => ({
      ...event,
      textColor: event?.color,
      type: event?.type,
      fechaInicio: event.start
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

export async function createCustom(eventData) {
  let create = '';
  const fechaInicio = dayjs(`${eventData.fechaInicio} ${eventData.hora_inicio}`).format('YYYY/MM/DD HH:mm:ss'); 
  const fechaFinal = dayjs(`${eventData.fechaFinal} ${eventData.hora_final}`).format('YYYY/MM/DD HH:mm:ss');

    const dataValue = {
        titulo: eventData.title,
        idUnico: eventData.id,
        idUsuario: datosUser.idUsuario,
        fechaInicio,
        fechaFinal,
        idEspecialista: datosUser.idUsuario,
    }
    
    create = fetcherPost(save_occupied, dataValue);
 
  return create;
}

// ----------------------------------------------------------------------

export async function updateCustom(eventData) {
  let update = '';
  
  const start = dayjs(`${eventData.fechaInicio} ${eventData.hora_inicio}`).format('YYYY/MM/DD HH:mm:ss'); // fecha a la que se movera
  const end = dayjs(`${eventData.fechaFinal} ${eventData.hora_final}`).format('YYYY/MM/DD HH:mm:ss');
  const now = dayjs(new Date()).format('YYYY/MM/DD HH:mm:ss');
  const oldStart = dayjs(`${eventData.newDate} ${eventData.hora_inicio}`).format('YYYY/MM/DD HH:mm:ss'); // fecha original del evento

  const dataValue = {
        id: eventData.id,
        fechaInicio: start,
        fechaFinal: end,
        titulo: eventData.title,
        idUsuario: datosUser.idUsuario,
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

export async function createAppointment(eventData){
  let create = '';
  const fechaInicio = dayjs(`${eventData.fechaInicio} ${eventData.hora_inicio}`).format('YYYY/MM/D HH:mm:ss'); 
  const fechaFinal = dayjs(`${eventData.fechaFinal} ${eventData.hora_final}`).format('YYYY/MM/D HH:mm:ss');

  const start = dayjs(`${eventData.newDate} ${eventData.hora_inicio}`).format('YYYY/MM/DD HH:mm:ss'); // fecha a la que se movera
  const now = dayjs(new Date()).format('YYYY/MM/DD HH:mm:ss');

  const data = {
        idUsuario: datosUser.idUsuario,
        idPaciente: eventData.paciente,
        fechaInicio,
        fechaFinal,
        creadoPor: datosUser.idUsuario,
        titulo: eventData.title,
        modificadoPor: datosUser.idUsuario,
        idCatalogo: eventData.idCatalogo
  };

  if(start > now){
    create = fetcherPost(create_appointment, data);
  }
  else{
    create = { result: false, msg: "No se puede crear en dias anteriores" };
  }

  return create;
}

// ----------------------------------------------------------------------

export async function updateAppointment(eventData) {
  let update = '';
  
  const start = dayjs(`${eventData.fechaInicio} ${eventData.hora_inicio}`).format('YYYY/MM/DD HH:mm:ss'); // fecha a la que se movera
  const end = dayjs(`${eventData.fechaFinal} ${eventData.hora_final}`).format('YYYY/MM/DD HH:mm:ss'); // fecha a la que se movera
  const now = dayjs(new Date()).format('YYYY/MM/DD HH:mm:ss');

  const dataValue = {
        titulo: eventData.title,
        id: eventData.id,
        idUsuario: datosUser.idUsuario,
        fechaInicio: start,
        fechaFinal: end,
        idPaciente : eventData.paciente
    }

      if(start > now){
        update = fetcherPost(update_appointment, dataValue);
      }
      else{
        update = { result: false, msg: "No se pueden mover las fechas a un dia anterior o actual" }
      }

    return update;
}

// ----------------------------------------------------------------------

export async function cancelAppointment(currentEvent, cancelType){
  const startStamp = dayjs(currentEvent.start).format('YYYY/MM/DD HH:mm:ss');

  const data = {
    idCita: currentEvent.id,
    startStamp,
    estatus: currentEvent.estatus,
    tipo: cancelType
  };

  const delDate = fetcherPost(cancel_appointment, data);

  return delDate;
}

// ----------------------------------------------------------------------

export async function dropUpdate(args){
  let update = ''; 
  const type = args.type === "date" ? appointment_drop : occupied_drop;
  const oldStart = dayjs(args.oldStart).format('YYYY/MM/DD HH:mm:ss'); // fecha original del evento

  const data = {
    id: args.id,
    fechaInicio: dayjs(args.start).format('YYYY/MM/DD HH:mm:ss'),
    fechaFinal: dayjs(args.end).format('YYYY/MM/DD HH:mm:ss'),
    idUsuario: datosUser.idUsuario,
    idPaciente: args.idPaciente,
    oldStart,
    estatus: args.estatus
  }
 
  update = await fetcherPost(type, data);

  if(update.result)
    enqueueSnackbar(update.msg);
  else{
    enqueueSnackbar(update.msg, {variant: "error"});
    reRender(); // se utiliza el rerender aqui parta que pueda regresar el evento en caso de no quedar
  }

}
// ----------------------------------------------------------------------

export async function endAppointment(id, reason){
  const data = {
    idCita: id,
    reason,
    idUsuario: datosUser.idUsuario
  }

  const update = fetcherPost(end_appointment, data);

  return update;
}

// ----------------------------------------------------------------------

export function useGetMotivos(){
  const data  = useSWR(get_reasons, url => fetcherPost(url, datosUser.idPuesto, {revalidateOnFocus: false, revalidateOnReconnect: true, refreshWhenHidden: false}));

  const memoizedValue = useMemo(() =>({
    data: data?.data || []
  }), [data?.data]);
  
  return memoizedValue;
}


export function useGetPending(){
  const data = useSWR(get_pending_end, url => fetcherPost(url, datosUser.idUsuario, { revalidateOnFocus: true, revalidateOnReconnect: true, refreshWhenHidden: false }));

  const momoizedValue = useMemo(() => ({
    data: data?.data
  }), [data?.data]);

  return momoizedValue;
}