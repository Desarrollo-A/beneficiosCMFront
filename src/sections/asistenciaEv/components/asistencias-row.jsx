import { format } from 'date-fns';
import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import Label from 'src/components/label';

export default function AsistenciaEvRow({ row }) {
  const { estatusAsistentes, idEvento, titulo, fechaEvento, horaEvento, limiteRecepcion, num_empleado, nombreCompleto, nsede, ndepto } = row;

  const estatusasistentes = {
    'Confirmación': 'primary',
    'Cancelación': 'warning',
    'Asistencia': 'success',
    'Penalización': 'error',
    'Justificación': 'secondary',
  };

  const color = estatusasistentes[estatusAsistentes] || 'default';
  const fechaEventoCut = fechaEvento ? format(new Date(fechaEvento), 'dd-MM-yyyy') : '';
  const horaEventoCut = horaEvento ? horaEvento.slice(0, 5) : '';
  const limiteRecepcionCut = limiteRecepcion ? limiteRecepcion.slice(0, 5) : '';
  return (
    <TableRow>
      <TableCell>{idEvento}</TableCell>
      <TableCell>
        <Label variant="soft" color={color}>
          {estatusAsistentes.toUpperCase()}
        </Label>
      </TableCell>
      <TableCell>{titulo.toUpperCase()}</TableCell>
      <TableCell>{fechaEventoCut}</TableCell>
      <TableCell>{horaEventoCut}</TableCell>
      <TableCell>{limiteRecepcionCut}</TableCell>
      <TableCell>{num_empleado}</TableCell>
      <TableCell>{nombreCompleto}</TableCell>
      <TableCell>{nsede}</TableCell>
      <TableCell>{ndepto}</TableCell>
    </TableRow>
  );
}

AsistenciaEvRow.propTypes = {
  row: PropTypes.object.isRequired,
};