import useSWR, { mutate } from 'swr';
import { useMemo, useEffect } from 'react';

import { fetcherPost } from 'src/utils/axios';

const options = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshInterval: 0,
};

export function useModalidad(dataValue, URL, nameData) {
  const { data, isLoading, error, isValidating } = useSWR(
    URL,
    (url) => fetcherPost(url, dataValue),
    options
  );

    useEffect(() => {
      mutate(URL);
    }, [URL, dataValue]);
    
    const memoizedVal = useMemo(
      () => ({
        [nameData]: data?.data || [],
        dataLoading: isLoading,
        dataError: error,
        dataValidating: isValidating,
        dataEmpty: !isLoading && !data,
      }),
      [data, error, isLoading, isValidating, nameData]
    );
    return { ...memoizedVal };
}

export function useGetCounts(dataValue, URL, nameData) {
  const { data, isLoading, error, isValidating } = useSWR(
    URL,
    (url) => fetcherPost(url, dataValue),
    options
  );

  useEffect(() => {
    mutate(URL);
  }, [URL, dataValue]);
    
    const memoizedVal = useMemo(
      () => ({
        [nameData]: data?.data || [],
        dataLoading: isLoading,
        dataError: error,
        dataValidating: isValidating,
        dataEmpty: !isLoading && !data?.data.length,
      }),
      [data?.data, error, isLoading, isValidating, nameData]
    );
    return { ...memoizedVal };
}