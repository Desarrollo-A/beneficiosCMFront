import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import Label from 'src/components/label';

// ----------------------------------------------------------------------

export default function UserTableRow({ row }) {
  const {
    idColab,
    especialista,
    oficina,
    sede,
    paciente,
    estatus,
    horario,
    sexo,
    motivoCita,
    metodoPago,
    pagoGenerado
  } = row;

  return (
    <TableRow>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{idColab}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }} /* style={{ display: espe ? '' : 'none' }} */>{especialista}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }} /* style={{ display: paci ? '' : 'none' }} */>{paciente}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{oficina}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{sede}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{sexo}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{motivoCita}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{pagoGenerado}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{metodoPago !== null ? metodoPago : 'Pendiente de pago'}</TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={
            (estatus === 'Asistencia' && 'success') ||
            (estatus === 'Por asistir' && 'info') ||
            (estatus === 'Penalización' && 'warning') ||
            (estatus === 'Cancelada' && 'error') ||
            (estatus === 'Justificado' && 'secondary') ||
            'default'
          }
        >
          {estatus}
        </Label>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{horario}</TableCell>
    </TableRow>
  );
}

UserTableRow.propTypes = {
  row: PropTypes.object,
};
