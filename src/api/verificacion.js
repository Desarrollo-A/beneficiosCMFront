import useSWR from 'swr';
import { useMemo } from 'react';

import axios, { endpoints, fetcherGet } from 'src/utils/axios';

import { HOST } from 'src/config-global';

const instance = axios.create({ baseURL: HOST });
instance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);
export { instance };

export function useInsert(dt) {
  const insertData = async (obj) => {
    const URL = obj ? dt : '';
    return fetcherInsert([URL, obj]);
  };

  return insertData;
}

export const fetcherInsert = async (args) => {
  const [url, data, config] = Array.isArray(args) ? args : [args];
  const accessToken = sessionStorage.getItem('accessToken');

  const res = await instance.post(
    url,
    { dataValue: JSON.stringify(data) },
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Token: accessToken,
      },
      ...config,
    }
  );

  return res.data;
};

export function useGetToken(object) {
  const params = new URLSearchParams(object).toString();
  const URL = `${endpoints.user.token}?${params}`;

  const accessToken = sessionStorage.getItem('accessToken');

  const config = {
    headers: {
      Token: accessToken,
    },
  };

  const { data, isLoading, error, isValidating, mutate } = useSWR([URL, config], fetcherGet);

  const memoizedValue = useMemo(
    () => ({
      especialistas: data || [],
      especialistasLoading: isLoading,
      especialistasError: error,
      especialistasValidating: isValidating,
      especialistasEmpty: !isLoading && !data?.length,
      especialistasGet: mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
}
