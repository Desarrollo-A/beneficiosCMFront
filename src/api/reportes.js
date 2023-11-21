import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher_cx, rutas } from 'src/utils/ax';

import { useContext } from "react";

import { contextGeneral } from "src/utils/contextGeneralProvider";

const Reportes = () => {
    const context = useContext(contextGeneral);
    return {
        getReportes: context.llamarServidorRespuesta('reportesController/citas'),
        getEspecialistas: context.llamarServidor('generalController/especialistas'),
        getObservacion: context.llamarServidorRespuesta('reportesController/observacion')
    }
}
export default Reportes

export function useGetReportes() {
    const URL_AX = rutas.reportes.lista;
  
    const { data, isLoading, error, isValidating } = useSWR(URL_AX, fetcher_cx);
    
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

export function useGetEspecialistas() {
    const URL_AX = rutas.reportes.especialistas;
  
    const { data, isLoading, error, isValidating } = useSWR(URL_AX, fetcher_cx);
    
    const memoizedVal = useMemo(
      () => ({
        especialistasData: data?.data || [],
        dataLoading: isLoading,
        dataError: error,
        dataValidating: isValidating,
        dataEmpty: !isLoading && !data?.data.length,
      }),
      [data?.data, error, isLoading, isValidating]
    );
  
    return memoizedVal;
}