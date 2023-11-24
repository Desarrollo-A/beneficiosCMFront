import useSWR from 'swr';
import { useMemo } from 'react';

import { endpoints, fetcherGet, fetcherPost } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetUsers() {
  const URL = endpoints.user.list;

  const { data, mutate, isLoading, error, isValidating } = useSWR(URL, fetcherGet);

  const memoizedValue = useMemo(
    () => ({
      data: data?.data || [],
      usersLoading: isLoading,
      usersError: error,
      usersValidating: isValidating,
      usersEmpty: !isLoading && !data?.data?.length,
      usersMutate: mutate,
    }),
    [data?.data, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
}

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

export function useUpdateUser() {
  const updateUser = async (obj) => {
    const URL = obj ? endpoints.user.update : '';
    return fetcherPost([URL, obj]);
  };

  return updateUser;
}

export function useBatchUsers() {
  const batchUsers = async (obj) => {
    const URL = obj ? endpoints.user.batch : '';
    return fetcherPost([URL, obj]);
  };

  return batchUsers;
}