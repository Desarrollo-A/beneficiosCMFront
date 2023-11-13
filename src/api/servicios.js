import useSWR from 'swr';
// import { useMemo } from 'react';

import { fetcher, endpointsSRV } from 'src/utils/axios-servicios';

// ----------------------------------------------------------------------

const URL = endpointsSRV.benefiniciosDisponibles;

export function GetCitasDisponibles() {
    const { data } = useSWR(URL, fetcher);
    console.log('from init:', data, ' ', URL);

    let obj = data;
    return {citas:obj};
  }

