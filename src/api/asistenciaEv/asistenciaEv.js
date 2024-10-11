import useSWR from 'swr';
import { useMemo } from 'react';

import { endpoints, fetcherGet,fetcherPost } from 'src/utils/axios';

export function useGetAsistenciaEv() {
  const URL = endpoints.eventos.GetAsistenciaEv;
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
  const URL = idUsuario ? `${endpoints.eventos.GetAsistenciaEvUser}/${idUsuario}` : null;
   
  const { data, error, mutate: revalidate } = useSWR(URL, fetcherGet);
  const isError = !!error;

  const memoizedValue = useMemo(() => ({
    data: data?.data || [],
    mutate: revalidate,
    isError
  }), [data, revalidate, isError]);

  return memoizedValue;
}
/*
export function getDatosEvento(base64) {
  const URL = [endpoints.eventos.datosEvento];
  const dataEvento = fetcherPost(URL, { base64 });

  return dataEvento;
}
*/
export async function getDatosEvento(base64) {
  const URL = endpoints.eventos.datosEvento; 
  try {
    const dataEvento = await fetcherPost(URL, { base64 }); 
    return dataEvento; 
  } catch (error) {
    console.error("Error con datos del evento:", error); 
    return null;
  }
}



export async function updateAsistenciaEvento(idEvento, idcontrato) {
  const data = {idEvento,idcontrato};
  const update = await fetcherPost(endpoints.eventos.updatePasarAsistencia, data);

  return update;
}