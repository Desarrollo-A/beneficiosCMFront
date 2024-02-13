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
