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

export const parseStartDate = (value, originalValue) => originalValue.toISOString();

export const parseEndDate = (value, originalValue) => originalValue.toISOString();
