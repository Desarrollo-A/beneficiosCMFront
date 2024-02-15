import PropTypes from 'prop-types';

import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import EditarDias  from './modal-editar-dias';
import UserQuickEditForm from './modal-ver-encuesta';
import EncuestaHabilitar from './modal-habilitar-encuesta';

// ----------------------------------------------------------------------

export default function EncuestasTablaFilas({ row, selected, puestos }) {
  const { idEncuesta, fechaCreacion, estatus, diasVigencia } = row;

  const popover = usePopover();

  const fecha = new Date(fechaCreacion);

  const fechaForm = fecha.toISOString().split('T')[0];

  const quickEdit = useBoolean();

  const enctHabilitar = useBoolean();

  const editDias = useBoolean();

  return (
    <>

      <TableRow hover selected={selected}>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{idEncuesta}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fechaForm}</TableCell>

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

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{diasVigencia === 0 ||  diasVigencia === null ? '1' : diasVigencia}</TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
        
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >

      <EncuestaHabilitar idEncuesta={row.idEncuesta} puestos={puestos} open={enctHabilitar.value} onClose={enctHabilitar.onFalse} />

      <EditarDias idEncuesta={row.idEncuesta} open={editDias.value} onClose={editDias.onFalse} />

        {estatus === 0 ? (

          <MenuItem
            onClick={enctHabilitar.onTrue}
            sx={{ color: 'success.main' }}
          >
            <Iconify icon="mdi:success" />
            Habilitar
          </MenuItem>

        ) : (

            <Iconify style={{ display: 'none' }} />
        )}

      <UserQuickEditForm idEncuesta={row.idEncuesta} open={quickEdit.value} onClose={quickEdit.onFalse} />

          <MenuItem
          onClick={quickEdit.onTrue}
          >
            <Iconify icon="mdi:eye" />
            Ver
          </MenuItem>

        <MenuItem
          onClick={editDias.onTrue}
          >
            <Iconify icon="solar:pen-bold" />
            Editar dias
          </MenuItem>

      </CustomPopover>

    </>
  );
}

EncuestasTablaFilas.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  puestos: PropTypes.any,
};
