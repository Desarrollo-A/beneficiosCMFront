import useSWR from 'swr';
import { useMemo } from 'react';

import { endpoints, fetcherGet } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetDepartamentos(object) {
  const params = new URLSearchParams(object).toString();
  const URL = `${endpoints.deptos.getDepartamentos}?${params}`;

  const accessToken = localStorage.getItem('accessToken');

  const config = {
    headers: {
      Token: accessToken,
    },
  };

  const { data, isLoading, error, isValidating, mutate } = useSWR([URL, config], fetcherGet);

  const memoizedValue = useMemo(
    () => ({
      deptos: data || [],
      deptosLoading: isLoading || isValidating,
      deptosError: error,
      deptosValidating: isValidating,
      deptosEmpty: !isLoading && !data,
      deptosMutate: mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
}
