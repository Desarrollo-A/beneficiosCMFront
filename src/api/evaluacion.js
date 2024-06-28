import { endpoints, fetcherPost } from 'src/utils/axios';

export function updateEvaluacion(idCita, tipoEncuesta, idUsuario) {
    const URL = [endpoints.encuestas.updateEvaluacion];
    const update = fetcherPost(URL, {
      idCita,
      tipoEncuesta,
      idUsuario
    });
  
    return update;
}

export function evaluacionReagenda(idCita) {
    const URL = [endpoints.encuestas.evaluacionReagenda];
    const update = fetcherPost(URL, {
      idCita
    });
  
    return update;
}

export function evaluacionCancelacion(idCita) {
    const URL = [endpoints.encuestas.evaluacionCancelacion];
    const update = fetcherPost(URL, {
      idCita
    });
  
    return update;
}

export function creaEvaluaciones(idCita) {
    const URL = [endpoints.encuestas.creaEvaluaciones];
    const update = fetcherPost(URL, {
      idCita
    });
  
    return update;
}