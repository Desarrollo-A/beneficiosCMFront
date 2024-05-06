import axios from 'axios';
import useSWR, { mutate } from 'swr';
import { useMemo, useEffect } from 'react';

import { fetcherPost } from 'src/utils/axios';

import { HOST } from 'src/config-global';

const options = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshInterval: 0,
};

const instance = axios.create({ baseURL: HOST });
instance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);
export { instance };

export function usePost(dataValue, URL, nameData) {
  const { data, isLoading, error, isValidating } = useSWR(
    URL,
    (url) => fetcherPost(url, dataValue),
    options
  );

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

export function useInsert(endpoints) {
  const insertData = async (obj) => {
    const URL = obj ? endpoints : '';
    return fetcherInsert([URL, obj]);
  };

  return insertData;
}

export const fetcherInsert = async (args) => {
  const [url, data, config] = Array.isArray(args) ? args : [args];
  const accessToken = localStorage.getItem('accessToken');

  const res = await instance.post(
    url,
    { dataValue: JSON.stringify(data) },
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        token: accessToken,
      },
      ...config,
    }
  );

  return res.data;
};

export function useGetCountRespuestas(dataValue, URL, nameData) {
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
      dataEmpty: !isLoading,
    }),
    [data?.data, error, isLoading, isValidating, nameData]
  );
  return { ...memoizedVal };
}
