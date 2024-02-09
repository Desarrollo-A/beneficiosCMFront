import PropTypes from 'prop-types';

import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import EditarEstatus from './modal-editar-estatus';
import HistorialCitas from './modal-historial-citas'

// ----------------------------------------------------------------------

export default function UserTableRow({ row, area }) {
  const { id, nombre, correo, sede, estNut, estPsi, estQB, estGE } = row;

  const quickEditar = useBoolean();

  const quickHisCit = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{id}</TableCell>

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>

          <ListItemText
            primary={nombre}
            secondary={correo}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{sede}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {estNut || estPsi || estQB || estGE || ''}
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <EditarEstatus id={row.id} est={area} estatusVal={estNut || estPsi || estQB || estGE} open={quickEditar.value} onClose={quickEditar.onFalse} />

      <HistorialCitas idUsuario={row.idUsuario} open={quickHisCit.value} area={area} onClose={quickHisCit.onFalse} />

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 170 }}
      >
        <MenuItem
          onClick={() => {
            quickHisCit.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="icon-park-twotone:time" />
          Historial citas
        </MenuItem>

        <MenuItem
          onClick={() => {
            quickEditar.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Cambiar estatus
        </MenuItem>
      </CustomPopover>
    </>
  );
}

UserTableRow.propTypes = {
  row: PropTypes.object,
  area: PropTypes.any,
};
