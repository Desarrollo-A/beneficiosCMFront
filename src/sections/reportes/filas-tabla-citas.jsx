import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import UserQuickEditForm from './modal-editar-citas';

// ----------------------------------------------------------------------

export default function UserTableRow({ row, selected, onEditRow, onDeleteRow, rol }) {
  const { idCita, idEspecialista, idPaciente, estatus, fechaInicio, fechaFinal, area } = row;

  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();

  const oficina = 1;

  const sede = 'Querétaro';

  const sexo = 'Masculino';

  const motivo = 'Alimentación';

  let espe = Boolean(true);

  let paci = Boolean(true);

  let admin = Boolean(false);

  if(rol === 1 ){
    espe = false
  }

  if(rol === 2 ){
    paci = false
  }

  if(rol === 3 ){
    admin = true
  }

  return (
    <>

      <TableRow hover selected={selected}>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{idCita}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }} style={{display: espe ? '' : 'none' }}>{idEspecialista}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }} style={{display: paci ? '' : 'none' }}>{idPaciente}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{oficina}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{area}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{sede}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{sexo}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{motivo}</TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              (estatus === 'Asistencia' && 'success') ||
              (estatus === 'Penalización' && 'warning') ||
              (estatus === 'Cancelada' && 'error') ||
              'default'
            }
          >
            {estatus}
          </Label>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fechaInicio}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fechaFinal}</TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap'}} style={{display: admin ? '' : 'none' }} >
          <Tooltip title="Editar" placement="top" arrow>
            <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>

          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>

      </TableRow>

      <UserQuickEditForm currentUser={row} open={quickEdit.value} onClose={quickEdit.onFalse} />
      
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
            onClick={() => {
              onEditRow();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Editar
          </MenuItem>
        </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Borrar"
        content="Estas seguro de borrar?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
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
  rol: PropTypes.number
};
