import useSWR from 'swr';
import { useMemo } from 'react';

import axios, { endpoints, fetcherGet, fetcherPost } from 'src/utils/axios';

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

  const memoizedValue = useMemo(
    () => ({
      data: data?.data || [],
      mutate: revalidate,
      isError,
    }),
    [data, revalidate, isError]
  );

  return memoizedValue;
}

export function useGetEventos(idContrato, idSede, idDepartamento) {
  const URL = endpoints.eventos.getEventos;
  const {
    data,
    isLoading,
    mutate: revalidate,
  } = useSWR(URL, (url) => fetcherPost(url, { idContrato, idSede, idDepartamento }));

  const memoizedValue = useMemo(
    () => ({
      data: data?.data || [],
      eventosLoading: isLoading,
      mutate: revalidate,
    }),
    [data, isLoading, revalidate]
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
  sedes,
  departamentos,
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
  form.append('sedes', JSON.stringify(sedes));
  form.append('departamentos', JSON.stringify(departamentos));
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

// Actualizar la fecha de intento de pago en las citas para que se les inhabilite.
export function actualizarAsistenciaEvento(idContrato, idEvento, estatusAsistencia, idUsuario,correo) {
  const URL = [endpoints.eventos.updateAsistencia];
  const update = fetcherPost(URL, { idContrato, idEvento, estatusAsistencia, idUsuario, correo });


  return update;
}

// Actualizar la fecha de intento de pago en las citas para que se les inhabilite.
export function actualizarEstatusEvento(idContrato, idEvento, estatusEvento, idUsuario) {
  const URL = [endpoints.eventos.actualizarEvento];
  const update = fetcherPost(URL, { idContrato, idEvento, estatusEvento, idUsuario });

  return update;
}

export const updateEvent = async (
  idEvento,
  titulo,
  descripcion,
  fechaEvento,
  inicioPublicacion,
  finPublicacion,
  limiteRecepcion,
  ubicacion,
  sedes,
  departamentos,
  imagen,
  idUsuario
) => {
  const url = endpoints.eventos.updateEvento;
  const accessToken = localStorage.getItem('accessToken');

  const form = new FormData();

  form.append('idEvento', idEvento);
  form.append('titulo', titulo);
  form.append('descripcion', descripcion);
  form.append('fechaEvento', fechaEvento);
  form.append('inicioPublicacion', inicioPublicacion);
  form.append('finPublicacion', finPublicacion);
  form.append('limiteRecepcion', limiteRecepcion);
  form.append('ubicacion', ubicacion);
  form.append('sedes', JSON.stringify(sedes));
  form.append('departamentos', JSON.stringify(departamentos));
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

// Actualizar la fecha de intento de pago en las citas para que se les inhabilite.
export function hideShowEvent(idEvento, estatusEvento, idUsuario) {
  const URL = [endpoints.eventos.hideShowEvent];
  const update = fetcherPost(URL, { idEvento, estatusEvento, idUsuario });

  return update;
}
export function verificacionCorreo(correo) {
  const data = {correo};
  const VerificarCorreo = fetcherPost(endpoints.eventos.verificacionCorreo, data);
  // console.log(data);
  return VerificarCorreo;
}
/*
export function verificacionCodigoCorreo(correo,codigo) {
  const data = {correo,codigo};
  const VerificarCodigoCorreo = fetcherPost(endpoints.eventos.verificacioncodigo, data);
  console.log(data);
  return VerificarCodigoCorreo;
}
  */
export function verificacionCodigoCorreo(correo, codigo) {
  const data = { correo, codigo };
  
  const VerificarCodigoCorreo = fetcherPost(endpoints.eventos.verificacioncodigo, data)
    .then(response => 
       response)
    .catch(error => {
      throw error; 
    });  
  return VerificarCodigoCorreo;
}

