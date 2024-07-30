import useSWR from 'swr';
import { useMemo } from 'react';

import { endpoints, fetcherPost } from 'src/utils/axios';

export function useNotificacion(idUsuario) {
  const URL_NOTIFICACION = [endpoints.notificacion.getNotificacion];
  const {
    data,
    mutate: revalidate,
    isLoading,
    error,
    isValidating,
  } = useSWR(URL_NOTIFICACION, (url) => fetcherPost(url, { idUsuario }));

  const memoizedValue = useMemo(
    () => ({
      notifications: data?.data || [],
      benefitsLoading: isLoading || isValidating,
      benefitsError: error,
      benefitsValidating: isValidating,
      benefitsEmpty: !isLoading && !data?.data?.length,
      getNotifications: revalidate,
    }),
    [data?.data, error, isLoading, isValidating, revalidate]
  );

  return memoizedValue;
}

export function useDeleteNotification(rt){

  const deleteData = async (obj) => {

    const URL = obj ? rt : '';
    return fetcherPost(URL, obj);
  };

  return deleteData;

}