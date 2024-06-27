import PropTypes from 'prop-types';

import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import ModalUsuarios from './modal-usuarios';
// ----------------------------------------------------------------------

export default function TableRowUsuarios({ row, close }) {
  const { 
    id, 
    numEmpleado,
    nombre, 
    sede,
    departamento,
    area,
    puesto, 
    correo, 
    fechaCreacion,
    servicios,

    estatus, 
    rol, 
    contrato,
    password,
    
  } = row;

  const quickEditar = useBoolean();

  // const quickHisCit = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{id}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{numEmpleado}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{nombre}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{sede}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{departamento}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{area}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{puesto}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{correo}</TableCell>
        
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fechaCreacion}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{servicios}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{rol}</TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              (estatus === 1 && 'success') ||
              (estatus === 0 && 'error')
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

      <ModalUsuarios
        nombre={nombre}
        id={row.id}
        contrato={contrato}
        numEmpleado={numEmpleado}
        correo={correo}
        password={password}
        sede={sede}
        departamento={departamento}
        area={area}
        puesto={puesto}
        rol={rol}
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
          <Iconify icon="solar:eye-bold" />
          Ver
        </MenuItem>
      </CustomPopover>
    </>
  );
}

TableRowUsuarios.propTypes = {
  row: PropTypes.object,
  estatus: PropTypes.any,
  close: PropTypes.func,
};
