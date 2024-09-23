import useSWR from 'swr';
import { useMemo } from 'react';

import axios, {
  endpoints,
  fetcherGetLegalario,
  fetcherPost,
  fetcherPostLegalario,
} from 'src/utils/axios';

export function loginLegalario(email, password) {
  const URL = [endpoints.legalario.login];
  const update = fetcherPostLegalario(URL, { email, password });

  return update;
}

export function tokenLegalario(data) {
  const URL = [endpoints.legalario.token];
  const { client_id, client_secret, grant_type, scope } = data;

  const update = fetcherPostLegalario(URL, { client_id, client_secret, grant_type, scope });

  return update;
}

export function getDocumentos(token) {
  const URL = endpoints.legalario.docs; // Asegúrate de que sea un string

  // Pasa el token en los headers dentro del config
  const config = {
    headers: {
      Authorization: `Bearer ${token}`, // Incluye el token como header
    },
  };

  // Llama a fetcherGetLegalario pasando URL y config correctamente
  const update = fetcherGetLegalario([URL, config]); // No uses [URL] como array anidado

  return update;
}

export function crearDocumento(data) {
  const URL = [endpoints.legalario.docs];
  const { value1, token } = data;

  // Pasa el token en los headers dentro del config
  const config = {
    headers: {
      Authorization: `Bearer ${token}`, // Incluye el token como header
    },
  };

  const update = fetcherPostLegalario(URL, { value1 }, config);
  // const update = fetcherPostLegalario(URL, { value1 });

  return update;
}

// export const fetcherPostLegalarioToken = async () => {
//   const url = 'https://api.legalario.com/auth/token';

//   // Convierte los parámetros en URLSearchParams
//   const urlencoded = new URLSearchParams();
//   urlencoded.append('client_id', '10d0c0000dabdf010110f0101');
//   urlencoded.append('client_secret', 'L0olTan5LP0jqnkoRazy0sWkOS1wBoTMiu0oXZrj');
//   urlencoded.append('grant_type', 'client_credentials');
//   urlencoded.append('scope', 'documents');

//   // Realiza la petición POST usando axios
//   const res = await legalarioInstance.post(
//     url,
//     urlencoded, // Envía los datos en formato URLSearchParams
//     {
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//     }
//   );

//   return res.data;
// };
