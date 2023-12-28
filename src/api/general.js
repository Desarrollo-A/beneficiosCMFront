import useSWR, { mutate } from 'swr';
import { useMemo, useEffect } from 'react';

import { fetcherGet, fetcherPost } from 'src/utils/axios';

const options = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshInterval: 0
}

export function usePostGeneral(dataValue, URL, nameData) {
  
    const { data, isLoading, error, isValidating } = useSWR(URL, url => fetcherPost(url, dataValue), options);

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
    return memoizedVal;
}

export function useGetGeneral(URL, nameData) {
  
    const { data, isLoading, error, isValidating } = useSWR(URL, fetcherGet, options);

    const memoizedVal = useMemo(() => ({
    [nameData]: data?.data || [],
    dataLoading: isLoading,
    dataError: error,
    dataValidating: isValidating,
    dataEmpty: !isLoading && !data?.data.length,
    }), [data?.data, error, isLoading, isValidating, nameData]);

    return memoizedVal;
}

export function useInsertGeneral(endpoints){

  const insertData = async (obj) => {

    const URL = obj ? endpoints : '';
    return fetcherPost([URL, obj]);
  };

  return insertData;
}

export function useUpdateGeneral(endpoints){

    const updateData = async (obj) => {
  
      const URL = obj ? endpoints : '';
      return fetcherPost([URL, obj]);
    };
  
    return updateData;
  
}