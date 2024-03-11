import 'dayjs/locale/es';

import { endpoints, fetcherPost } from 'src/utils/axios';

export function getEncodedHash(hash) {
  const URL = [endpoints.api.encodedHash];
  const response = fetcherPost(URL, { hash });

  return response;
}
