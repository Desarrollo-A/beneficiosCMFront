import useSWR from 'swr';
import { useMemo } from 'react';

import axios, { fetcherPost, endpoints, fetcherGet } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetCitasArea(object) {
  const params = new URLSearchParams(object).toString()
  const URL = `${endpoints.areas.citas}?${params}`

  const accessToken = sessionStorage.getItem('accessToken');

  const config = {
    headers : {
      token : accessToken
    }
  }

  const { data, isLoading, error, isValidating } = useSWR([URL, config], fetcherGet);
  
  const memoizedValue = useMemo(
    () => ({
      citas: data || [],
      citasLoading: isLoading,
      citasError: error,
      citasValidating: isValidating,
      citasEmpty: !isLoading && !data,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetMeta(object) {
  const params = new URLSearchParams(object).toString()
  const URL = `${endpoints.especialistas.meta}?${params}`

  const accessToken = sessionStorage.getItem('accessToken');

  const config = {
    headers : {
      token : accessToken
    }
  }

  const { data, isLoading, error, isValidating } = useSWR([URL, config], fetcherGet);
  
  const memoizedValue = useMemo(
    () => ({
      meta: data || undefined,
      metaLoading: isLoading,
      metaError: error,
      metaValidating: isValidating,
      metaEmpty: !isLoading && !data,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

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
    [data, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetDiasPresenciales(object) {
  const params = new URLSearchParams(object).toString()
  const URL = `${endpoints.especialistas.disponibles}?${params}`

  const accessToken = sessionStorage.getItem('accessToken');

  const config = {
    headers : {
      token : accessToken
    }
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR([URL, config], fetcherGet);
  
  const memoizedValue = useMemo(
    () => ({
      diasPresenciales: data || [],
      diasPresencialesLoading: isLoading,
      diasPresencialesError: error,
      diasPresencialesValidating: isValidating,
      diasPresencialesEmpty: !isLoading && !data?.length,
      diasPresencialesGet : mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetDiasPresenciales2(object) {
  const params = new URLSearchParams(object).toString()
  const URL = `${endpoints.especialistas.disponibles}?${params}`

  const accessToken = sessionStorage.getItem('accessToken');

  const config = {
    headers : {
      token : accessToken
    }
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR([URL, config], fetcherGet);
  
  const memoizedValue = useMemo(
    () => ({
      diasPresenciales: data || [],
      diasPresencialesLoading: isLoading,
      diasPresencialesError: error,
      diasPresencialesValidating: isValidating,
      diasPresencialesEmpty: !isLoading && !data?.length,
      diasPresencialesGet : mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export async function setHorarioPresencial(data) {
  const URL = endpoints.especialistas.horario;

  /**
   * Work on server
   */
  // const data = { conversationData };
  const res = await fetcherPost(URL, data);

  return res;
}

export function useGetEspecialistasPorArea(object) {
  const params = new URLSearchParams(object).toString()
  const URL = `${endpoints.dashboard.getEsp}?${params}`

  const accessToken = sessionStorage.getItem('accessToken');

  const config = {
    headers : {
      token : accessToken
    }
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR([URL, config], fetcherGet);
  
  const memoizedValue = useMemo(
    () => ({
      especialistas: data || [],
      especialistasLoading: isLoading,
      especialistasError: error,
      especialistasValidating: isValidating,
      especialistasEmpty: !isLoading && !data?.length,
      especialistasGet : mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
}

