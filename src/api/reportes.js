import useSWR, { mutate } from 'swr';
import { useMemo, useEffect } from 'react';

import axios, { endpoints, fetcherGet, fetcherPost } from 'src/utils/axios';

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

export const updateObservaciones = async(data) => {
  const url = endpoints.reportes.observacion;
  const accessToken = localStorage.getItem('accessToken');

  const form = new FormData()
  form.append('archivo', data.archivo)
  form.append('descripcion', data.descripcion)
  form.append('idCita', data.idCita)
  form.append('estatus', data.estatus)
  form.append('modificadoPor', data.modificadoPor)
  form.append('ests', data.ests)

  const res = await axios.post(
    url,
    form,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Token: accessToken,
      },
    }
  );

  return res.data;
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

  const { data, isLoading, error, isValidating, mutate : mutateSelect } = useSWR(
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
        mutateSelect,
      }),
      [data?.data, error, isLoading, isValidating, nameData, mutateSelect]
    );
    return { ...memoizedVal };
}

export function useCheckModalidades(idEspecialista, idOficina, tipoCita, idArea){
  const modalidad = tipoCita === 1 ? 2 : 1;
  const URL = endpoints.gestor.checkModalidades;
  const area = idArea === null ? 0 : idArea;

  const dataValue = {
    idEspecialista,
    idOficina,
    modalidad,
    idArea: area
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

export function useGetAreas(){
  const URL = endpoints.gestor.getAreas;

  const {data} = useSWR(URL, url => fetcherGet(url), options);

  // const checkModalites = await fetcherPost(url, dataValue);

  useEffect(() => {
    mutate(URL);
  }, [URL]);

  const memoizedValue = useMemo(() => {
    const areas = data;

    return {
      areas: areas?.data || [],
      areasResult: areas?.result || '',
      areasMsg: areas?.msg || ''
    };
  }, [data]);

  return memoizedValue;
}