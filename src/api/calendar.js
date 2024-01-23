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

export function useGetEvents() {
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, options);
  const memoizedValue = useMemo(() => {
    const events = data?.events.map((event) => ({
      ...event,
      textColor: event.color,
    }));

    return {
      events: events || [],
      eventsLoading: isLoading,
      eventsError: error,
      eventsValidating: isValidating,
      eventsEmpty: !isLoading && !data?.events.length,
    };
  }, [data?.events, error, isLoading, isValidating]);

  return memoizedValue;
}

// ----------------------------------------------------------------------
export function GetCustomEvents() {

  const { data, isLoading, error, isValidating } = useSWR(URLC, fetcher, options);

  const memoizedValue = useMemo(() => {
      const events = data?.events?.map((event) => ({
        ...event,
        // title: event.titulo,
        date: `${event.fechaOcupado}T${event.horaInicio}`,
        textColor: 'red',
      }));
    

    return {
      events: events || [],
      eventsLoading: isLoading,
      eventsError: error,
      eventsValidating: isValidating,
      eventsEmpty: !isLoading && !data?.events?.length,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

// ----------------------------------------------------------------------

export async function createCustom(fecha, eventData) {

  return axios.post('http://localhost/beneficiosCMBack/calendarioController/save_occupied', {
        fecha,
        titulo: eventData.title,
        hora_inicio: eventData.hora_inicio,
        hora_final:  eventData.hora_final,
        id_unico: eventData.id
    }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
    }, false)
    .then((response) => response.data)
    .then(
      // lo que se trae de la url se guarda en current data y se junta con eventData
      // es necesario tener la url en el axios para el renderizado
      mutate(
      URLC,
      (currentData) => {
        const events = [...currentData.events, eventData];
        return {
          ...currentData,
          events,
        };
      },
      false
    ))
}

// ----------------------------------------------------------------------

export async function createEvent(eventData) {
  /**
   * Work on server
   */
  // const data = { eventData };
  // await axios.post(URL, data);

  /**
   * Work in local
   */
  
  mutate(
    URL,
    (currentData) => {
      const events = [...currentData.events, eventData];
      return {
        ...currentData,
        events, // este evento causa que el evento agregado haga render
      };
    },
    false
  );
}

// ----------------------------------------------------------------------

export async function updateEvent(eventData) {
  /**
   * Work on server
   */
  // const data = { eventData };
  // await axios.put(endpoints.calendar, data);

  /**
   * Work in local
   */
  mutate(
    URL,
    (currentData) => {
      const events = currentData.events.map((event) =>
        event.id === eventData.id ? { ...event, ...eventData } : event
      );

      return {
        ...currentData,
        events,
      };
    },
    false
  );
}

// ----------------------------------------------------------------------

export async function deleteEvent(eventId) {
  /**
   * Work on server
   */
  // const data = { eventId };
  // await axios.patch(endpoints.calendar, data);

  /**
   * Work in local
  */
  mutate(
    URL,
    (currentData) => {
      const events = currentData.events.filter((event) => event.id !== eventId);

      return {
        ...currentData,
        events,
      };
    },
    false
  );
}

// ----------------------------------------------------------------------