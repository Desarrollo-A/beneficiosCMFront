/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable consistent-return */
import { fechaDocumento} from 'src/utils/general';
import { endpoints, fetcherPost } from 'src/utils/axios';

import { useFormatoMonto,useFormatoMonto2 } from 'src/api/general';
import { TEMPLATEID, LEGALARIO_HOST, LEGALARIO_EMAIL, LEGALARIO_PASSWORD } from 'src/config-global';


export const postLogin = async () => {
  const params = new URLSearchParams();
  // params.append('email', 'coordinador1.desarrollo@ciudadmaderas.com');
  //  params.append('password', 'pipBoy30');
  params.append('email', LEGALARIO_EMAIL);
  params.append('password', LEGALARIO_PASSWORD);
  try {
    const response = await fetch(`${LEGALARIO_HOST}auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

export const postGenerarToken = async (client_id, client_secret, grant_type, scope) => {
  const params = new URLSearchParams({
    client_id,
    client_secret,
    grant_type,
    scope,
  });
  try {
    const response = await fetch(`${LEGALARIO_HOST}auth/token?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

export const postDocumentos = async (
  token_type,
  access_token,
  nombre,
  FirstDay,
  ahorroFinal,
  nss,
  rfc,
  razonSocial,
  direccion,
  sueldoNeto
) => {
  const headers = {
    Authorization: `${token_type} ${access_token}`,
    'Content-Type': 'application/json',
  };
  const formatoMontos = useFormatoMonto();
  const formatoMonto = useFormatoMonto2();
  
  const datosCompletosColaborador = (datos)=> Object.values(datos).every(value=> value !==undefined && value !== null);
  const userdatos = {
    nombre,
    FirstDay,
    ahorroFinal,
    nss,
    rfc,
    razonSocial,
    direccion,
    sueldoNeto
  };

  if (!datosCompletosColaborador(userdatos)) {
  console.error('Los datos del colaborador estan incompletos, se detuvo el proceso de generacion de documento');

    return null; 
  }

  // cuerpo del documento
  const body = {
    name: 'SOLICITUD DE ADHESIÓN AL FONDO DE AHORRO',
    type: 'template',
    template_id: TEMPLATEID,
    sequence: [
      [{ key: 1, name: '$VAR_1$', value: fechaDocumento() }],
      [{ key: 2, name: '$VAR_2$', value: nombre }],
      [{ key: 3, name: '$VAR_3$', value: sueldoNeto }],
      [{ key: 4, name: '$VAR_4$', value: formatoMontos(ahorroFinal)}],
      [{ key: 5, name: '$VAR_5$', value: FirstDay }],
      [{ key: 6, name: '$VAR_6$', value: razonSocial }],
      [{ key: 7, name: '$VAR_7$', value: razonSocial }],
      [{ key: 8, name: '$VAR_8$', value: nss }],
      [{ key: 9, name: '$VAR_9$', value: rfc }],
      [{ key: 10, name: '$VAR_10$', value: direccion }],
      [{ key: 11, name: '$VAR_11$', value:formatoMonto(ahorroFinal)}],
    ],

  };
  try {
    const response = await fetch(`${LEGALARIO_HOST}v2/documents`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

export const enviarCorreoFirma = async (
  token_type,
  access_token,
  document_id,
  nombre,
  telPersonal,
  correo
) => {
  const headers = {
    Authorization: `${token_type} ${access_token}`,
    'Content-Type': 'application/json',
  };

  const body = {
    document_id,
    workflow: true,
    use_whatsapp: false,
    signers: [
      {
        fullname: nombre,
        email:  correo, 
        phone: 4424913769,
        type: 'FIRMA',
        role: 'FIRMANTE',
        notes:
          '¡Firmar lo antes posible para continuar con el proceso de adhesión al fondo de ahorro!',
      },
    ],
  };
  try {
    const response = await fetch(`${LEGALARIO_HOST}v2/signers`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

export function actualizarFondoAhorro(idFondo, idEstatusFA) {
  const URL = [endpoints.fondoAhorro.actualizarFondo];
  const idSede = fetcherPost(URL, { idFondo, idEstatusFA });

  return idSede;
}
