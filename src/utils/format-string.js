export function capitalize(string = ' ') {
    return string[0].toUpperCase() + string.slice(1);
}

export function titleCase(str = '') {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}