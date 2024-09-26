import useSWR from 'swr';
import { useMemo } from 'react';

import { endpoints, fetcherGet, fetcherPost } from 'src/utils/axios';

export function useGetCatalogos() {
  const URL = endpoints.catalogos.getCatalogos;
  const { data, mutate: revalidate } = useSWR(URL, (url) => fetcherGet(url, {}));

  const memoizedValue = useMemo(
    () => ({
      data: data?.data || [],
      mutate: revalidate,
    }),
    [data, revalidate]
  );

  return memoizedValue;
}

export function useGetCatalogosOp(idCatalogo) {
  const URL = idCatalogo ? `${endpoints.catalogos.getCatalogosOp}/${idCatalogo}` : null;
  
  const { data, error, mutate: revalidate } = useSWR(URL, fetcherGet);
  const isError = !!error;

  const memoizedValue = useMemo(() => ({
    data: data?.data || [],
    mutate: revalidate,
    isError
  }), [data, revalidate, isError]);

  return memoizedValue;
}
export function updateStatusCatalogoss(idCatalogo, estatus, idUsuario) {
  let estatusNumero;
  
  if (estatus === 'Activo') {
    estatusNumero = 1;
  } else if (estatus === 'Inactivo') {
    estatusNumero = 0;
  } else {
    throw new Error('Estatus no reconocido');
  }
  const URL = endpoints.catalogos.updateStatusCatalogosd;
  const data = {
    idCatalogo,
    estatus: estatusNumero,
    idUsuario
  };
  return fetcherPost(URL, data);
}
export function updateStatusCatalogoOp(idOpcion,idCatalogo, estatusOp, idUsuario) {
  let estatusNumeric;

  switch (estatusOp) {
    case 'Activo':
      estatusNumeric = 1;
      break;
    case 'Inactivo':
      estatusNumeric = 0;
      break;
    default:
      throw new Error('Estatus no reconocido');
  }
  const URL = endpoints.catalogos.updateStatusCatalogosOp;
  const data = {
    idOpcion,
    idCatalogo,
    estatusOp: estatusNumeric,
    idUsuario
  };
  console.log(data);
  return fetcherPost(URL, data);
}



export function addCatalogoss(nombreCatalogo, estatus, idUsuario) {
  const URL = [endpoints.catalogos.addCatalogos];
  const addCat = fetcherPost(URL, {nombreCatalogo, estatus, idUsuario});
  return addCat;
}

export function addCatalogosOp(idOpcion, idCatalogo, nombreCatalogOp,estatusOp,idUsuario) {
  const URL = [endpoints.catalogos.addCatalogossOp];
  const addCatOp = fetcherPost(URL, {idOpcion, idCatalogo, nombreCatalogOp,estatusOp,idUsuario});
  return addCatOp;
}



