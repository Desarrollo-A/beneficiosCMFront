import 'dayjs/locale/es';
import useSWR from 'swr';
import dayjs from 'dayjs';
import { useMemo, useEffect } from 'react';

import { endpoints, fetcherPost } from 'src/utils/axios';
import {
  horaCancun,
  horaTijuana,
  toLocalISOString,
  finHorarioVerano,
  inicioHorarioVerano,
  horaCancunAEstandar,
  horaTijuanaAEstandar,
  obtenerFechasConHoras,
} from 'src/utils/general';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function getOficinas(dataValue) {
  const URL_ESPECIALISTA = [endpoints.gestor.getOficinasVal];
  const specialists = fetcherPost(URL_ESPECIALISTA, dataValue);

  return specialists;
}
