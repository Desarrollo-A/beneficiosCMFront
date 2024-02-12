import useSWR from 'swr';
import { useMemo } from 'react';

import axios from 'src/utils/axios';
import { endpoints, fetcherGet } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetSedesPresenciales(object) {
  const params = new URLSearchParams(object).toString()
  const URL = `${endpoints.especialistas.sedes}?${params}`

  const accessToken = sessionStorage.getItem('accessToken');

  const config = {
    headers : {
      token : accessToken
    }
  }

  const { data, isLoading, error, isValidating } = useSWR([URL, config], fetcherGet);
  
  const memoizedValue = useMemo(
    () => ({
      sedes: data || [],
      sedesLoading: isLoading,
      sedesError: error,
      sedesValidating: isValidating,
      sedesEmpty: !isLoading && !data?.length,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetHorariosPresenciales(object) {
  const params = new URLSearchParams(object).toString()
  const URL = `${endpoints.especialistas.horarios}?${params}`

  const accessToken = sessionStorage.getItem('accessToken');

  const config = {
    headers : {
      token : accessToken
    }
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR([URL, config], fetcherGet);
  
  const memoizedValue = useMemo(
    () => ({
      horarios: data || [],
      horariosLoading: isLoading,
      horariosError: error,
      horariosValidating: isValidating,
      horariosEmpty: !isLoading && !data?.length,
      horariosGet : mutate,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export async function setHorarioPresencial(data) {
  const URL = endpoints.especialistas.horario;

  /**
   * Work on server
   */
  //const data = { conversationData };
  const res = await axios.post(URL, data);

  return res.data;
}