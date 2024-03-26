import 'dayjs/locale/es';

import { endpoints, fetcherPost } from 'src/utils/axios';

export function getAvisoPrivacidad(idEspecialidad) {
  const URL = [endpoints.avisosPrivacidad.getAvisoDePrivacidad];
  const avisoPrivacidad = fetcherPost(URL, { idEspecialidad });

  return avisoPrivacidad;
}
