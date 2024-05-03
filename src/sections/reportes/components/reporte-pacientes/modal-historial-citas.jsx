import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Timeline from '@mui/lab/Timeline';
import Button from '@mui/material/Button';
import TimelineDot from '@mui/lab/TimelineDot';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import TimelineContent from '@mui/lab/TimelineContent';
import DialogActions from '@mui/material/DialogActions';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import CircularProgress from '@mui/material/CircularProgress';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import { useAuthContext } from 'src/auth/hooks';
import { formatearDosFechaAUna, horaTijuana, toLocalISOString } from 'src/utils/general';


import { endpoints } from 'src/utils/axios';

import { usePostGeneral } from 'src/api/general';
// ----------------------------------------------------------------------
export default function HistorialCitas({ open, onClose, idUsuario, area, idUs, rol, typeusersData }) {
  let espe = '';
  const { user } = useAuthContext();
  switch (area) {
    case 158:
      espe = 'Quantum Balance';
      break;
    case 585:
      espe = 'Psicología';
      break;
    case 537:
      espe = 'Nutrición';
      break;
    case 686:
      espe = 'Guía Espiritual';
      break;
    default:
  }

  const [data, setData] = useState({
    idUser: idUsuario,
    espe: area,
    idEspe: idUs,
    idRol: rol,
    tipoUsuario: typeusersData
  });

  useEffect(() => {
    setData({
      idUser: idUsuario,
      espe: area,
      idEspe: idUs,
      idRol: rol,
      tipoUsuario: typeusersData
    });
  }, [idUsuario, area, idUs, rol, typeusersData ]);

  const { citasData } = usePostGeneral(data, endpoints.reportes.citas, 'citasData');
  

  return (
    <>
      {citasData.length > 0 ? (
        <Card>
          <CardHeader title="Historial Citas" subheader={citasData[0]?.nombre} />
          <Typography
            variant="caption"
            sx={{
              color: 'text.disabled',
              p: 3,
              pr: { xs: 2.5, md: 2.5 },
            }}
          >
            {espe}
          </Typography>
          <Timeline
            sx={{
              m: 0,
              p: 3,
              [`& .${timelineItemClasses.root}:before`]: {
                flex: 0,
                padding: 0,
              },
            }}
          >
            {citasData.map((item, index) => (
              <OrderItem key={index} item={item} lastTimeline={index === citasData.length - 1} user={user}/>
            ))}
          </Timeline>

          <DialogActions>
            <Button variant="contained" color="error" onClick={onClose}>
              Cerrar
            </Button>
          </DialogActions>
        </Card>
      ) : (
        <Card sx={{ pr: 2, pl: 1 }}>
          <CardHeader title="Historial Citas" />

          <Grid container spacing={1} sx={{ p: 5 }} justifyContent="center" alignItems="center">
            <CircularProgress />
          </Grid>
        </Card>
      )}
    </>
  );
}

HistorialCitas.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  idUsuario: PropTypes.number,
  area: PropTypes.any,
  rol: PropTypes.any,
  idUs: PropTypes.any,
  typeusersData: PropTypes.any
};

function OrderItem({ item, lastTimeline, user }) {
  const { estatus, estatusCita, horario, especialista, motivoCita } = item; // tipoCita

  // Dividir la cadena en dos partes
  const partes = horario.split(' - ');
  // Crear las fechas
  const fechaHoraInicio = new Date(partes[0]); // El de las 9
  const fechaHoraFin = new Date(
    partes[1].replace(/(\d{2}:\d{2})$/, `${partes[0].slice(0, 11)}$1`)
  ); // El de las 10

  let horaDeTijuana = horaTijuana(fechaHoraInicio);
  const fechaInicio = horaDeTijuana;

  horaDeTijuana = horaTijuana(fechaHoraFin);
  const fechaFin = horaDeTijuana;

  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot
          sx={{
            backgroundColor:
              (estatusCita === 0 && 'red') ||
              (estatusCita === 1 && 'orange') ||
              (estatusCita === 2 && 'red') ||
              (estatusCita === 3 && 'grey') ||
              (estatusCita === 4 && 'green') ||
              (estatusCita === 5 && 'pink') ||
              (estatusCita === 6 && 'blue') ||
              (estatusCita === 7 && 'red') ||
              (estatusCita === 8 && 'red') ||
              (estatusCita === 9 && 'red') ||
              (estatusCita === 10 && 'purple') ||
              'error.main',
          }}
        />
        {lastTimeline ? null : <TimelineConnector />}
      </TimelineSeparator>

      <TimelineContent>
        <Typography variant="subtitle2">
        {user.idSede === 11 ? 
            (formatearDosFechaAUna(fechaInicio, fechaFin)) :
            horario
          }
        </Typography>

        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          {estatus}
        </Typography>
        <Stack spacing={1}>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            Especialista: {especialista}
          </Typography>
        </Stack>
        <Stack spacing={1}>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            {motivoCita}
          </Typography>
        </Stack>
      </TimelineContent>
    </TimelineItem>
  );
}

OrderItem.propTypes = {
  item: PropTypes.any,
  lastTimeline: PropTypes.any,
  user: PropTypes.any
};
