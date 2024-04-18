import PropTypes from 'prop-types';
import { useRef, useState, useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import DialogContentText from '@mui/material/DialogContentText';

import { useBoolean } from 'src/hooks/use-boolean';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import EditarEstatus from './modal-editar-estatus';
import HistorialCitas from './modal-historial-citas'

// ----------------------------------------------------------------------

export default function RowResumenTerapias({ row, area, idUs, rol, typeusersData }) {

  const {
    nombre,
    correo,
    depto,
    sede,
    puesto,
    estNut,
    estPsi,
    estQB,
    estGE,
    usuario
   } = row;

  const quickEditar = useBoolean();

  const quickHisCit = useBoolean();

  const popover = usePopover();

  const [us, setUs] = useState(0);

  const [open, setOpen] = useState(false);

  const [close] = useState(false);

  const [scroll, setScroll] = useState('paper');

  const descriptionElementRef = useRef(null);
  useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  const handleClickOpen = (scrollType) => () => {
    setOpen(true);
    setScroll(scrollType);
  };

  const handleOpen = (idUsuario) => {
    setUs(idUsuario);
    setOpen(true);
  }

  const handleClose = () => {
    setUs(0);
    setOpen(false);
  }

  return (
    <>
      <TableRow>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.idUsuario}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{usuario}</TableCell>

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

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{depto}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{sede}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{puesto}</TableCell>

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

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 170 }}
      >
        <MenuItem
          onClick={() => {
            handleOpen(row.idUsuario);
            handleClickOpen('paper');
          }}
        >
          <Iconify icon="icon-park-twotone:time" />
          Historial citas
        </MenuItem>

        {rol === 4 || rol === 1 ? (
          <MenuItem
            onClick={() => {
              quickEditar.onTrue();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Cambiar estatus
          </MenuItem>
        ) : (
          null
        )}
      </CustomPopover>


      <Dialog
        fullWidth
        maxWidth={false}
        open={open}
        onClose={close}
        PaperProps={{
          sx: { maxWidth: 420 },
        }}
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
         <DialogContentText
         id="scroll-dialog-description"
         ref={descriptionElementRef}
         tabIndex={-1}>
        <HistorialCitas idUsuario={us} area={area} rol={rol} idUs={idUs} open={quickHisCit.value} onClose={handleClose} typeusersData={typeusersData} />
        </DialogContentText>
      </Dialog>
    </>
  );
}

RowResumenTerapias.propTypes = {
  row: PropTypes.object,
  area: PropTypes.any,
  idUs: PropTypes.any,
  rol: PropTypes.any,
  typeusersData: PropTypes.any
};
