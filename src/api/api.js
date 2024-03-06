import 'dayjs/locale/es';

import { endpoints, fetcherPost } from 'src/utils/axios';

export function getNuevoHash(hash) {
  const URL = [endpoints.api.nuevoHash];
  const response = fetcherPost(URL, { hash });

  return response;
}
