import useSWR from 'swr';
import { useMemo } from 'react';
import { Base64 } from 'js-base64';

import { endpoints, fetcherGet, fetcherPost } from 'src/utils/axios';

// ----------------------------------------------------------------------
const datosUser = JSON.parse(Base64.decode(sessionStorage.getItem('accessToken').split('.')[2]));

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

// export function useGetUsers() {
//   const URL = endpoints.user.list;

//   const { data, mutate, isLoading, error, isValidating } = useSWR(URL, fetcherGet);

//   const memoizedValue = useMemo(
//     () => ({
//       data: data?.data || [],
//       usersLoading: isLoading,
//       usersError: error,
//       usersValidating: isValidating,
//       usersEmpty: !isLoading && !data?.data?.length,
//       usersMutate: mutate,
//     }),
//     [data?.data, error, isLoading, isValidating, mutate]
//   );

//   return memoizedValue;
// }

export function useGetAreas() {
  const URL = endpoints.user.areas;

  const { data, mutate, isLoading, error, isValidating } = useSWR(URL, fetcherGet);

  const memoizedValue = useMemo(
    () => ({
      data: data?.data || [],
      areasLoading: isLoading,
      areasError: error,
      areasValidating: isValidating,
      areasEmpty: !isLoading && !data?.data?.length,
      areasMutate: mutate,
    }),
    [data?.data, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
}

export function useGetNameUser() {
  // funcion para traer los usuarios disponibles en select de cita QB.
  const URL = endpoints.user.names;

  const { data, mutate } = useSWR(URL, (url) => fetcherPost(url, datosUser.idUsuario));

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

export function batchUsers(tabla, data) {
  const URL = [endpoints.user.batch];
  const batch = fetcherPost(URL, { tabla, data });

  return batch;
}
