import PropTypes from 'prop-types';

import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { horaCancun, horaTijuana, formatearDosFechaAUna } from 'src/utils/general';

import { useAuthContext } from 'src/auth/hooks';

import Label from 'src/components/label';

// ----------------------------------------------------------------------

export default function RowResumenTerapias({ row, area, idUs, rol }) {
  const { user } = useAuthContext();

  const {
    id,
    beneficio,
    especialista,
    motivoCita,
    sede,
    oficina,
    pagoGenerado,
    metodoPago,
    horario,
    estatus,
    color, 
    idSedeEsp } = row;

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
      <TableRow>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{id}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{beneficio}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{especialista}</TableCell>

        <Tooltip title={motivoCita.length > 19 ? motivoCita : ''} placement="top" arrow>
          <TableCell sx={{
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            minWidth: '200px',
            maxWidth: '100px', 
          }}>{motivoCita}</TableCell>
        </Tooltip>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{sede}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{oficina}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{pagoGenerado}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{metodoPago}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {(user?.idSede === 11 || user?.idSede === 9) && user?.idSede === idSedeEsp ? 
            (formatearDosFechaAUna(fechaInicio, fechaFin)) :
            horario
        }
        </TableCell>

        <TableCell>
          <Label
            variant="soft"
            sx={{backgroundColor: `${color}0f`, color}}
          >
            {estatus}
          </Label>
        </TableCell>
      </TableRow>

  );
}

RowResumenTerapias.propTypes = {
  row: PropTypes.object,
  area: PropTypes.any,
  idUs: PropTypes.any,
  rol: PropTypes.any,
};
