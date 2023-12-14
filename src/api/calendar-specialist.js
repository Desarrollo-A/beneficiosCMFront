import dayjs from 'dayjs';
import { Base64 } from 'js-base64';
import useSWR, { mutate } from 'swr';
import { useMemo, useEffect } from 'react';
import { enqueueSnackbar } from 'notistack';

import { endpoints, fetcherInsert, fetcher_custom  } from 'src/utils/axios';

// ----------------------------------------------------------------------

// cadenas de url extraidas de lo que se encuentra en el axios
const getOccupied = endpoints.calendario.get_occupied;
const saveOccupied = endpoints.calendario.save_occupied;
const updateOccupied = endpoints.calendario.update_occupied;
const deleteOccupied = endpoints.calendario.delete_occupied;
const deleteDate = endpoints.calendario.delete_date;
const saveAppointment = endpoints.calendario.create_appointment;
const updateOnDrop = endpoints.calendario.update_on_drop;

const options = {
  revalidateIfStale: false,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  refreshInterval: 0
};

const datosUser = JSON.parse(Base64.decode(sessionStorage.getItem('accessToken').split('.')[2]));

// ----------------------------------------------------------------------

export async function reRender(){ // se separa la funcion del mutate unicamente para cuando se crea el evento (previsto en update)
  mutate(getOccupied);
}

// ----------------------------------------------------------------------

export function GetCustomEvents(current) {
  const year = current.getFullYear();
  const month = (current.getMonth() + 1); // para obtener el mes que se debe, ya que el default da 0
  
  const { data, isLoading, error, isValidating } = useSWR(getOccupied, url => fetcher_custom(url, year, month, datosUser.idUsuario), options);

  useEffect(()=> { // esta función ayuda a que se de un trigger para traer de nuevo los eventos del mes
    mutate(getOccupied);
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

    const data = {
        fecha,
        titulo: eventData.title,
        hora_inicio: eventData.hora_inicio,
        hora_final:  eventData.hora_final,
        id_unico: eventData.id,
        id_usuario: datosUser.idUsuario,
        fecha_inicio: `${fecha} ${eventData.hora_inicio}`,
        fecha_final: `${fecha} ${eventData.hora_final}`,
        id_especialista: datosUser.idUsuario
    }

    const create = fetcherInsert(saveOccupied, data);
 
  return create;
}

// ----------------------------------------------------------------------

export async function updateCustom(eventData) {
  let update = '';
  
  const data = {
        hora_inicio: eventData.hora_inicio,
        hora_final:  eventData.hora_final,
        titulo: eventData.title,
        id_unico: eventData.id,
        fecha_ocupado: eventData.newDate,
        id_usuario: datosUser.idUsuario,
        fecha_inicio: `${eventData.newDate} ${eventData.hora_inicio}`,
        fecha_final: `${eventData.newDate} ${eventData.hora_final}`,
        id_especialista: datosUser.idUsuario
    }
    
    if(dayjs(eventData.newDate).format('YYYY/M/DD') > dayjs(new Date()).format('YYYY/M/DD'))
      update = fetcherInsert(updateOccupied, data);
    else
      update = { status: false, message: "No se pueden mover las fechas a un dia anterior o actual" }

    return update;
}

// ----------------------------------------------------------------------

export async function deleteEvent(eventId) {

  const delEvent = fetcherInsert(deleteOccupied, eventId);

  return delEvent;
}

// ----------------------------------------------------------------------

export async function cancelDate(eventId){

  const delDate = fetcherInsert(deleteDate, eventId);

  return delDate;
}

// ----------------------------------------------------------------------

export async function createAppointment(fecha, eventData){

  const data = {
        fechaOcupado: fecha,
        idEspecialista: datosUser.idUsuario,
        idPaciente: eventData.usuario,
        fechaInicio: `${fecha} ${eventData.hora_inicio}`,
        fechaFinal: `${fecha} ${eventData.hora_final}`,
        creadoPor: datosUser.idUsuario,
        observaciones: eventData.title,
        modificadoPor: datosUser.idUsuario
  }

    const create = fetcherInsert(saveAppointment, data);

    return create;
}

// ----------------------------------------------------------------------

export async function dropUpdate(args){
  const tipo = args.color === "green" ? "cita" : "ocupado"; // para identificar si es cita u horario ocupado, mediante el color de la etiqueta

  const start = dayjs(args.start).format('YYYY/M/DD'); // fecha a la que se movera
  const oldStart = dayjs(args.oldStart).format('YYYY/M/DD'); // fecha original del evento

  const data = {
    id: args.id,
    fechaInicio: dayjs(args.start).format('YYYY/MM/DD HH:mm:ss'),
    fechaFinal: dayjs(args.end).format('YYYY/MM/DD HH:mm:ss'),
    idEspecialista: datosUser.idUsuario,
    tipo,
    start,
    oldStart
  }
  
  const update = await fetcherInsert(updateOnDrop, data);

  if(update.status)
    enqueueSnackbar(update.message);
  else{
    enqueueSnackbar(update.message, {variant: "error"});
    reRender(); // se utiliza el rerender aqui parta que pueda regresar el evento en caso de no quedar
  }
    

  return update;
}
