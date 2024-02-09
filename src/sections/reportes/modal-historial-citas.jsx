import { useState } from 'react';
import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Timeline from '@mui/lab/Timeline';
import Dialog from '@mui/material/Dialog';
import TimelineDot from '@mui/lab/TimelineDot';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';

import { endpoints } from 'src/utils/axios';

import { usePostGeneral } from 'src/api/general';
// ----------------------------------------------------------------------

export default function HistorialCitas({ open, onClose, idUsuario, area }) {

  const [data, setData] = useState({
    idUser: idUsuario,
    espe: area
  });

  const { citasData } = usePostGeneral(data, endpoints.reportes.citas, "citasData");

  return (
    <Dialog
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >

      <Card >
        <CardHeader title='Historial Citas' subheader={citasData[0]?.nombre} />

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
            <OrderItem key={index} item={item} lastTimeline={index === citasData.length - 1} />
          ))}
        </Timeline>
      </Card>

    </Dialog>

  );
}

HistorialCitas.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  idUsuario: PropTypes.number,
  area: PropTypes.any,
};

function OrderItem({ item, lastTimeline }) {
  const { titulo, estatus, estatusCita, tipoCita, horario, especialista } = item;

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
            'error.main',
        }}
        />
        {lastTimeline ? null : <TimelineConnector />}
      </TimelineSeparator>

      <TimelineContent>
        <Typography variant="subtitle2">{titulo}</Typography>

        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          {horario}{" | "}{estatus}
        </Typography>
        <Stack spacing={1} >
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
        {especialista}
        </Typography>
        </Stack>
      </TimelineContent>
    </TimelineItem>
  );
}

OrderItem.propTypes = {
  item: PropTypes.any,
  lastTimeline: PropTypes.any,
};
