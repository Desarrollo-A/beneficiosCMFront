import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcherGet, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetMenu() {
  const URL = endpoints.user.menu;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcherGet);
  
  const memoizedValue = useMemo(
    () => ({
      menu: data || [],
      menuLoading: isLoading,
      menuError: error,
      menuValidating: isValidating,
      menuEmpty: !isLoading && !data?.length,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}