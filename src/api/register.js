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

export function recuperarPassword(noEmp){
  const URL = [endpoints.auth.recuperarPassword];
  const recover = fetcherPost(URL, {noEmp});

  return recover;
}

export function guardarNuevaPassword(noEmp, code, password, mailEmp, idEmp){
  const URL = [endpoints.auth.guardarNuevaPassword];
  const recover = fetcherPost(URL, {noEmp, code, password, mailEmp, idEmp});

  return recover;
}

export function validarNumEmp(noEmp){
  const URL = [endpoints.auth.validarNumEmp];
  const validate = fetcherPost(URL, {noEmp});

  return validate;
}
