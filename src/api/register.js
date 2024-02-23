import 'dayjs/locale/es';
// import useSWR from 'swr';
// import dayjs from 'dayjs';
// import { useMemo, useEffect } from 'react';

import { endpoints, fetcherPost } from 'src/utils/axios';

// import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function registrarColaborador(params) {
  const URL_ESPECIALISTA = [endpoints.auth.registerUser];
  const register = fetcherPost(URL_ESPECIALISTA, { params });

  return register;
}
