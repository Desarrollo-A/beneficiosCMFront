import useSWR from 'swr';
import { useMemo } from 'react';

import axios, { endpoints, fetcherPost } from 'src/utils/axios';

export function useGetEventos(idContrato, idSede, idDepartamento) {
  const URL = endpoints.eventos.getEventos;
  const { data, mutate: revalidate } = useSWR(URL, (url) =>
    fetcherPost(url, { idContrato, idSede, idDepartamento })
  );

  const memoizedValue = useMemo(
    () => ({
      data: data?.data || [],
      mutate: revalidate,
    }),
    [data, revalidate]
  );

  return memoizedValue;
}

export const newEvent = async (
  titulo,
  descripcion,
  fechaEvento,
  inicioPublicacion,
  finPublicacion,
  limiteRecepcion,
  ubicacion,
  imagen,
  idUsuario
) => {
  const url = endpoints.eventos.newEvent;
  const accessToken = localStorage.getItem('accessToken');

  const form = new FormData();

  form.append('titulo', titulo);
  form.append('descripcion', descripcion);
  form.append('fechaEvento', fechaEvento);
  form.append('inicioPublicacion', inicioPublicacion);
  form.append('finPublicacion', finPublicacion);
  form.append('limiteRecepcion', limiteRecepcion);
  form.append('ubicacion', ubicacion);
  form.append('imagen', imagen);
  form.append('idUsuario', idUsuario);

  const res = await axios.post(url, form, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Token: accessToken,
    },
  });

  return res.data;
};
