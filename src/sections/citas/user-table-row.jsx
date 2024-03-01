import PropTypes from 'prop-types';

import Tooltip from '@mui/material/Tooltip';
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
    estatus,
    color } = row;

  return (
      <TableRow>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{id}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{beneficio}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{especialista}</TableCell>

        <Tooltip title={motivoCita.length > 19 ? motivoCita : ''} placement="top" arrow>
          <TableCell sx={{
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            minWidth: '200px',
            maxWidth: '100px', 
          }}>{motivoCita}</TableCell>
        </Tooltip>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{sede}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{oficina}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{pagoGenerado}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{metodoPago}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{horario}</TableCell>

        <TableCell>
          <Label
            variant="soft"
            sx={{backgroundColor: `${color}0f`, color}}
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
