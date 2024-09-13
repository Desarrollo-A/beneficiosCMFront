import dayjs from 'dayjs';
import PropTypes from 'prop-types';

import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { Dialog, IconButton } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { horaCancun, horaTijuana, formatearDosFechaAUna } from 'src/utils/general';

import { useAuthContext } from 'src/auth/hooks';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

import UserQuickEditForm from './modal-editar-citas';
import ModalJustificacion from './modal-justificacion';

// ----------------------------------------------------------------------

export default function FilasTabla({ row, selected, rol, rel }) {
  const { user } = useAuthContext();
  const {
    idCita,
    idColab,
    especialista,
    oficina,
    depto,
    npuesto,
    sede,
    numEmpleado,
    paciente,
    estatus,
    estatusCita,
    horario,
    observaciones,
    metodoPago,
    monto,
    fechaPago,
    color,
    usuario,
    archivo,
    numEspecialista,
    numCita,
    justificado,
  } = row;
  const quickEdit = useBoolean();
  const modalJust = useBoolean();

  // Dividir la cadena en dos partes
  const partes = horario.split(' - ');
  // Crear las fechas
  const fechaHoraInicio = new Date(partes[0]); // El de las 9
  const fechaHoraFin = new Date(partes[1].replace(/(\d{2}:\d{2})$/, `${partes[0].slice(0, 11)}$1`)); // El de las 10

  let horaDeTijuana = horaTijuana(fechaHoraInicio);
  let horaDeCancun = horaCancun(fechaHoraInicio);
  const fechaInicio = user?.idSede === 11 ? horaDeTijuana : horaDeCancun;

  horaDeTijuana = horaTijuana(fechaHoraFin);
  horaDeCancun = horaCancun(fechaHoraFin);
  const fechaFin = user?.idSede === 11 ? horaDeTijuana : horaDeCancun;

  formatearDosFechaAUna(fechaInicio, fechaFin);

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{idCita}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{numEmpleado}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{numEspecialista}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{especialista}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{usuario}</TableCell>

        <TableCell>
          <Label variant="soft" sx={{ backgroundColor: `${color}0f`, color }}>
            {estatus}
          </Label>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{paciente}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{depto}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{npuesto}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{sede}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{oficina}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {(user?.idSede === 11 || user?.idSede === 9) && user?.idSede === idColab
            ? formatearDosFechaAUna(fechaInicio, fechaFin)
            : horario}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{monto}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{metodoPago}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {dayjs(fechaPago).isValid() ? dayjs(fechaPago).format('YYYY-MM-DD HH:mm') : fechaPago}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{numCita}</TableCell>

        {estatusCita === 3 && observaciones === null && justificado === 0 && rol === 3 ? (
          <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
            <Tooltip title="Justificar" placement="top" arrow>
              <IconButton
                color={quickEdit.value ? 'inherit' : 'default'}
                onClick={quickEdit.onTrue}
              >
                <Iconify icon="material-symbols:comment-outline" />
              </IconButton>
            </Tooltip>
          </TableCell>
        ) : null}

        {(estatusCita === 3 || estatusCita === 5) && observaciones !== null ? (
          <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
            <Tooltip title="Ver justificación" placement="top" arrow>
              <IconButton
                color={modalJust.value ? 'inherit' : 'default'}
                onClick={modalJust.onTrue}
              >
                <Iconify icon="solar:eye-bold-duotone" />
              </IconButton>
            </Tooltip>
          </TableCell>
        ) : null}
      </TableRow>

      <Dialog
        fullWidth
        maxWidth={false}
        open={quickEdit.value}
        PaperProps={{
          sx: { maxWidth: 720 },
        }}
        backdrop="static"
      >
        <UserQuickEditForm
          currentUser={row}
          onClose={quickEdit.onFalse}
          idCita={row.idCita}
          row={row}
          rel={rel}
          rol={rol}
        />
      </Dialog>

      <ModalJustificacion
        open={modalJust.value}
        onClose={modalJust.onFalse}
        idCita={row.idCita}
        observacion={observaciones}
        archivo={archivo}
        rol={rol}
        estatusCita={estatusCita}
        justificado={justificado}
      />
    </>
  );
}

FilasTabla.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  rol: PropTypes.any,
  rel: PropTypes.func,
};
