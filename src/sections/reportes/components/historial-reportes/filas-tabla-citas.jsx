import PropTypes from 'prop-types';

import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { useBoolean } from 'src/hooks/use-boolean';

import { horaCancun, horaTijuana, formatearDosFechaAUna } from 'src/utils/general';

import { useAuthContext } from 'src/auth/hooks';

import Label from 'src/components/label';

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
    narea,
    npuesto,
    sede,
    modalidad,
    numEmpleado,
    paciente,
    estatus,
    horario,
    observaciones,
    sexo,
    motivoCita,
    metodoPago,
    tipoCita,
    monto,
    pagoGenerado,
    color,
    usuario, 
    archivo,
  } = row;
    const quickEdit = useBoolean();
    const modalJust = useBoolean();

    // Dividir la cadena en dos partes
    const partes = horario.split(' - ');
    // Crear las fechas
    const fechaHoraInicio = new Date(partes[0]); // El de las 9
    const fechaHoraFin = new Date(
      partes[1].replace(/(\d{2}:\d{2})$/, `${partes[0].slice(0, 11)}$1`)
    ); // El de las 10

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

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{idColab}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{usuario}</TableCell>

        {rol !== 3 ? (

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{especialista}</TableCell>

        ):(
          null
        )}

        <TableCell sx={{ whiteSpace: 'nowrap' }} >{numEmpleado}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }} >{paciente}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{oficina}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{depto}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{narea}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{npuesto}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{sede}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{modalidad}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{sexo}</TableCell>

        <Tooltip title={motivoCita.length > 19 ? motivoCita : ''} placement="top" arrow>
          <TableCell sx={{
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            minWidth: '200px',
            maxWidth: '100px', 
          }}>{motivoCita}</TableCell>
        </Tooltip>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{pagoGenerado}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{metodoPago}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{monto}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{tipoCita}</TableCell>

        <TableCell>
          <Label
            variant="soft"
            sx={{backgroundColor: `${color}0f`, color}}
          >
            {estatus}
          </Label>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {(user?.idSede === 11 || user?.idSede === 9) && user?.idSede === idColab ? 
            (formatearDosFechaAUna(fechaInicio, fechaFin)) :
            horario
          }
        </TableCell>

        {/* {estatusCita === 3 && (observaciones === null || observaciones === "") && rol === 4 ? (
          <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }} >
            <Tooltip title="Justificar" placement="top" arrow>
              <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
                <Iconify icon="material-symbols:comment-outline" />
              </IconButton>
            </Tooltip>

          </TableCell>
        ) : (
          null
        )} */}

        {/* {estatusCita === 5 && archivo !== null && rol === 4 ? (
          <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }} >
            <Tooltip title="Ver justificación" placement="top" arrow>
              <IconButton color={modalJust.value ? 'inherit' : 'default'} onClick={modalJust.onTrue}>
                <Iconify icon="solar:eye-bold-duotone"/>
              </IconButton>
            </Tooltip>

          </TableCell>
        ) : (
          null
        )} */}

      </TableRow>

      <UserQuickEditForm currentUser={row} open={quickEdit.value} onClose={quickEdit.onFalse} idCita={idCita} row={row} rel={rel} />

      <ModalJustificacion open={modalJust.value} onClose={modalJust.onFalse} idCita={idCita} observacion={observaciones} archivo={archivo}/>

    </>
  );
}

FilasTabla.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  rol: PropTypes.any,
  rel: PropTypes.func,
};
