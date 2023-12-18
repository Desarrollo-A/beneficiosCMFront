import dayjs from 'dayjs';
import axios from 'axios';
import { useMemo } from 'react';
import { Base64 } from 'js-base64';
import useSWR, { mutate } from 'swr';

import { endpoints, fetcherGet, fetcherPost } from 'src/utils/axios';

// ----------------------------------------------------------------------

const URL = endpoints.calendar;
const URLC = endpoints.extra;

const options = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

const datosUser = JSON.parse(Base64.decode(sessionStorage.getItem('accessToken').split('.')[2]));

// ----------------------------------------------------------------------

export function useGetBenefits(sede) {
  const URL_BENEFITS = [endpoints.benefits.list]
  const { data, mutate: revalidate, isLoading, error, isValidating } = useSWR(URL_BENEFITS, url => fetcherPost(url, {sede}));
  
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

export function useGetEspecialists(sede, beneficio) {
  const URL_ESPECIALISTA = [endpoints.especialistas.list];
  const { data, mutate: revalidate, isLoading, error, isValidating } = useSWR(URL_ESPECIALISTA, url =>  fetcherPost(url, {sede, beneficio}));

  const memoizedValue = useMemo(
    () => ({
      data: data?.data || [],
      especialistaLoading: isLoading,
      especialistaError: error,
      especialistaValidating: isValidating,
      especialistaEmpty: !isLoading && !data?.data?.length,
      especialistaMutate: revalidate,
    }),
    [data?.data, error, isLoading, isValidating, revalidate]
  );

  return memoizedValue;
}

export function useGetModalities(sede, especialista) {
  const URL_MODALITIES = [endpoints.especialistas.modalities]
  const { data, mutate: revalidate, isLoading, error, isValidating } = useSWR(URL_MODALITIES, url => fetcherPost(url, {sede, especialista}));

  const memoizedValue = useMemo(
    () => ({
      data: data?.data || [],
      modalitiesLoading: isLoading,
      modalitiesError: error,
      modalitiesValidating: isValidating,
      modalitiesEmpty: !isLoading && !data?.data?.length,
      modalitiesMutate: revalidate,
    }),
    [data?.data, error, isLoading, isValidating, revalidate]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// ----------------------------------------------------------------------

export async function createCustom(fecha, eventData) {

  const create = axios.post('http://localhost/beneficiosCMBack/calendarioController/save_occupied', {
      fecha,
      titulo: eventData.title,
      hora_inicio: eventData.hora_inicio,
      hora_final:  eventData.hora_final,
      id_unico: eventData.id,
      id_usuario: datosUser.idUsuario
  }, { 
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }, false)
  .then((response) => response.data);

  return create;
}

export async function reRender(){
mutate(URLC);
}
// ----------------------------------------------------------------------

export async function updateCustom(eventData) {

const update = await axios.put('http://localhost/beneficiosCMBack/calendarioController/update_occupied', {
      hora_inicio: eventData.hora_inicio,
      hora_final:  eventData.hora_final,
      titulo: eventData.title,
      id_unico: eventData.id,
      fechaOcupado: eventData.newDate
  }).then(response => response.data);

    // lo que se trae de la url se guarda en current data y se junta con eventData
    // es necesario tener la url que el mismo al hacer get
    mutate(
      URLC
    );

    return update;
}

// ----------------------------------------------------------------------

export async function deleteEvent(eventId) {

const delEvent = await axios.patch('http://localhost/beneficiosCMBack/calendarioController/delete_occupied', {
  id_unico: eventId
}).then(response => response.data);

mutate(
  URLC,
  (currentData) => {
    const events = currentData.events.filter((event) => event.id !== eventId);

    return {
      ...currentData,
      events,
    };
  },
  false
);

return delEvent;
}

export async function cancelDate(eventId){
const delDate = await axios.post('http://localhost/beneficiosCMBack/calendarioController/delete_date', {
  id: eventId
}, {
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
}).then(response => response.data);

mutate(
  URLC,
  (currentData) => {
    const events = currentData.events.filter((event) => event.id !== eventId);

    return {
      ...currentData,
      events
    }
  },
  false
);

return delDate;
}

// export function getAppointmentsByUserr(current) {
//   const year = current.getFullYear();
//   const month = (current.getMonth() + 1); // para obtener el mes que se debe, ya que el default da 0
  
//   const { data, isLoading, error, isValidating } = useSWR(URL_APPOINTMENTS, url => fetcherPost(url, year, month, datosUser.idUsuario), options);

//   useEffect(()=> { // esta función ayuda a que se de un trigger para traer de nuevo los eventos del mes
//     mutate(URL_APPOINTMENTS);
//   },[month]);

//   const memoizedValue = useMemo(() => {
//       const events = data?.events?.map((event) => ({
//         ...event,
//         textColor: event?.color ? event.color : 'red',
//       }));
    
//     return {
//       events: events || [],
//       eventsLoading: isLoading,
//       eventsError: error,
//       eventsValidating: isValidating,
//       eventsEmpty: !isLoading && !data?.events?.length,
//     };
//   }, [data?.events, error, isLoading, isValidating]);
  

//   return memoizedValue;
// }

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

    const create = fetcherPost(saveAppointment, data);

    return create;
}

// ----------------------------------------------------------------------

// export async function dropUpdate(args){
//   const tipo = args.color === "green" ? "cita" : "ocupado"; // para identificar si es cita u horario ocupado, mediante el color de la etiqueta

//   const start = dayjs(args.start).format('YYYY/M/DD'); // fecha a la que se movera
//   const oldStart = dayjs(args.oldStart).format('YYYY/M/DD'); // fecha original del evento

//   const data = {
//     id: args.id,
//     fechaInicio: dayjs(args.start).format('YYYY/MM/DD HH:mm:ss'),
//     fechaFinal: dayjs(args.end).format('YYYY/MM/DD HH:mm:ss'),
//     idEspecialista: datosUser.idUsuario,
//     tipo,
//     start,
//     oldStart
//   }
  
//   const update = await fetcherPost(updateOnDrop, data);

//   if(update.status)
//     enqueueSnackbar(update.message);
//   else{
//     enqueueSnackbar(update.message, {variant: "error"});
//     reRender(); // se utiliza el rerender aqui parta que pueda regresar el evento en caso de no quedar
//   }
    
//   return update;
// }

export function useGetAppointmentsByUser(current) {
  const URL_APPOINTMENTS = [endpoints.calendarioColaborador.getAppointmentsByUser];
  const year = current.getFullYear();
  const month = (current.getMonth() + 1);

  const { data, mutate: revalidate, isLoading, error, isValidating } = useSWR(URL_APPOINTMENTS, url => fetcherPost(url, year, month, datosUser.idUsuario));

  const memoizedValue = useMemo(
    () => ({
      data: data?.data || [],
      appointmentLoading: isLoading,
      appointmentError: error,
      appointmentValidating: isValidating,
      appointmentEmpty: !isLoading && !data?.data?.length,
      appointmentMutate: revalidate,
    }),
    [data?.data, error, isLoading, isValidating, revalidate]
  );

  return memoizedValue;
}