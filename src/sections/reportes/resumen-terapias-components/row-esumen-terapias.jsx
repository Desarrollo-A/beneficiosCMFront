import PropTypes from 'prop-types';

import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import Label from 'src/components/label';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function UserTableRow({ row }) {
  const {
    idCita,
    idColab,
    especialista,
    oficina,
    area,
    sede,
    paciente,
    estatus,
    horario,
    observaciones,
    sexo,
    motivoCita,
    metodoPago,
    estatusCita,
    fechaModificacion,
    pagoGenerado
  } = row;

  const popover = usePopover();

  return (
      <TableRow>

<TableCell sx={{ whiteSpace: 'nowrap' }}>{idColab}</TableCell>

<TableCell sx={{ whiteSpace: 'nowrap' }} /* style={{ display: espe ? '' : 'none' }} */>{especialista}</TableCell>

<TableCell sx={{ whiteSpace: 'nowrap' }} /* style={{ display: paci ? '' : 'none' }} */>{paciente}</TableCell>

<TableCell sx={{ whiteSpace: 'nowrap' }}>{oficina}</TableCell>

<TableCell sx={{ whiteSpace: 'nowrap' }}>{sede}</TableCell>

<TableCell sx={{ whiteSpace: 'nowrap' }}>{sexo}</TableCell>

<TableCell sx={{ whiteSpace: 'nowrap' }}>{motivoCita}</TableCell>

<TableCell sx={{ whiteSpace: 'nowrap' }}>{pagoGenerado}</TableCell>

<TableCell sx={{ whiteSpace: 'nowrap' }}>{metodoPago !== null ? metodoPago : 'Pendiente de pago'}</TableCell>

<TableCell>
  <Label
    variant="soft"
    color={
      (estatus === 'Asistencia' && 'success') ||
      (estatus === 'Por asistir' && 'info') ||
      (estatus === 'Penalización' && 'warning') ||
      (estatus === 'Cancelada' && 'error') ||
      (estatus === 'Justificado' && 'secondary') ||
      'default'
    }
  >
    {estatus}
  </Label>
</TableCell>

<TableCell sx={{ whiteSpace: 'nowrap' }}>{horario}</TableCell>
      </TableRow>
  );
}

UserTableRow.propTypes = {
  row: PropTypes.object,
  area: PropTypes.any,
};
