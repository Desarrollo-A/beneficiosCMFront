import useSWR, { mutate } from 'swr';
import { useMemo, useEffect, useContext } from 'react';

import { rutas, fetcherGet, fetcherPost, fetcherUpdate } from 'src/utils/ax';

import { contextGeneral } from 'src/utils/contextGeneralProvider';

const Reportes = () => {
    const context = useContext(contextGeneral);
    return {
        getReportes: context.llamarServidorRespuesta('reportesController/citas'),
        getEspecialistas: context.llamarServidor('generalController/especialistas'),
        getObservacion: context.llamarServidorRespuesta('reportesController/observacion')
    }
}
export default Reportes

const options = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshInterval: 0
}

export function useGetReportes(ReportData) {
  
    const URL = rutas.reportes.lista;
  
    const { data, isLoading, error, isValidating } = useSWR(URL, url => fetcherPost(url, ReportData), options);

    useEffect(() => {
      mutate(URL);
    }, [URL, ReportData]);
    
    const memoizedVal = useMemo(
      () => ({
        reportesData: data?.data || [],
        dataLoading: isLoading,
        dataError: error,
        dataValidating: isValidating,
        dataEmpty: !isLoading && !data?.data.length,
        dataMutate: mutate
      }),
      [data?.data, error, isLoading, isValidating]
    );
    return memoizedVal;
}

export function useGetEspecialistas() {
    const URL = rutas.reportes.especialistas;
  
    const { data, isLoading, error, isValidating } = useSWR(URL, fetcherGet, options);
    
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

export function useUpdateObservacion(){

  const updateObservacion = async (obj) => {

    console.log('datos:', obj)

    const URL = obj ? rutas.reportes.observacion : '';
    return fetcherUpdate([URL, obj]);
  };

  return updateObservacion;

}

