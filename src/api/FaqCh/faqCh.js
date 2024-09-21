import { endpoints, fetcherPost } from "src/utils/axios";

export async function createPregunta(data){
    const URL = [endpoints.gestor.savePreguntaCh]

    const values = {
        modificadoPor: data.modificadoPor,
        pregunta: data.pregunta,
        respuesta: data.respuesta
    }
    
    const create = await fetcherPost(URL, values )
    
    return create
}

export async function updatePregunta(data, idFaq){
    const URL = [endpoints.gestor.updatePreguntaCh]

    const values = {
        idPregunta: idFaq,
        idUsuario: data.modificadoPor,
        pregunta: data.pregunta,
        respuesta: data.respuesta
    }
    
    const create = await fetcherPost(URL, values )
    
    return create
}

export async function habilitarPregunta(idPregunta, newStatus, idUsuario){
    const URL = [endpoints.gestor.habilitarPreguntaCh]

    const values = {
        idPregunta,
        newStatus,
        idUsuario
    }
    
    const create = await fetcherPost(URL, values)
    
    return create
}