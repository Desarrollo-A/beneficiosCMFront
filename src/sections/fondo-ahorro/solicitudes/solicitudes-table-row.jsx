import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export default function SolicitudesTableRow({ row, selected }) {
  const {
    idFondo,
    idContrato,
    nombre_persona,
    pri_apellido,
    sec_apellido,
    fechaInicio,
    fechaFin,
    monto,
    esReinversion,
    nombreEstatusFondo,
  } = row;

  return (
    <TableRow hover selected={selected}>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{idFondo}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{idContrato}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {nombre_persona} {pri_apellido} {sec_apellido}
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fechaInicio}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fechaFin}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fCurrency(monto)}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{esReinversion === 1 ? 'SÍ' : 'NO'}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{nombreEstatusFondo.toUpperCase()}</TableCell>
    </TableRow>
  );
}

SolicitudesTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
};
