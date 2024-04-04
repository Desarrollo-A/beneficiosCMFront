import useSWR from 'swr';
import { useMemo } from 'react';

import { endpoints, fetcherGet } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetMenu() {
  const URL = endpoints.user.menu;
  const accessToken = sessionStorage.getItem('accessToken');

  const config = {
    headers : {
      Token : accessToken
    }
  }

  const { data, isLoading, error, isValidating } = useSWR([URL, config], fetcherGet);
  
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