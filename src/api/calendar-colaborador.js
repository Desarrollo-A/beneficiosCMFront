import axios from 'axios';
import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import { fetcher, endpoints, fetcherPost } from 'src/utils/axios';

// ----------------------------------------------------------------------

const URL = endpoints.calendar;
const URLC = endpoints.extra;

const options = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

export function useGetBenefits(sede) {
  const URL_BENEFITS = [endpoints.benefits.list, { sede }]
  const { data, mutate: revalidate, isLoading, error, isValidating } = useSWR(URL_BENEFITS, fetcherPost);

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
  const URL_ESPECIALISTA = [endpoints.especialistas.list, { sede, beneficio }]
  const { data, mutate: revalidate, isLoading, error, isValidating } = useSWR(URL_ESPECIALISTA, fetcherPost);

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
  const URL_MODALITIES = [endpoints.especialistas.modalities, { sede, especialista }]
  const { data, mutate: revalidate, isLoading, error, isValidating } = useSWR(URL_MODALITIES, fetcherPost);

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

export async function createAppointment(fecha, eventData){
const create = axios.post('http://localhost/beneficiosCMBack/calendarioController/create_appointment', {
      idEspecialista: datosUser.idUsuario,
      idPaciente: eventData.usuario,
      fechaInicio: `${fecha} ${eventData.hora_inicio}`,
      fechaFinal: `${fecha} ${eventData.hora_final}`,
      creadoPor: datosUser.idUsuario,
      observaciones: eventData.title,
      modificadoPor: datosUser.idUsuario
  }, { 
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }, false)
  .then((response) => response.data);

  return create;
}