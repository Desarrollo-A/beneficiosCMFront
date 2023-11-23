import PropTypes from 'prop-types';

import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

import UserQuickEditForm from './modal-editar-citas';

// ----------------------------------------------------------------------

export default function FilasTabla({ row, selected, rol, rel  }) {
  const { idCita, idEspecialista, idPaciente, estatus, fechaInicio, fechaFinal, area, observaciones } = row;

  const quickEdit = useBoolean();

  const oficina = 1;

  const sede = 'Querétaro';

  const sexo = 'Masculino';

  const motivo = 'Alimentación';

  let espe = Boolean(true);

  let paci = Boolean(true);

  if (rol === 1) {
    espe = false
  }

  if (rol === 2) {
    paci = false
  }

  return (
    <>

      <TableRow hover selected={selected}>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{idCita}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }} style={{ display: espe ? '' : 'none' }}>{idEspecialista}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }} style={{ display: paci ? '' : 'none' }}>{idPaciente}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{oficina}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{area}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{sede}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{sexo}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{motivo}</TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              (estatus === 'Asistencia' && 'success') ||
              (estatus === 'Por asistir' && 'primary') ||
              (estatus === 'Penalización' && 'warning') ||
              (estatus === 'Cancelada' && 'error') ||
              'default'
            }
          >
            {estatus}
          </Label>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fechaInicio}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fechaFinal}</TableCell>

        {estatus === 'Penalización' && observaciones === null && rol === 3 ? (
          <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }} >
            <Tooltip title="Observación" placement="top" arrow>
              <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
                <Iconify icon="material-symbols:comment-outline" />
              </IconButton>
            </Tooltip>

          </TableCell>
        ) : (

        <TableCell>
          ㅤ
        </TableCell>
        )}

      </TableRow>

      <UserQuickEditForm currentUser={row} open={quickEdit.value} onClose={quickEdit.onFalse} idCita={idCita} row={row} rel={rel}/>

    </>
  );
}

FilasTabla.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  rol: PropTypes.number,
  rel: PropTypes.func,
};
