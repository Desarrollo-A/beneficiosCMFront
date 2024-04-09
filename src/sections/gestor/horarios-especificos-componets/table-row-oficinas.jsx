import { useState } from 'react';
import PropTypes from 'prop-types';

import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
// import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import ModalEstatus from './estatusDialog';
import ModalEditarOficinas from './modal-editar-oficinas';

// ----------------------------------------------------------------------

export default function TableRowOficinas({ row, rol, close }) {
  const { 
    idHorario, 
    beneficio,
    especialista, 
    horario, 
    horarioSabado, 
    estatus, 
    horaInicio, 
    horaFin, 
    sabados,
    horaInicioSabado,
    horaFinSabado
  } = row;

  const quickEditar = useBoolean();

  // const quickHisCit = useBoolean();

  const popover = usePopover();

  const [open4, setOpen4] = useState(false);

  const handleOpen4 = () => {
    setOpen4(true);
  }

  const handleClose4 = () => {
    setOpen4(false);
  }

  return (
    <>
      <TableRow>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{idHorario}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{beneficio}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{especialista}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{horario}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{horarioSabado}</TableCell>

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

      <ModalEditarOficinas
        especialista={especialista}
        idHorario={row.idHorario}
        horaInicio={horaInicio}
        horaFin={horaFin}
        sabado={sabados}
        horaInicioSabado={horaInicioSabado}
        horaFinSabado={horaFinSabado}
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
          Editar horario
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
          id={idHorario} 
          onClose={handleClose4}
          estatus={estatus} 
        />
      </Dialog>
    </>
  );
}

TableRowOficinas.propTypes = {
  row: PropTypes.object,
  rol: PropTypes.any,
  estatus: PropTypes.any,
  close: PropTypes.func,
};
