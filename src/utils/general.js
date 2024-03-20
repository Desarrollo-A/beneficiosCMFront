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

export const parseStartDate = (value, originalValue) => originalValue.toISOString();

export const parseEndDate = (value, originalValue) => originalValue.toISOString();
