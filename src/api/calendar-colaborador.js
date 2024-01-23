import dayjs from 'dayjs';
import { Base64 } from 'js-base64';
import useSWR, { mutate } from 'swr';
import { useMemo, useEffect } from 'react';

import { endpoints, fetcherPost } from 'src/utils/axios';

// cadenas de url extraidas de lo que se encuentra en el axios
const get_all_events = endpoints.calendario.getAllEvents;
const save_occupied = endpoints.calendario.saveOccupied;
const update_occupied = endpoints.calendario.updateOccupied;
const delete_occupied = endpoints.calendario.deleteOccupied;
const cancel_appointment = endpoints.calendario.cancelAppointment;
const save_appointment = endpoints.calendario.createAppointment;

const datosUser = JSON.parse(Base64.decode(sessionStorage.getItem('accessToken').split('.')[2]));

export async function reRender() {
  mutate(get_all_events);
}

// ----------------------------------------------------------------------

export function useGetBenefits(sede) {
  const URL_BENEFITS = [endpoints.benefits.list];
  const {
    data,
    mutate: revalidate,
    isLoading,
    error,
    isValidating,
  } = useSWR(URL_BENEFITS, (url) => fetcherPost(url, { sede }));

  const memoizedValue = useMemo(
    () => ({
      data: data?.data || [],
      benefitsLoading: isLoading,
      benefitsError: error,
      benefitsValidating: isValidating,
      benefitsEmpty: !isLoading && !data?.data?.length,
      benefitsMutate: revalidate,
    }),
    [data?.data, error, isLoading, isValidating, revalidate]
  );

  return memoizedValue;
}

export function useGetEspecialists(area, sede, beneficio) {
  const URL_ESPECIALISTA = [endpoints.especialistas.list];
  const {
    data,
    mutate: revalidate,
    isLoading,
    error,
    isValidating,
  } = useSWR(URL_ESPECIALISTA, (url) => fetcherPost(url, { sede, beneficio }));

  useEffect(() => {
    revalidate();
  }, [beneficio, revalidate]);

  const memoizedValue = useMemo(
    () => ({
      data: data?.data || [],
      especialistaLoading: isLoading,
      especialistaError: error,
      especialistaValidating: isValidating,
      especialistaEmpty: !isLoading && !data?.data?.length,
      especialistaMutate: revalidate,
    }),
    [data?.data, error, isLoading, isValidating, revalidate]
  );

  return memoizedValue;
}

export function getSpecialists(sede, area, beneficio) {
  const URL_ESPECIALISTA = [endpoints.especialistas.list];
  const specialists = fetcherPost(URL_ESPECIALISTA, { sede, area, beneficio });

  return specialists;
}

export function useGetModalities(sede, especialista) {
  const URL_MODALITIES = [endpoints.especialistas.modalities];
  const {
    data,
    mutate: revalidate,
    isLoading,
    error,
    isValidating,
  } = useSWR(URL_MODALITIES, (url) => fetcherPost(url, { sede, especialista }));

  useEffect(() => {
    revalidate();
  }, [especialista, revalidate]);

  const memoizedValue = useMemo(
    () => ({
      data: data?.data || [],
      modalitiesLoading: isLoading,
      modalitiesError: error,
      modalitiesValidating: isValidating,
      modalitiesEmpty: !isLoading && !data?.data?.length,
      modalitiesMutate: revalidate,
    }),
    [data?.data, error, isLoading, isValidating, revalidate]
  );

  return memoizedValue;
}

export function getModalities(sede, especialista) {
  const URL = [endpoints.especialistas.modalities];
  const modalities = fetcherPost(URL, { sede, especialista });

  return modalities;
}

export function getHorario(beneficio) {
  const URL = [endpoints.calendarioColaborador.getHorarioBeneficio];
  const horario = fetcherPost(URL, { beneficio });

  return horario;
}

export function getHorariosOcupados(especialista, usuario, fechaInicio, fechaFin) {
  const URL = [endpoints.calendarioColaborador.getAllEventsWithRange];
  const horarios = fetcherPost(URL, { especialista, usuario, fechaInicio, fechaFin });

  return horarios;
}

export function getContactoQB(especialista) {
  const URL = [endpoints.especialistas.contact];
  const infoContact = fetcherPost(URL, { especialista });

  return infoContact;
}

export function getOficinaByAtencion(sede, beneficio, especialista, modalidad) {
  const URL = [endpoints.calendarioColaborador.getOficina];
  const oficina = fetcherPost(URL, { sede, beneficio, especialista, modalidad });

  return oficina;
}

export function checaPrimeraCita(usuario, especialista) {
  const URL = [endpoints.calendarioColaborador.isPrimeraCita];
  const primeraCita = fetcherPost(URL, { usuario, especialista });

  return primeraCita;
}

export function getCitasSinFinalizar(usuario, beneficio) {
  const URL = [endpoints.calendarioColaborador.getCitasSinFinalizar];
  const cita = fetcherPost(URL, { usuario, beneficio });

  return cita;
}

export function getCitasFinalizadas(usuario, mes, año) {
  const URL = [endpoints.calendarioColaborador.getCitasFinalizadas];
  const cita = fetcherPost(URL, { usuario, mes, anio: año });

  return cita;
}

export function getAtencionXSede(especialista, sede, modalidad) {
  const URL = [endpoints.calendarioColaborador.getAtencionPorSede];
  const axs = fetcherPost(URL, { especialista, sede, modalidad });

  return axs;
}

export function registrarDetalleDePago(usuario, folio, concepto, cantidad, metodoPago) {
  const URL = [endpoints.calendarioColaborador.registrarDetallePago];
  const detalle = fetcherPost(URL, { usuario, folio, concepto, cantidad, metodoPago });

  return detalle;
}

export function lastAppointment(usuario, beneficio) {
  const URL = [endpoints.calendarioColaborador.getLastAppointment];
  const detalle = fetcherPost(URL, { usuario, beneficio });

  return detalle;
}

export function updateAppointment(idCita, estatus) {
  const URL = [endpoints.calendarioColaborador.updateAppointment];
  const update = fetcherPost(URL, { idCita, estatus });

  return update;
}

export function useGetPendientes() {
  const pendientes = endpoints.calendarioColaborador.getPendientes;
  const { data, mutate: revalidate } = useSWR(pendientes, (url) =>
    fetcherPost(url, datosUser?.idUsuario)
  );

  const memoizedValue = useMemo(
    () => ({
      data: data || [],
      pendingsMutate: revalidate,
    }),
    [data, revalidate]
  );

  return memoizedValue;
}

export function crearCita(
  titulo,
  idEspecialista,
  idPaciente,
  observaciones,
  fechaInicio,
  tipoCita,
  idAtencionXSede,
  estatusCita,
  creadoPor,
  modificadoPor,
  detallePago
) {
  const URL_CITA = [endpoints.calendarioColaborador.createAppointment];
  const axs = fetcherPost(URL_CITA, {
    titulo,
    idEspecialista,
    idPaciente,
    observaciones,
    fechaInicio,
    tipoCita,
    idAtencionXSede,
    estatusCita,
    creadoPor,
    modificadoPor,
    detallePago,
  });

  return axs;
}

export function useGetAppointmentsByUser(current) {
  const URL_APPOINTMENTS = [endpoints.calendarioColaborador.getAppointmentsByUser];
  const year = current.getFullYear();
  const month = current.getMonth() + 1;

  const dataValue = {
    year,
    month,
    idUsuario: datosUser.idUsuario,
  };

  const {
    data,
    mutate: revalidate,
    isLoading,
    error,
    isValidating,
  } = useSWR(URL_APPOINTMENTS, (url) => fetcherPost(url, dataValue));

  useEffect(() => {
    revalidate();
  }, [month, revalidate]);

  const memoizedValue = useMemo(() => {
    const events = data?.data?.map((event) => ({
      ...event,
      textColor: event?.color ? event.color : 'black',
    }));

    return {
      data: events || [],
      appointmentLoading: isLoading,
      appointmentError: error,
      appointmentValidating: isValidating,
      appointmentEmpty: !isLoading && !data?.data?.length,
      appointmentMutate: revalidate,
    };
  }, [data?.data, error, isLoading, isValidating, revalidate]);

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function GetCustomEvents(current) {
  const year = current.getFullYear();
  const month = current.getMonth() + 1; // para obtener el mes que se debe, ya que el default da 0

  const dataValue = {
    year,
    month,
    idUsuario: datosUser.idUsuario,
  };

  const { data, isLoading, error, isValidating } = useSWR(get_all_events, (url) =>
    fetcherPost(url, dataValue)
  );

  useEffect(() => {
    reRender();
  }, [month]);

  const memoizedValue = useMemo(() => {
    const events = data?.events?.map((event) => ({
      ...event,
      textColor: event?.color ? event.color : 'red',
    }));

    return {
      events: events || [],
      eventsLoading: isLoading,
      eventsError: error,
      eventsValidating: isValidating,
      eventsEmpty: !isLoading && !data?.events?.length,
    };
  }, [data?.events, error, isLoading, isValidating]);

  return memoizedValue;
}

// ----------------------------------------------------------------------

export async function createCustom(fecha, eventData) {
  const dataValue = {
    fecha,
    titulo: eventData.title,
    hora_inicio: eventData.hora_inicio,
    hora_final: eventData.hora_final,
    id_unico: eventData.id,
    id_usuario: datosUser.idUsuario,
    fecha_inicio: `${fecha} ${eventData.hora_inicio}`,
    fecha_final: `${fecha} ${eventData.hora_final}`,
    id_especialista: datosUser.idUsuario,
  };

  const create = fetcherPost(save_occupied, dataValue);

  return create;
}

// ----------------------------------------------------------------------

export async function updateCustom(eventData) {
  let update = '';
  const start = dayjs(eventData.newDate).format('YYYY/M/DD'); // fecha a la que se movera
  const now = dayjs(new Date()).format('YYYY/M/DD');
  const oldStart = dayjs(eventData.occupied).format('YYYY/M/DD'); // fecha original del evento

  const dataValue = {
    hora_inicio: eventData.hora_inicio,
    hora_final: eventData.hora_final,
    titulo: eventData.title,
    id_unico: eventData.id,
    fecha_ocupado: eventData.newDate,
    id_usuario: datosUser.idUsuario,
    fecha_inicio: `${eventData.newDate} ${eventData.hora_inicio}`,
    fecha_final: `${eventData.newDate} ${eventData.hora_final}`,
    id_especialista: datosUser.idUsuario,
    start,
    oldStart,
  };

  if (oldStart > now) {
    if (start > now) {
      update = fetcherPost(update_occupied, dataValue);
    } else {
      update = {
        status: false,
        message: 'No se pueden mover las fechas a un dia anterior o actual',
      };
    }
  } else {
    update = { status: false, message: 'Las citas u horarios pasados no se pueden mover' };
  }

  return update;
}
// ----------------------------------------------------------------------

export async function deleteEvent(eventId) {
  const delEvent = fetcherPost(delete_occupied, eventId);

  return delEvent;
}

// ----------------------------------------------------------------------

export async function cancelDate(eventId) {
  const delDate = fetcherPost(cancel_appointment, eventId);

  return delDate;
}

// ----------------------------------------------------------------------

export async function createAppointment(fecha, eventData) {
  // const URL = [endpoints.calendarioColaborador.createAppointment];

  const data = {
    fecha,
    id_usuario: eventData.usuario, // Especialista
    id_paciente: datosUser.idUsuario, // Beneficiario aka paciente
    fecha_inicio: `${fecha} ${eventData.hora_inicio}`,
    fecha_final: `${fecha} ${eventData.hora_final}`,
    creado_por: datosUser.idUsuario,
    observaciones: eventData.title,
    modificado_por: datosUser.idUsuario,
  };

  const create = fetcherPost(save_appointment, data);

  return create;
}
