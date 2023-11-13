import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
// import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import UserQuickEditForm from './edit-user-dialog';

// ----------------------------------------------------------------------

export default function UserTableRow({ row, selected, onEditRow, onDeleteRow }) {
  const { id, nombre, telefono, area, oficina, sede, correo } = row;

  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();

  return (
    <>

      <TableRow hover selected={selected}>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{id}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{nombre}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{telefono}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{area}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{oficina}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{sede}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{correo}</TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap'}}>

          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <UserQuickEditForm currentUser={row} open={quickEdit.value} onClose={quickEdit.onFalse} />
      
        { /* SELECTS AL BORRAR */ } 
        <CustomPopover
          open={popover.open}
          onClose={popover.onClose}
          arrow="right-top"
          sx={{ width: 140 }}
        >
          <MenuItem
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Borrar
          </MenuItem>

          <MenuItem
            onClick={quickEdit.onTrue}
          >
            <Iconify icon="solar:pen-bold" />
            Editar
          </MenuItem>
        </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Borrar"
        content="¿Estas seguro de borrar este usuario?"
        action={ 
          <Button variant="contained" color="error" onClick={() => {
            onDeleteRow();
            confirm.onFalse();
          }}>
            Borrar
          </Button>
        }
      />
    </>
  );
}

UserTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
