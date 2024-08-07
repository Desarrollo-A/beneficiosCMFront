import useSWR from 'swr';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { endpoints, fetcherGet, fetcherPost } from 'src/utils/axios';

export function useGetUsers() {
  const URL = endpoints.user.list;
  const { data, mutate: revalidate } = useSWR(URL, (url) => fetcherPost(url, {}));

  const memoizedValue = useMemo(
    () => ({
      data: data?.data || [],
      usersMutate: revalidate,
    }),
    [data, revalidate]
  );

  return memoizedValue;
}

export function useGetNameUser(idUsuario) {
  // funcion para traer los usuarios disponibles en select de cita.
  const URL = endpoints.user.names;

  const { data, mutate } = useSWR(URL, (url) => fetcherPost(url, idUsuario));

  const memoizedValue = useMemo(
    () => ({
      data: data?.data || [],
      usersMutate: mutate,
    }),
    [data?.data, mutate]
  );

  return memoizedValue;
}

export function useUpdateUser() {
  const update = async (obj) => {
    const URL = obj ? endpoints.user.update : '';
    return fetcherPost(URL, obj);
  };

  return update;
}

export function updateUser(idUsuario, data) {
  const URL = [endpoints.user.update];
  const update = fetcherPost(URL, { idUsuario, ...data });

  return update;
}

export function updateExternalUser(idUsuarioExt, data) {
  const URL = [endpoints.user.updateExternal];
  const update = fetcherPost(URL, { idUsuarioExt, ...data });

  return update;
}

export function batchUsers(tabla, data) {
  const URL = [endpoints.user.batch];
  const batch = fetcherPost(URL, { tabla, data });

  return batch;
}

export function useGetAuthorized() {
  const location = useLocation();

  const URL = `${endpoints.user.authorized}?path=${location.pathname}`;

  const accessToken = localStorage.getItem('accessToken');

  const config = {
    headers: {
      Token: accessToken,
    },
  };

  const { data, isLoading, error, isValidating } = useSWR([URL, config], fetcherGet);

  const memoizedValue = useMemo(
    () => ({
      authorized: data?.authorized || false,
      authorizedLoading: isLoading,
      authorizedError: error,
      authorizedValidating: isValidating,
      authorizedEmpty: !isLoading && !data,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// Consulta si existe un colaborador en la vista de ch y trae su info para registrarlo.
export function getColaborador(num_empleado) {
  const URL = [endpoints.auth.getUser];
  const user = fetcherPost(URL, { num_empleado });

  return user;
}
