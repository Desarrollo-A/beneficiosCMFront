import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import Label from 'src/components/label';

// ----------------------------------------------------------------------

export default function RowResumenTerapias({ row, area, idUs, rol }) {
  const {
    id,
    beneficio,
    especialista,
    motivoCita,
    sede,
    oficina,
    pagoGenerado,
    metodoPago,
    horario,
    estatus, } = row;

  return (
      <TableRow>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{id}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{beneficio}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{especialista}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{motivoCita}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{sede}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{oficina}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{pagoGenerado}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{metodoPago}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{horario}</TableCell>

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
      </TableRow>

  );
}

RowResumenTerapias.propTypes = {
  row: PropTypes.object,
  area: PropTypes.any,
  idUs: PropTypes.any,
  rol: PropTypes.any,
};
