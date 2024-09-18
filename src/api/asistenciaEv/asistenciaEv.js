import useSWR from 'swr';
import { useMemo } from 'react';

import { endpoints, fetcherGet } from 'src/utils/axios';

export function useGetAsistenciaEv() {
  const URL = endpoints.asistenciaEv.GetAsistenciaEv;
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
