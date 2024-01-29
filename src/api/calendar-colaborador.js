import useSWR from 'swr';
import { Base64 } from 'js-base64';
import { useMemo, useEffect } from 'react';

import { endpoints, fetcherPost } from 'src/utils/axios';

const datosUser = JSON.parse(Base64.decode(sessionStorage.getItem('accessToken').split('.')[2]));

// ----------------------------------------------------------------------

// Trae todos los beneficios que puede gozar la sede.
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

// Trae todos los especialistas que atienden en mi area, sede.
export function getSpecialists(sede, area, beneficio) {
  const URL_ESPECIALISTA = [endpoints.especialistas.list];
  const specialists = fetcherPost(URL_ESPECIALISTA, { sede, area, beneficio });

  return specialists;
}

// Trae las modalidades de los datos seleccionados (presencial o en linea)
export function getModalities(sede, especialista) {
  const URL = [endpoints.especialistas.modalities];
  const modalities = fetcherPost(URL, { sede, especialista });

  return modalities;
}

// Trae el horario de un beneficio
export function getHorario(beneficio) {
  const URL = [endpoints.calendarioColaborador.getHorarioBeneficio];
  const horario = fetcherPost(URL, { beneficio });

  return horario;
}

// Trae los horarios ocupados de especialista seleccionado y del usuario para ver disponibilidad en horario
export function getHorariosOcupados(especialista, usuario, fechaInicio, fechaFin) {
  const URL = [endpoints.calendarioColaborador.getAllEventsWithRange];
  const horarios = fetcherPost(URL, { especialista, usuario, fechaInicio, fechaFin });

  return horarios;
}

// Obtiene las oficinas de atención de los datos seleccionados para cita.
export function getOficinaByAtencion(sede, beneficio, especialista, modalidad) {
  const URL = [endpoints.calendarioColaborador.getOficina];
  const oficina = fetcherPost(URL, { sede, beneficio, especialista, modalidad });

  return oficina;
}

// Checa si el usuario tiene primera cita
export function checaPrimeraCita(usuario, especialista) {
  const URL = [endpoints.calendarioColaborador.isPrimeraCita];
  const primeraCita = fetcherPost(URL, { usuario, especialista });

  return primeraCita;
}

// Traer las citas sin finalizar o pendientes del beneficio
export function getCitasSinFinalizar(usuario, beneficio) {
  const URL = [endpoints.calendarioColaborador.getCitasSinFinalizar];
  const cita = fetcherPost(URL, { usuario, beneficio });

  return cita;
}

// Traer las citas finalizadas del mes que se consulte.
export function getCitasFinalizadas(usuario, mes, año) {
  const URL = [endpoints.calendarioColaborador.getCitasFinalizadas];
  const cita = fetcherPost(URL, { usuario, mes, anio: año });

  return cita;
}

// Saber la atencion x sede de la cita.
export function getAtencionXSede(especialista, sede, modalidad) {
  const URL = [endpoints.calendarioColaborador.getAtencionPorSede];
  const axs = fetcherPost(URL, { especialista, sede, modalidad });

  return axs;
}

// Registrar el detalle de pago
export function registrarDetalleDePago(usuario, folio, concepto, cantidad, metodoPago) {
  const URL = [endpoints.calendarioColaborador.registrarDetallePago];
  const detalle = fetcherPost(URL, { usuario, folio, concepto, cantidad, metodoPago });

  return detalle;
}

// Trae la ultima cita que tuvo en el beneficio para poder cargar todos los datos a la cita.
export function lastAppointment(usuario, beneficio) {
  const URL = [endpoints.calendarioColaborador.getLastAppointment];
  const detalle = fetcherPost(URL, { usuario, beneficio });

  return detalle;
}

// Actualizar algun dato de cita como estatus de la cita, o su detalle de pago.
export function updateAppointment(idUsuario, idCita, estatus, detalle, evaluacion) {
  console.log('ASCO', idUsuario, idCita, estatus, detalle, evaluacion);
  const URL = [endpoints.calendarioColaborador.updateAppointment];
  const update = fetcherPost(URL, { idUsuario, idCita, estatus, detalle, evaluacion });

  return update;
}

// Actualizar el registro de detalle paciente que indica que un usuario esta activo en el beneficio.
export function updateDetailPacient(usuario, beneficio) {
  const URL = [endpoints.calendarioColaborador.updateDetail];
  const update = fetcherPost(URL, { usuario, beneficio });

  return update;
}

// Actualizar el registro de detalle paciente que indica que un usuario esta activo en el beneficio.
export function checkInvoice(idDetalle) {
  const URL = [endpoints.calendario.checkInvoice];
  const check = fetcherPost(URL, { idDetalle });

  return check;
}

// Función para traer citas con estatus en pediente de pago
export function useGetPendientes() {
  const pendientes = endpoints.calendarioColaborador.getPendientes;
  const { data, mutate: revalidate } = useSWR(pendientes, (url) =>
    fetcherPost(url, { idUsuario: datosUser?.idUsuario })
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

// Función para crear cita
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

// Trae todas las citas del usuario
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

// Actualizar el registro de detalle paciente que indica que un usuario esta activo en el beneficio.
export function sendMail(
  idEspecialidad,
  nombreEspecialista,
  fecha,
  horaInicio,
  horaFinal,
  oficina,
  sede,
  correo
) {
  const URL = [endpoints.calendario.mailEspecialista];

  let especialidad = '';
  switch (idEspecialidad) {
    case 537:
      especialidad = 'nutrición';
      break;
    case 585:
      especialidad = 'psicología';
      break;
    case 686:
      especialidad = 'guía espiritual';
      break;
    case 158:
      especialidad = 'quantum balance';
      break;
    default:
      especialidad = 'NA';
      break;
  }
  const mailMessage = {
    // datos para enviar el mail
    especialidad,
    especialista: nombreEspecialista,
    fecha,
    horaInicio,
    horaFinal,
    view: 'email-appointment',
    oficina: oficina || 'virtual',
    sede: sede || 'virtual',
    tituloEmail: 'Reservación',
    temaEmail: 'Se ha agendado tu cita con: ',
    correo,
  };

  const mail = fetcherPost(URL, { mailMessage });

  return mail;
}
