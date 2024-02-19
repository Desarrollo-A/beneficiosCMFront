import { useState } from 'react';
import PropTypes from 'prop-types';

import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import ModalModalidad from './modal-modalidad';
import ModalEspecialista from './modal-especialista';

// ----------------------------------------------------------------------

export default function RowsAtencionXsede({ row, selected, onEditRow, onDeleteRow, modalidadesData, rol, close }) {
  const { id, sede, oficina, ubicación, nombre, puesto, idPuesto, modalidad, estatus } = row;

  const popover = usePopover();

  const modalEsp = useBoolean();

  const modalMod = useBoolean();

  const [open, setOpen] = useState(false);

  // const [close] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
  }

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
            {estatus === 1 || estatus === "1" ? 'ACTIVO' : 'INACTIVO'}
          </Label>
        </TableCell>

        {rol === "4" || rol === 4 || rol === "1" || rol === 1 ? (

          <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>

            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </TableCell>

        ) : (

          <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}/>
          
        )}
      </TableRow>

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
            handleOpen();
          }}
        >
          <Iconify icon="fa6-solid:user-pen" />
          Cambio de especialista
        </MenuItem>
      </CustomPopover>

      <Dialog
        maxWidth={false}
        open={open}
        onClose={close}
        PaperProps={{
          sx: { maxWidth: 720 },
        }}
      >
        <ModalEspecialista estatusVal={nombre} id={id} puesto={idPuesto} open={modalEsp.value} onClose={handleClose} />
      </Dialog>

    </>
  );
}

RowsAtencionXsede.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  modalidadesData: PropTypes.any,
  rol: PropTypes.any,
  close: PropTypes.func
};
