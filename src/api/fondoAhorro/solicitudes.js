import useSWR from 'swr';
import { useMemo } from 'react';

import { endpoints, fetcherGet /* fetcherPost */ } from 'src/utils/axios';

export function useGetSolicitudes() {
  const URL = endpoints.fondoAhorro.getSolicitudes;
  const { data, mutate: revalidate } = useSWR(URL, (url) => fetcherGet(url, {}));

  const memoizedValue = useMemo(
    () => ({
      data: data?.data || [],
      mutate: revalidate,
    }),
    [data, revalidate]
  );

  return memoizedValue;
}
