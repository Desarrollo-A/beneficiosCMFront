import useSWR from 'swr';
import { useMemo } from 'react';

import { endpoints, fetcherGet } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetOficinas(load, object) {
  const params = new URLSearchParams(object).toString();
  const URL = load ? `${endpoints.oficinas.list}?${params}` : null;

  const accessToken = localStorage.getItem('accessToken');

  const config = {
    headers: {
      Token: accessToken,
    },
  };

  const { data, isLoading, error, isValidating, mutate } = useSWR([URL, config], fetcherGet);

  const memoizedValue = useMemo(
    () => ({
      oficinas: data || [],
      oficinasLoading: isLoading || isValidating,
      oficinasError: error,
      oficinasValidating: isValidating,
      oficinasEmpty: !isLoading && !data,
      getOficinas: mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
}