import { useState } from 'react';
import PropTypes from 'prop-types';

import Zoom from '@mui/material/Zoom';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import ModalEstatus from './estatusDialog';
import ModalEditarFaqs from './modal-editar-faqs';


// Función para recortar el texto
const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) {
      return text;
  }
  return `${text.substring(0, maxLength)}...`;
};


// ----------------------------------------------------------------------

export default function TableRowFaqs({ row, rol, close }) {
  const { 
    id,
    pregunta,
    respuesta,
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

  const maxLength = 80; // Máxima longitud del texto a mostrar en TableCell
  const truncatedDescripcion = truncateText(respuesta, maxLength);

  return (
    <>
      <TableRow>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{id}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{pregunta}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
            {respuesta.length > maxLength ? (
                <Tooltip title={respuesta} TransitionComponent={Zoom} placement="top">
                    <span>{truncatedDescripcion}</span>
                </Tooltip>
            ) : (
              respuesta
            )}
        </TableCell>

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

      <ModalEditarFaqs
        idPregunta={row.idPregunta}
        pregunta={row.pregunta}
        respuesta={row.respuesta}
        idRol={row.idRol}
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
          Editar FAQ
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
          idPregunta={row.idPregunta} 
          onClose={handleClose4}
          estatus={estatus} 
        />
      </Dialog>
    </>
  );
}

TableRowFaqs.propTypes = {
  row: PropTypes.object,
  rol: PropTypes.any,
  estatus: PropTypes.any,
  close: PropTypes.func,
};
