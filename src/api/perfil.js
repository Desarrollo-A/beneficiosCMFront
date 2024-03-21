import useSWR, { mutate } from 'swr';
import { useMemo, useEffect } from 'react';
import axios from 'axios';

import { endpoints, fetcherPost } from 'src/utils/axios';
import { HOST } from 'src/config-global';
// import { accessToken } from 'mapbox-gl';

const options = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshInterval: 0,
};

export async function getDecodedPass() {
    const URL = endpoints.user.decodePass;

    const accessToken = sessionStorage.getItem('accessToken');

    const instance = axios.create({
        baseURL: HOST,
        headers: {
            Token: accessToken
        }
    })

    const response = await instance.get(URL);
  
    return response.data;
  }