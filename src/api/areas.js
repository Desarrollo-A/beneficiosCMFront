import useSWR from 'swr';
import { useMemo } from 'react';

import { endpoints, fetcherGet, fetcherPost } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetAreas(object) {
  const params = new URLSearchParams(object).toString();
  const URL = `${endpoints.areas.list}?${params}`;

  const accessToken = localStorage.getItem('accessToken');

  const config = {
    headers: {
      Token: accessToken,
    },
  };

  const { data, isLoading, error, isValidating, mutate } = useSWR([URL, config], fetcherGet);

  const memoizedValue = useMemo(
    () => ({
      areas: data || [],
      areasLoading: isLoading,
      areasError: error,
      areasValidating: isValidating,
      areasEmpty: !isLoading && !data,
      getAreas: mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
}