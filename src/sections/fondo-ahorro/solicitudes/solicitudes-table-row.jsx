import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { fCurrency } from 'src/utils/format-number';

import Iconify from 'src/components/iconify';
import { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function SolicitudesTableRow({ row, selected, onDisableRow, usersMutate }) {
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

  const popover = usePopover();

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

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{nombreEstatusFondo}</TableCell>

      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

SolicitudesTableRow.propTypes = {
  onDisableRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  usersMutate: PropTypes.func,
};
