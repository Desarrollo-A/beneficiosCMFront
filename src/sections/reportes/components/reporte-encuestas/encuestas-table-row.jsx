import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

// ----------------------------------------------------------------------

export default function TableEncuestas({ row }) {

  const {
    pregunta,
    respuesta,
    paciente,
    correo,
    area,
    depto,
    beneficio,
    fecha,
    sede
   } = row;

  return (

      <TableRow>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{pregunta}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{respuesta}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{paciente}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{correo}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{sede}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{area}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{depto}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{beneficio}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fecha}</TableCell>

      </TableRow>
      
  );
}

TableEncuestas.propTypes = {
  row: PropTypes.object,
};
