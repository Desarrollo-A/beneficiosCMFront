import { Base64 } from 'js-base64';
import useSWR, { mutate } from 'swr';
import { useMemo, useEffect } from 'react';

import { endpoints, fetcherInsert, fetcher_custom  } from 'src/utils/axios';

// ----------------------------------------------------------------------

// cadenas de url extraidas de lo que se encuentra en el axios
const getOccupied = endpoints.calendario.get_occupied;
const saveOccupied = endpoints.calendario.save_occupied;
const updateOccupied = endpoints.calendario.update_occupied;
const deleteOccupied = endpoints.calendario.delete_occupied;
const deleteDate = endpoints.calendario.delete_date;
const saveAppointment = endpoints.calendario.create_appointment;

const options = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
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
        id_usuario: datosUser.idUsuario
    }

    const create = fetcherInsert(saveOccupied, data);
 
  return create;
}

// ----------------------------------------------------------------------

export async function updateCustom(eventData) {
  
  const data = {
        hora_inicio: eventData.hora_inicio,
        hora_final:  eventData.hora_final,
        titulo: eventData.title,
        id_unico: eventData.id,
        fecha_ocupado: eventData.newDate
    }

    const update = fetcherInsert(updateOccupied, data);

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
