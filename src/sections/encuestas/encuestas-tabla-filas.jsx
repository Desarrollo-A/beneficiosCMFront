import PropTypes from 'prop-types';

import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { usePostGeneral } from 'src/api/general';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import UserQuickEditForm from './modal-ver-encuesta';
import EncuestaHabilitar from './modal-habilitar-encuesta';

// ----------------------------------------------------------------------

export default function EncuestasTablaFilas({ row, selected, puestos }) {
  const { idEncuesta, idTipoEnc, tipoEncuesta, fechaCreacion, estatus } = row;

 // const { EstatusData } = usePostGeneral(area, endpoints.encuestas.getEstatusUno, "EstatusData");

  const popover = usePopover();

  const fecha = new Date(fechaCreacion);

  const fechaForm = fecha.toISOString().split('T')[0];

  const quickEdit = useBoolean();

  const enctHabilitar = useBoolean();

  return (
    <>

      <TableRow hover selected={selected}>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{idEncuesta}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{tipoEncuesta}</TableCell>

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

      <EncuestaHabilitar idEncuesta={row.idEncuesta} puestos={puestos} open={enctHabilitar.value} idTipoEnc={idTipoEnc} onClose={enctHabilitar.onFalse} />

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
            Ver encuesta
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
