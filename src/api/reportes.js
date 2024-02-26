import useSWR, { mutate } from 'swr';
import { useMemo, useEffect } from 'react';

import { endpoints, fetcherPost } from 'src/utils/axios';

const options = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshInterval: 0
}

export function useGetReportes(dataValue) {
  
    const URL = endpoints.reportes.lista;
  
    const { data, isLoading, error, isValidating } = useSWR(URL, url => fetcherPost(url, dataValue), options);

    useEffect(() => {
      mutate(URL);
    }, [URL, dataValue]);
    
    const memoizedVal = useMemo(
      () => ({
        reportesData: data?.data || [],
        dataLoading: isLoading,
        dataError: error,
        dataValidating: isValidating,
        dataEmpty: !isLoading && !data?.data.length,
      }),
      [data?.data, error, isLoading, isValidating]
    );
    return memoizedVal;
}

export function useUpdate(rt){

  const updateData = async (obj) => {

    const URL = obj ? rt : '';
    return fetcherPost(URL, obj);
  };

  return updateData;

}

export function usePostPacientes(dataValue, URL, nameData) {

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

export function usePostIngresos(dataValue, URL, nameData) {

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

export function usePostSelect(dataValue, URL, nameData) {

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

export function useCheckModalidades(idEspecialista, idOficina, tipoCita){
  const modalidad = tipoCita === 1 ? 2 : 1;
  const URL = endpoints.gestor.checkModalidades;

  const dataValue = {
    idEspecialista,
    idOficina,
    modalidad
  };
  const {data} = useSWR(URL, url => fetcherPost(url, dataValue), options);

  // const checkModalites = await fetcherPost(url, dataValue);

  useEffect(() => {
    mutate(URL);
  }, [URL, idOficina, idEspecialista, tipoCita]);

  const memoizedValue = useMemo(() => {
    const result = data;

    return {
      checkModalidades: result || '',
    };
  }, [data]);

  return memoizedValue;
}