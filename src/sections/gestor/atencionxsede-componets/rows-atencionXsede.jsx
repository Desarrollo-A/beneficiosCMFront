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

import ModalArea from './modal-area';
import ModalEstatus from './estatusDialog';
import ModalModalidad from './modal-modalidad';
import ModalEspecialista from './modal-especialista';

// ----------------------------------------------------------------------

export default function RowsAtencionXsede({ row, selected, onEditRow, onDeleteRow, modalidadesData, rol, close, idOficina, tipoCita, idEspecialista, idArea }) {
  const { id, sede, oficina, ubicación, nombre, puesto, idPuesto, modalidad, estatus, nombreArea } = row;

  const popover = usePopover();

  const modalEsp = useBoolean();

  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);
  const [open4, setOpen4] = useState(false); // ver si se puede solo en una

  // const [close] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
  }

  const handleOpen2 = () => {
    setOpen2(true);
  }

  const handleClose2 = () => {
    setOpen2(false);
  }

  const handleOpen3 = () => { // cambiar para que todos se puedan abrir en uno solo
    setOpen3(true);
  }

  const handleClose3 = () => {
    setOpen3(false);
  }

  const handleOpen4 = () => {
    setOpen4(true);
  }

  const handleClose4 = () => {
    setOpen4(false);
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
        
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{nombreArea}</TableCell>

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

      

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 205 }}
      >
        <MenuItem
          onClick={() => {
            handleOpen2();
          
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

        <MenuItem
          onClick={() => {
            handleOpen3();
          }}
        >
          <Iconify icon="material-symbols:edit-document-rounded" />
          Cambio de área
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
        open={open}
        onClose={close}
        PaperProps={{
          sx: { maxWidth: 720 },
        }}
      >
        <ModalEspecialista estatusVal={nombre} id={id} puesto={idPuesto} open={modalEsp.value} onClose={handleClose} />
      </Dialog>

      <Dialog
        maxWidth={false}
        open={open2}
        onClose={close}
        PaperProps={{
          sx: { maxWidth: 720 },
        }}
      >
      <ModalModalidad
        estatusVal={modalidad} 
        modalidadesData={modalidadesData} 
        id={id} 
        onClose={handleClose2}
        idOficina={idOficina}
        tipoCita={tipoCita}
        idEspecialista={idEspecialista} 
        idArea={idArea} />
      </Dialog>

      <Dialog
        maxWidth={false}
        open={open3}
        onClose={close}
        PaperProps={{
          sx: { maxWidth: 720 },
        }}
      >
        <ModalArea
          id={id} 
          onClose={handleClose3}
          idArea={idArea} 
        />
      </Dialog>

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
  close: PropTypes.func,
  idOficina: PropTypes.number,
  tipoCita: PropTypes.number,
  idEspecialista: PropTypes.number,
  idArea: PropTypes.number
};