import { useState } from 'react';
import PropTypes from 'prop-types';

import { Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useBoolean } from 'src/hooks/use-boolean';

import Image from 'src/components/image';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import ModalEstatus from './estatusDialog';
import ModalEditarManuales from './modal-editar-manuales';

// ----------------------------------------------------------------------

export default function TableRowManuales({ row, rol, close }) {
  const {
    id,
    titulo,
    descripcion,
    icono,
    video,
    idRol,
    estatus
  } = row;

  const quickEditar = useBoolean();

  const popover = usePopover();

  const [open4, setOpen4] = useState(false);

  const handleOpen4 = () => {
    setOpen4(true);
  }

  const handleClose4 = () => {
    setOpen4(false);
  }

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <TableRow>

     

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{titulo}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{descripcion}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Image
            disabledEffect
            alt={icono}
            src={icono}
            sx={{ mb: 2, width: 80, height: 80, mx: 'auto' }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {video ? (
          <Button color='primary' variant="outlined" onClick={handleClickOpen}>
            <Iconify icon="tdesign:video" />
          </Button>
          ):(
            null
          )}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{idRol}</TableCell>

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

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>

      </TableRow>

      <ModalEditarManuales
        id={row.id}
        titulo={titulo}
        descripcion={descripcion}
        icono={icono}
        video={video}
        idRol={idRol}
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
          Editar Manual
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleOpen4();
          }}
        >
          {estatus === 1 ?
            <Iconify icon="material-symbols:disabled-by-default" /> :
            <Iconify icon="material-symbols:check-box" />
          }
          {estatus === 1 ?
            'Deshabilitar' :
            'Habilitar'
          }

        </MenuItem>
      </CustomPopover>

      <Dialog
        maxWidth={false}
        open={open4}
        onClose={close}
        PaperProps={{
          sx: { maxWidth: 720 },
        }}
      >
        <ModalEstatus
          id={id}
          onClose={handleClose4}
          estatus={estatus}
        />
      </Dialog>


      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth='lg'
      >
        <DialogTitle id="alert-dialog-title">
         Video
        </DialogTitle>
        <DialogContent>
            <video width="100%" controls>
              <source src={video} type="video/mp4" />
              <track
                kind="captions"
                srcLang="es"
                label="Español"
                default
              />
              Tu navegador no soporta la reproducción de videos.
            </video>
        </DialogContent>
        <DialogActions>
          <Button color='error' variant='contained' onClick={handleClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

TableRowManuales.propTypes = {
  row: PropTypes.object,
  rol: PropTypes.any,
  estatus: PropTypes.any,
  close: PropTypes.func,
};
