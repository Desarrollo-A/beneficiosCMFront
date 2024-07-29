import 'dayjs/locale/es';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.locale('es');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);

export const validarTelefono = (numero) => {
  // Eliminar cualquier espacio en blanco
  numero = numero.replace(/\s/g, '');

  // Verificar si el número tiene 10 dígitos y son todos números
  return /^\d{10}$/.test(numero);
};

export const validarCorreo = (correo) => {
  // Expresión regular para validar el correo electrónico
  const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Verificar si el correo cumple con el patrón de la expresión regular
  return regexCorreo.test(correo);
};

export const generarFechas = (fechaInicial, fechaFinal) => {
  const resultado = [];
  let fechaActual = dayjs(fechaInicial);

  while (fechaActual.isSameOrBefore(fechaFinal, 'day')) {
    resultado.push(fechaActual.format('YYYY-MM-DD'));
    fechaActual = fechaActual.add(1, 'day');
  }

  return resultado;
};

export const generarDiasFestivos = (año) => {
  const diasFestivos = [
    new Date(año, 0, 1), // 0 Año Nuevo
    new Date(año, 1, 5), // 1 Día de la Constitución
    new Date(año, 2, 21), // 2 Natalicio de Benito Juárez
    new Date(año, 4, 1), // 3 Día del Trabajo
    new Date(año, 8, 16), // 4 Día de la Independencia
    new Date(año, 10, 20), // 5 Día de la Revolución
    new Date(año, 11, 1), // 6 Transmisión del Poder Ejecutivo Federal
    new Date(año, 11, 25), // 7 Navidad
    new Date(año + 1, 0, 1), // 8 Año Nuevo
    new Date(año + 1, 1, 5), // 9 Día de la Constitución
    new Date(año + 1, 2, 21), // 10 Natalicio de Benito Juárez
    new Date(año + 1, 4, 1), // 11 Día del Trabajo
    new Date(año + 1, 8, 16), // 12 Día de la Independencia
    new Date(año + 1, 10, 20), // 13 Día de la Revolución
    new Date(año + 1, 11, 1), // 14 Transmisión del Poder Ejecutivo Federal
    new Date(año + 1, 11, 25), // 15 Navidad
  ];

  // Ajustar los días que se mueven al lunes más cercano
  diasFestivos[1] = nLunesDelMes(diasFestivos[1], 1); // Día de la Constitución
  diasFestivos[2] = nLunesDelMes(diasFestivos[2], 3); // Natalicio de Benito Juárez
  diasFestivos[5] = nLunesDelMes(diasFestivos[5], 3); // Día de la Revolución
  diasFestivos[9] = nLunesDelMes(diasFestivos[9], 1); // Día de la Constitución
  diasFestivos[10] = nLunesDelMes(diasFestivos[10], 3); // Natalicio de Benito Juárez
  diasFestivos[13] = nLunesDelMes(diasFestivos[13], 3); // Día de la Revolución

  const festivos = diasFestivos.map((fecha) => fecha.toISOString().split('T')[0]);
  return festivos;
};

export const nLunesDelMes = (fecha, n) => {
  const año = fecha.getFullYear();
  const mes = fecha.getMonth();
  // Comenzamos en el primer día del mes
  const nuevaFecha = new Date(año, mes, 1);

  // Avanzamos hasta el próximo lunes
  while (nuevaFecha.getDay() !== 1) {
    nuevaFecha.setDate(nuevaFecha.getDate() + 1);
  }

  // Avanzamos (n-1) semanas más para llegar al n-ésimo lunes
  nuevaFecha.setDate(nuevaFecha.getDate() + 7 * (n - 1));

  return nuevaFecha;
};

export const inicioHorarioVerano = (año) => {
  // Crear una fecha que representa el primer día de marzo del año dado
  const fecha = new Date(año, 2, 1);

  // Avanzar a la fecha hasta el primer domingo de marzo
  while (fecha.getDay() !== 0) {
    fecha.setDate(fecha.getDate() + 1);
  }

  // Avanzar una semana para llegar al segundo domingo de marzo
  fecha.setDate(fecha.getDate() + 7);

  return fecha;
};

export const finHorarioVerano = (año) => {
  // Crear una fecha que representa el primer día de noviembre del año dado
  const fecha = new Date(año, 10, 1);

  // Avanzar a la fecha hasta el primer domingo de noviembre
  while (fecha.getDay() !== 0) {
    fecha.setDate(fecha.getDate() + 1);
  }

  return fecha;
};

export const estaEntre = (fecha, fechaInicio, fechaFin) => {
  fecha = new Date(fecha);
  fechaInicio = new Date(fechaInicio);
  fechaFin = new Date(fechaFin);

  // Verificar si la fecha está entre fechaInicio y fechaFin
  return fecha >= fechaInicio && fecha <= fechaFin;
};

export const horaTijuana = (fechaStr) => {
  const fecha = new Date(fechaStr);
  const año = fecha.getFullYear();
  const horasARestar =
    fecha >= inicioHorarioVerano(año) && fecha <= finHorarioVerano(año) ? 1 : 2;
  fecha.setHours(fecha.getHours() - horasARestar);

  return fecha;
};

export const horaTijuanaAEstandar = (fechaStr) => {
  const fecha = new Date(fechaStr);
  const año = fecha.getFullYear();
  const horasASumar =
    fecha >= inicioHorarioVerano(año) && fecha <= finHorarioVerano(año) ? 1 : 2;
  fecha.setHours(fecha.getHours() + horasASumar);

  return fecha;
};

export const horaCancun = (fechaStr) => {
  const fecha = new Date(fechaStr);
  const horasASumar = 1;
  fecha.setHours(fecha.getHours() + horasASumar);

  return fecha;
};

export const horaCancunAEstandar = (fechaStr) => {
  const fecha = new Date(fechaStr);
  const horasARestar = 1;
  fecha.setHours(fecha.getHours() - horasARestar);

  return fecha;
};

export const toLocalISOString = (date) => {
  const tzo = -date.getTimezoneOffset();
  const dif = tzo >= 0 ? '+' : '-';
  const pad = (num) => {
    const norm = Math.floor(Math.abs(num));
    return (norm < 10 ? '0' : '') + norm;
  };
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${dif}${pad(tzo / 60)}:${pad(tzo % 60)}`;
};

export const formatearDosFechaAUna = (fechaHoraInicio, fechaHoraFin) => {
  // Función para formatear una fecha a 'HH:mm'
  function formatearHora(fecha) {
    const hora = fecha.getHours().toString().padStart(2, '0');
    const minuto = fecha.getMinutes().toString().padStart(2, '0');
    return `${hora}:${minuto}`;
  }

  // Función para formatear una fecha a 'YYYY-MM-DD'
  function formatearAFecha(fecha) {
    const año = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // los meses empiezan desde 0
    const dia = fecha.getDate().toString().padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }

  return `${formatearAFecha(fechaHoraInicio)} ${formatearHora(fechaHoraInicio)} - ${formatearHora(
    fechaHoraFin
  )}`;
};

export const obtenerFechasConHoras = (folios) => {
  // Dividir la cadena de texto por comas para obtener cada fecha
  if (!folios) return [];
  const fechas = folios.split(',');

  // Mapear cada fecha a un objeto Date
  const fechasEnDate = fechas.map((fecha) => {
    // Dividir la fecha y la hora
    const [fechaSinHoras, hora] = fecha.split(' A las ');

    // Dividir la fecha por espacios y reordenarla para que sea compatible con el constructor de Date
    const partesDeLaFecha = fechaSinHoras.split(' / ').reverse().join('-');

    // Reemplazar el punto al final de la hora y convertir la hora a formato 24h
    const hora24h = hora.replace(' horas.', '');

    // Crear un nuevo objeto Date y agregarlo al arreglo
    return new Date(`${partesDeLaFecha}T${hora24h}`);
  });

  return fechasEnDate;
};

export const parseStartDate = (value, originalValue) => originalValue.toISOString();

export const parseEndDate = (value, originalValue) => originalValue.toISOString();
