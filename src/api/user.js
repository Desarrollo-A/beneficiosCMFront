import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints, fetcherGet } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetUser() { // useGetLabels
  const URL = endpoints.user.list;

  const { data, mutate, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      data: data?.data || [],
      usersLoading: isLoading,
      usersError: error,
      usersValidating: isValidating,
      usersEmpty: !isLoading && !data?.data.length,
      usersMutate: mutate,
    }),
    [data?.data, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
}

export function useGetNameUser() { // useGetLabels
  const URL = endpoints.user.names;

  const { data } = useSWR(URL, fetcherGet);

  const memoizedValue = useMemo(
    () => ({
      data: data?.data || []
    }),
    [data?.data]
  ); 

  return memoizedValue;
}

export function useUpdateUser(query) {
    const URL = query ? [endpoints.user.update, { params: { query } }] : '';
  
    const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, {
      keepPreviousData: true,
    });
  
    const memoizedValue = useMemo(
      () => ({
        updateResults: data?.results || [],
        updateLoading: isLoading,
        updateError: error,
        updateValidating: isValidating,
        updateEmpty: !isLoading && !data?.results.length,
      }),
      [data?.results, error, isLoading, isValidating]
    );
  
    return memoizedValue;
}

export function useSearchProducts(query) {
    const URL = query ? [endpoints.product.search, { params: { query } }] : '';
  
    const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, {
      keepPreviousData: true,
    });
  
    const memoizedValue = useMemo(
      () => ({
        searchResults: data?.results || [],
        searchLoading: isLoading,
        searchError: error,
        searchValidating: isValidating,
        searchEmpty: !isLoading && !data?.results.length,
      }),
      [data?.results, error, isLoading, isValidating]
    );
  
    return memoizedValue;
}