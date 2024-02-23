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

export default function UserTableRow({ row, selected, onDisableRow, usersMutate }) {
  const { id, nombre, telefono, sexo, correo, estatus } = row;

  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{id}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{nombre}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{telefono || 'No aplica'}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{correo || 'No aplica'}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {['f', 'F'].includes(sexo) ? 'FEMENINO' : 'MASCULINO'}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{estatus === 1 ? 'ACTIVO' : 'INACTIVO'}</TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <UserQuickEditForm
        key={row.id}
        currentUser={row}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
        usersMutate={usersMutate}
        popoverOnClose={popover.onClose}
      />

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
          sx={{ color: estatus === 1 ? 'error.main' : 'info.main' }}
        >
          {estatus === 1 ? (
            <Iconify icon="solar:user-block-bold" />
          ) : (
            <Iconify icon="solar:user-check-bold" />
          )}
          {estatus === 1 ? 'Deshabilitar' : 'Habilitar'}
        </MenuItem>

        <MenuItem onClick={quickEdit.onTrue}>
          <Iconify icon="solar:pen-bold" />
          Editar
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={estatus === 1 ? 'Deshabilitar' : 'Habilitar'}
        content={
          estatus === 1
            ? '¿Estás seguro de deshabilitar este usuario?'
            : '¿Estás seguro de habilitar este usuario?'
        }
        action={
          <Button
            variant="contained"
            color={estatus === 1 ? 'error' : 'info'}
            onClick={() => {
              onDisableRow();
              confirm.onFalse();
              popover.onClose();
            }}
          >
            {estatus === 1 ? 'Deshabilitar' : 'Habilitar'}
          </Button>
        }
      />
    </>
  );
}

UserTableRow.propTypes = {
  onDisableRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  usersMutate: PropTypes.func,
};
