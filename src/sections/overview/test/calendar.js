import axios from 'axios';
import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import { fetcher, endpoints } from 'src/utils/axios';


// ----------------------------------------------------------------------

const URL = endpoints.calendar;
const URLC = endpoints.extra;

const options = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export function GetCustomEvents(current) {
  const year = current.getFullYear();
  const month = (current.getMonth() + 1);
  console.log(year, month);

  const { data, isLoading, error, isValidating } = useSWR(URLC, fetcher, options);

  const memoizedValue = useMemo(() => {
      const events = data?.events?.map((event) => ({
        ...event,
        textColor: 'red',
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
// export function GetCustomEvents(current) {
//   const year = current.getFullYear();
//   const month = (current.getMonth() + 1);
 
//   const calendario = Calendario();
//   const [FechaAsis, setFechaAsis] = useState([]);

//   async function handleFechaAsis() {
//     calendario.getOccupied(data => {
//       setFechaAsis(data);
//     },{
//       year, month
//     });
//   }

//   useEffect(() => {
//     handleFechaAsis();
//   }, [year, month]); // eslint-disable-line react-hooks/exhaustive-deps
  
//   // const { data, isLoading, error, isValidating } = useSWR(URLC, fetcher, options);

//   const memoizedValue = useMemo(() => {
//       const events = FechaAsis?.events?.map((event) => ({
//         ...event,
//         // title: event.titulo,
//         date: `${event.fechaOcupado}T${event.horaInicio}`,
//         textColor: 'red',
//       }));
    

//     return {
//       events: events || [],
//       // eventsLoading: isLoading,
//       // eventsError: error,
//       // eventsValidating: isValidating,
//       // eventsEmpty: !isLoading && !data?.events?.length,
//     };
//   }, [FechaAsis]);

//   return memoizedValue;
// }

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

// export async function updateCustom(eventData) {
//   return axios.post('http://localhost/beneficiosCMBack/calendarioController/update_occupied', {
//         hora_inicio: eventData.hora_inicio,
//         hora_final:  eventData.hora_final,
//         titulo: eventData.title,
//         id_unico: eventData.id
//     }, {
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded'
//         }
//     }, false)
//     .then((response) => response.data)
//     .then(
//       // lo que se trae de la url se guarda en current data y se junta con eventData
//       // es necesario tener la url en el axios para el renderizado
//       mutate(
//         URLC,
//         (currentData) => {
//           const events = currentData.events.map((event) =>
//             event.id === eventData.id ? { ...event, ...eventData } : event
//           );

//           return {
//             ...currentData,
//             events,
//           };
//         },
//         false
//       ))
// }

export async function updateCustom(eventData) {
  const update = await axios.put('http://localhost/beneficiosCMBack/calendarioController/update_occupied', {
        hora_inicio: eventData.hora_inicio,
        hora_final:  eventData.hora_final,
        titulo: eventData.title,
        id_unico: eventData.id
    }).then(response => response.data);

      // lo que se trae de la url se guarda en current data y se junta con eventData
      // es necesario tener la url en el axios para el renderizado
      mutate(
        URLC,
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

      return update;
}

// ----------------------------------------------------------------------

export async function deleteEvent(eventId) {
  
  await axios.patch('http://localhost/beneficiosCMBack/calendarioController/delete_occupied', {id_unico: eventId});

  /**
   * Work in local
   */
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
}
