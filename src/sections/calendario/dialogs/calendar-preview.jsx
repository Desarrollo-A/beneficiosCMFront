import 'dayjs/locale/es';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';

import Timeline from '@mui/lab/Timeline';
import Dialog from '@mui/material/Dialog';
import TimelineDot from '@mui/lab/TimelineDot';
import { useTheme } from '@mui/material/styles';
import DialogTitle from '@mui/material/DialogTitle';
import TimelineContent from '@mui/lab/TimelineContent';
import DialogContent from '@mui/material/DialogContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import { Grid, Stack, Button, Typography, DialogActions } from '@mui/material';

import Iconify from 'src/components/iconify';

export default function CalendarPreview({ event, open, handleClose }) {

  const theme = useTheme();

  return (
    <Dialog
      open={open}
      fullWidth
      disableEnforceFocus
      maxWidth="xs"
      
    >
      <DialogTitle sx={{ p: { xs: 1, md: 1 } }}>
        <Stack spacing={1} sx={{ p: { xs: 1, md: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">
              DATOS DE CITA
            </Typography>
          </Stack>
          <Typography variant="subtitle1">
            {event?.start ? dayjs(event.start).format('dddd, DD MMMM YYYY') : 'Fecha desconocida'}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent
        style={{
          maxHeight: '400px',
          overflowY: 'auto',
        }}
        sx={{
          p: { xs: 1, md: 2 },
          backgroundColor: theme.palette.mode === 'dark' ? '#25303d' : '#f6f7f8',
        }}
        direction="row"
        justifycontent="space-between"
      >
        <Grid container direction="column" justifyContent="space-between">
          <Grid item container direction="row" spacing={1} sx={{ width: '100%' }}>
            <Grid xs={12}>
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
                <TimelineItem>

                  <TimelineSeparator>
                    <TimelineDot className="icons">
                      <Iconify
                        icon="fluent:form-28-filled"
                        width={30}
                        sx={{ color: '#5551dd' }}
                      />
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>

                  <TimelineContent>
                    <Typography variant="subtitle1">Cita</Typography>

                    {event?.estatus === 1 && event?.modalidad === 1 ? (
                      <Typography variant="body2" sx={{ color: 'text.disabled' }} mb={3}>
                        Cita en {`${event?.beneficio} (por asistir - primera cita)`}
                      </Typography>
                    ) : (
                      ''
                    )}
                    {event?.estatus === 1 && event?.modalidad !== 1 ? (
                      <Typography variant="body2" sx={{ color: 'text.disabled' }} mb={3}>
                        Cita en {`${event?.beneficio} (por asistir)`}
                      </Typography>
                    ) : (
                      ''
                    )}
                    {event?.estatus === 2 ? (
                      <Typography variant="body2" sx={{ color: 'text.disabled' }} mb={3}>
                        Cita en {`${event?.beneficio} (cancelado)`}
                      </Typography>
                    ) : (
                      ''
                    )}
                    {event?.estatus === 3 ? (
                      <Typography variant="body2" sx={{ color: 'text.disabled' }} mb={3}>
                        Cita en {`${event?.beneficio} (penalizado)`}
                      </Typography>
                    ) : (
                      ''
                    )}
                    {event?.estatus === 4 ? (
                      <Typography variant="body2" sx={{ color: 'text.disabled' }} mb={3}>
                        Cita en {`${event?.beneficio} (finalizada)`}
                      </Typography>
                    ) : (
                      ''
                    )}
                    {event?.estatus === 5 ? (
                      <Typography variant="body2" sx={{ color: 'text.disabled' }} mb={3}>
                        Cita en {`${event?.beneficio} (justificado)`}
                      </Typography>
                    ) : (
                      ''
                    )}
                    {event?.estatus === 6 ? (
                      <Typography variant="body2" sx={{ color: 'text.disabled' }} mb={3}>
                        Cita en {`${event?.beneficio} (pendiente de pago)`}
                      </Typography>
                    ) : (
                      ''
                    )}
                    {event?.estatus === 7 ? (
                      <Typography variant="body2" sx={{ color: 'text.disabled' }} mb={3}>
                        Cita en {`${event?.beneficio} (cancelado por especialista)`}
                      </Typography>
                    ) : (
                      ''
                    )}
                    {event?.estatus === 8 ? (
                      <Typography variant="body2" sx={{ color: 'text.disabled' }} mb={3}>
                        Cita en {`${event?.beneficio} (reagendado)`}
                      </Typography>
                    ) : (
                      ''
                    )}
                    {event?.estatus === 9 ? (
                      <Typography variant="body2" sx={{ color: 'text.disabled' }} mb={3}>
                        Cita en {`${event?.beneficio} (cita expirada)`}
                      </Typography>
                    ) : (
                      ''
                    )}
                    {event?.estatus === 10 ? (
                      <Typography variant="body2" sx={{ color: 'text.disabled' }} mb={3}>
                        Cita en {`${event?.beneficio} (proceso de pago)`}
                      </Typography>
                    ) : (
                      ''
                    )}

                  </TimelineContent>
                </TimelineItem>

                <TimelineItem>
                  <TimelineSeparator >
                    <TimelineDot
                      className='icons'
                    >
                      <Iconify
                        icon="mdi:account-circle"
                        width={30}
                        sx={{ color: '#c9a61d' }}
                      />
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>

                  <TimelineContent>
                    <Typography variant="subtitle1">Especialista</Typography>

                    <Typography variant="body2" sx={{ color: 'text.disabled' }} mb={3}>
                      {event?.especialista ? event?.especialista : 'Especialista'}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>

                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot className="icons">
                      <Iconify icon="mdi:phone" width={30} sx={{ color: '#3399ff' }} />
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>

                  <TimelineContent>
                    <Typography variant="subtitle1">Teléfono</Typography>

                    <Typography variant="body2" sx={{ color: 'text.disabled' }} mb={3}>
                      {event?.telefonoEspecialista ? event?.telefonoEspecialista : 'n/a'}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>

                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot className="icons">
                      <Iconify
                        icon="mdi:calendar-clock"
                        width={30}
                        sx={{ color: 'orange' }}
                      />
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>

                  <TimelineContent>
                    <Typography variant="subtitle1">Horario</Typography>

                    <Typography variant="body2" sx={{ color: 'text.disabled' }} mb={3}>
                      {event?.id
                        ? `${dayjs(event?.start).format('HH:mm a')} - ${dayjs(event?.end).format(
                          'HH:mm a'
                        )}`
                        : 'Fecha'}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>

                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot className="icons">
                      <Iconify icon="mdi:earth" width={30} sx={{ color: '#1ac949' }} />
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>

                  <TimelineContent>
                    <Typography variant="subtitle1">Sede</Typography>

                    <Typography variant="body2" sx={{ color: 'text.disabled' }} mb={3}>
                      {event?.sede ? event?.sede : 'Sede desconocida'}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>

                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot className="icons">
                      <Iconify
                        icon="ic:outline-place"
                        width={30}
                        sx={{ color: '#084a73' }}
                      />
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>

                  <TimelineContent>
                    <Typography variant="subtitle1">Ubicación</Typography>

                    <Typography variant="body2" sx={{ color: 'text.disabled' }} mb={3}>
                      {event?.ubicación
                        ? event?.ubicación
                        : 'Ubicación desconocida'}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>

                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot className="icons">
                      <Iconify
                        icon="ic:outline-email"
                        width={30}
                        sx={{ color: 'gray' }}
                      />
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>

                  <TimelineContent>
                    <Typography variant="subtitle1">Correo</Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.disabled',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word', // Esto permitirá que las palabras largas se dividan y se envuelvan a la siguiente línea
                      }}
                      mb={3}
                    >
                      {event?.correoEspecialista
                        ? event?.correoEspecialista.toLowerCase()
                        : 'correo-demo@ciudadmaderas.com.mx'}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>

                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot className="icons">
                      <Iconify
                        icon="fa-solid:money-bill"
                        width={30}
                        sx={{ color: '#16d6d7' }}
                      />
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>

                  <TimelineContent>
                    <Typography variant="subtitle1">Pago</Typography>

                    <Typography variant="body2" sx={{ color: 'text.disabled' }} mb={3}>
                      {event?.idDetalle === null ||
                        event?.idDetalle === 0 ? (
                        'Sin pago'
                      ) : (
                        <>
                          {event?.estatusPago === 1 ||
                            event?.estatusPago === 3
                            ? 'Pago aprobado'
                            : 'Pago declinado'}
                        </>
                      )}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>

              </Timeline>

            </Grid>
          </Grid>
        </Grid>

      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="error" onClick={handleClose}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CalendarPreview.propTypes = {
  event: PropTypes.object,
  open: PropTypes.bool,
  handleClose: PropTypes.func,
};
