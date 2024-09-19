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
export function useGetAsistenciaEvUser(idUsuario) {
  const URL = idUsuario ? `${endpoints.asistenciaEv.GetAsistenciaEvUser}/${idUsuario}` : null;
   
  const { data, error, mutate: revalidate } = useSWR(URL, fetcherGet);
  const isError = !!error;

  const memoizedValue = useMemo(() => ({
    data: data?.data || [],
    mutate: revalidate,
    isError
  }), [data, revalidate, isError]);

  return memoizedValue;
}

