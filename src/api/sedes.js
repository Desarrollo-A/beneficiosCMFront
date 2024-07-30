import useSWR from 'swr';
import { useMemo } from 'react';

import { endpoints, fetcherGet, fetcherPost } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetSedes(object) {
  const params = new URLSearchParams(object).toString();
  const URL = `${endpoints.sedes.list}?${params}`;

  const accessToken = localStorage.getItem('accessToken');

  const config = {
    headers: {
      Token: accessToken,
    },
  };

  const { data, isLoading, error, isValidating, mutate } = useSWR([URL, config], fetcherGet);

  const memoizedValue = useMemo(
    () => ({
      sedes: data || [],
      sedesLoading: isLoading || isValidating,
      sedesError: error,
      sedesValidating: isValidating,
      sedesEmpty: !isLoading && !data,
      getSedes: mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
}

export async function saveAtencionXSede(object) {
    const params = new URLSearchParams(object).toString()
    const URL = `${endpoints.sedes.save}?${params}`;
    return fetcherPost([URL]);
}

export async function saveOficinaXSede(object) {
    const params = new URLSearchParams(object).toString()
    const URL = `${endpoints.sedes.oficina}?${params}`;
    return fetcherPost([URL]);
}

export async function getSedes(object) {
    const params = new URLSearchParams(object).toString()
    const URL = `${endpoints.sedes.list}?${params}`;
    return fetcherGet([URL]);
}