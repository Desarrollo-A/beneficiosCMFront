import useSWR from 'swr';
import { useMemo } from 'react';

import { endpoints, fetcherGet } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetModalidades(load, object) {
  const params = new URLSearchParams(object).toString();
  const URL = load ? `${endpoints.modalidades.list}?${params}` : null;

  const accessToken = localStorage.getItem('accessToken');

  const config = {
    headers: {
      Token: accessToken,
    },
  };

  const { data, isLoading, error, isValidating, mutate } = useSWR([URL, config], fetcherGet);

  const memoizedValue = useMemo(
    () => ({
      modalidades: data || [],
      modalidadesLoading: isLoading || isValidating,
      modalidadesError: error,
      modalidadesValidating: isValidating,
      modalidadesEmpty: !isLoading && !data?.length,
      getModalidades: mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
}
