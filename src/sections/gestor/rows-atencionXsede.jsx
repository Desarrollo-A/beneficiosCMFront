import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import ModalModalidad from './modal-modalidad';
import ModalEspecialista from './modal-especialista';

// ----------------------------------------------------------------------

export default function RowsAtencionXsede({ row, selected, onEditRow, onDeleteRow, modalidadesData  }) {
  const { id, sede, oficina, ubicación, nombre, puesto, idPuesto, modalidad, estatus } = row;

  const confirm = useBoolean();

  const popover = usePopover();

  const modalEsp = useBoolean();

  const modalMod = useBoolean();

  return (
    <>
      <TableRow hover selected={selected}>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{id}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{sede}</TableCell>

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>

          <ListItemText
            primary={oficina}
            secondary={ubicación}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{puesto}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{nombre}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{modalidad}</TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              (estatus === 1 && 'success') ||
              (estatus === 0 && 'error') ||
              'default'
            }
          >
            {estatus === 1 ? 'ACTIVO' : 'INACTIVO'}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>

          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <ModalEspecialista estatusVal={nombre} id={id} puesto={idPuesto} open={modalEsp.value} onClose={modalEsp.onFalse} />

      <ModalModalidad estatusVal={modalidad} modalidadesData={modalidadesData} id={id} open={modalMod.value} onClose={modalMod.onFalse} />

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 205 }}
      >
        <MenuItem
          onClick={() => {
            modalMod.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="tabler:repeat" />
          Cambio de modalidad
        </MenuItem>

        <MenuItem
          onClick={() => {
            modalEsp.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="fa6-solid:user-pen" />
          Cambio de especialista
        </MenuItem>
      </CustomPopover>

    </>
  );
}

RowsAtencionXsede.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  modalidadesData: PropTypes.any,
};
