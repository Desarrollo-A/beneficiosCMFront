import PropTypes from 'prop-types';

import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
// import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import ModalEditarOficinas from './modal-editar-oficinas';

// ----------------------------------------------------------------------

export default function TableRowOficinas({ row, rol }) {
  const { idOficina, oficina, idSede, sede, ubicación, estatus } = row;

  const quickEditar = useBoolean();

  // const quickHisCit = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{idOficina}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{oficina}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{sede}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ubicación}</TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              (estatus === 1 && 'success') ||
              (estatus === 0 && 'error')
            }
          >
            {estatus === 1 ? 'ACTIVA' : 'INACTIVA'}
          </Label>
        </TableCell>

        {rol === 4 ? (
          <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </TableCell>
        ) : (
          null
        )}

      </TableRow>

      <ModalEditarOficinas
        idOficina={row.idOficina}
        oficina={oficina}
        sede={idSede}
        ubicación={ubicación}
        estatus={estatus}
        open={quickEditar.value}
        onClose={quickEditar.onFalse}
      />

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 170 }}
      >

        <MenuItem
          onClick={() => {
            quickEditar.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Editar datos
        </MenuItem>
      </CustomPopover>
    </>
  );
}

TableRowOficinas.propTypes = {
  row: PropTypes.object,
  rol: PropTypes.any,
  estatus: PropTypes.any,
};
