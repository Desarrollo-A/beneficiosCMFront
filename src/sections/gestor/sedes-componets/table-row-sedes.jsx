import PropTypes from 'prop-types';

import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import ModalEditarSedes from './modal-editar-sedes';

// ----------------------------------------------------------------------

export default function TableRowSedes({ row, rol }) {
  const { idSede, sede, abreviacion, estatus } = row;

  const quickEditar = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{idSede}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{sede}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{abreviacion}</TableCell>

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

      <ModalEditarSedes
        idSede={row.idSede}
        sede={sede}
        abreviacion={abreviacion}
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

TableRowSedes.propTypes = {
  row: PropTypes.object,
  rol: PropTypes.any,
  estatus: PropTypes.any,
};
