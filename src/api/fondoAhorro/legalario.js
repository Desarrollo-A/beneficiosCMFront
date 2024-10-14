/* eslint-disable consistent-return */
/* eslint-disable object-shorthand */
import {TEMPLATEID,LEGALARIO_HOST, LEGALARIO_EMAIL, LEGALARIO_PASSWORD } from 'src/config-global';

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
        console.log('Response Data:', data);
        return data;
      }
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };
  
  
  export const postGenerarToken = async (client_id, client_secret, grant_type,scope) => {
    const params = new URLSearchParams({
      client_id: client_id,
      client_secret: client_secret,
      grant_type: grant_type,
      scope: scope,
    });
    try {
      const response = await fetch(`${LEGALARIO_HOST}auth/token?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',  
        }
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Response Data:', data);
        return data;
      }
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  export const postDocumentos = async (token_type, access_token, nombre, FirstDay, ahorroFinal,nss,rfc,razonSocial,direccion,sueldoNeto) => {
    const headers = {
      'Authorization': `${token_type} ${access_token}`,
      'Content-Type': 'application/json'
    };
    // obtener fecha actual
    const fechaDocumento = () => {
      const fecha = new Date();
      const completo = { day: 'numeric', month: 'long', year: 'numeric' };
      const formatoDocumento = new Intl.DateTimeFormat('es-ES', completo).format(fecha);
      
      return formatoDocumento.replace('de', 'de').replace(',', ' del');
    };
    // cuerpo del documento 
  const body = {
    "name": "SOLICITUD DE ADHESIÓN AL FONDO DE AHORRO (Tests)",
    "type": "template",
    "template_id": TEMPLATEID,
    "sequence": [
      [{ "key": 1, "name": "$VAR_1$", "value": fechaDocumento() }],
      [{ "key": 2, "name": "$VAR_2$", "value": nombre }],
      [{ "key": 3, "name": "$VAR_3$", "value": sueldoNeto }],
      [{ "key": 4, "name": "$VAR_4$", "value": ahorroFinal }],
      [{ "key": 5, "name": "$VAR_5$", "value": FirstDay }],
      [{ "key": 6, "name": "$VAR_6$", "value": razonSocial }],
      [{ "key": 7, "name": "$VAR_7$", "value": razonSocial }],
      [{ "key": 8, "name": "$VAR_8$", "value": nss }],
      [{ "key": 9, "name": "$VAR_9$", "value": rfc }],
      [{ "key": 10, "name": "$VAR_10$", "value": direccion }],
      [{ "key": 11, "name": "$VAR_11$", "value": ahorroFinal }]
    ]
  };
  try {
    const response = await fetch(`${LEGALARIO_HOST}v2/documents`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),  
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Documentos Response:', data);
      return data;
    } 
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

export const enviarCorreoFirma = async (token_type, access_token, document_id,nombre,telPersonal) => {
  const headers = {
    'Authorization': `${token_type} ${access_token}`,
    'Content-Type': 'application/json'
  };

  const body = {
    "document_id": document_id,
    "workflow": true,
    "use_whatsapp": false,
    "signers": [
      {
        "fullname": nombre,
        "email": "programador.analista47@ciudadmaderas.com",
        "phone": telPersonal,
        "type": "FIRMA",
        "role": "FIRMANTE",
        "notes": `Firmar lo antes posible antes del 08 de noviembre 2024`
      }
    ]
  };
  try {
    const response = await fetch(`${LEGALARIO_HOST}v2/signers`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),  
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Respuesta enviarCorreoFirma:', data);
      return data;
    }
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

