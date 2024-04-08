import 'dayjs/locale/es';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { Dialog, DialogContent } from '@material-ui/core';

import DialogTitle from '@mui/material/DialogTitle';
import { Stack, Button, Typography, DialogActions } from '@mui/material';

import Iconify from 'src/components/iconify';

export default function CalendarPreview({ event, open, handleClose }) {
  return (
    <Dialog
      open={open}
      fullWidth
      disableEnforceFocus
      maxWidth="xs"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle sx={{ paddingLeft: { xs: 1, md: 2 }, paddingRight: { xs: 1, md: 2 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          useFlexGap
          flexWrap="wrap"
          sx={{ paddingLeft: { xs: 1, md: 2 }, paddingRight: { xs: 1, md: 2 } }}
        >
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
            DATOS DE CITA
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ paddingLeft: { xs: 1, md: 2 }, paddingRight: { xs: 1, md: 2 } }}>
          <Typography variant="subtitle1">
            {event?.start ? dayjs(event.start).format('dddd, DD MMMM YYYY') : 'Fecha desconocida'}
          </Typography>
        </Stack>

        <Stack
          alignItems="center"
          sx={{
            flexDirection: 'row',
            px: { xs: 1, md: 2 },
            py: 1,
            alignItems: 'center',
          }}
        >
          <Stack
            alignItems="center"
            sx={{
              alignItems: 'center',
              display: 'flex',
            }}
          >
            <Iconify icon="mdi:account-circle" width={30} sx={{ color: 'text.disabled' }} />
          </Stack>
          <Stack
            alignItems="center"
            sx={{
              alignItems: 'center',
              display: 'flex',
            }}
          >
            {event?.estatus === 1 ? (
              <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                Cita en {`${event?.beneficio} (por asistir)`}
              </Typography>
            ) : (
              ''
            )}
            {event?.estatus === 2 || event?.estatus === 7 ? (
              <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                Cita en {`${event?.beneficio} (cancelado)`}
              </Typography>
            ) : (
              ''
            )}
            {event?.estatus === 3 ? (
              <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                Cita en {`${event?.beneficio} (penalizado)`}
              </Typography>
            ) : (
              ''
            )}
            {event?.estatus === 4 ? (
              <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                Cita en {`${event?.beneficio} (finalizada)`}
              </Typography>
            ) : (
              ''
            )}
            {event?.estatus === 5 ? (
              <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                Cita en {`${event?.beneficio} (justificado)`}
              </Typography>
            ) : (
              ''
            )}
            {event?.estatus === 6 ? (
              <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                Cita en {`${event?.beneficio} (pendiente de pago)`}
              </Typography>
            ) : (
              ''
            )}
            {event?.estatus === 8 ? (
              <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                Cita en {`${event?.beneficio} (reagendado)`}
              </Typography>
            ) : (
              ''
            )}
            {event?.estatus === 9 ? (
              <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                Cita en {`${event?.beneficio} (cita expirada)`}
              </Typography>
            ) : (
              ''
            )}
            {event?.estatus === 10 ? (
              <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                Cita en {`${event?.beneficio} (proceso de pago)`}
              </Typography>
            ) : (
              ''
            )}
          </Stack>
        </Stack>
        <Stack
          alignItems="center"
          sx={{
            flexDirection: 'row',
            px: { xs: 1, md: 2 },
            py: 1,
          }}
        >
          <Stack
            alignItems="center"
            sx={{
              alignItems: 'center',
              display: 'flex',
            }}
          >
            <Iconify icon="solar:user-id-broken" width={30} sx={{ color: 'text.disabled' }} />
          </Stack>
          <Stack
            alignItems="center"
            sx={{
              alignItems: 'center',
              display: 'flex',
            }}
          >
            <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
              {event?.especialista ? event?.especialista : 'Especialista'}
            </Typography>
          </Stack>
        </Stack>
        <Stack
          alignItems="center"
          sx={{
            flexDirection: 'row',
            px: { xs: 1, md: 2 },
            py: 1,
            alignItems: 'center',
          }}
        >
          <Stack
            alignItems="center"
            sx={{
              alignItems: 'center',
              display: 'flex',
            }}
          >
            <Iconify icon="mdi:phone" width={30} sx={{ color: 'text.disabled' }} />
          </Stack>
          <Stack
            alignItems="center"
            sx={{
              alignItems: 'center',
              display: 'flex',
            }}
          >
            <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
              {event?.telefonoEspecialista ? event?.telefonoEspecialista : 'n/a'}
            </Typography>
          </Stack>
        </Stack>
        <Stack
          alignItems="center"
          sx={{
            flexDirection: 'row',
            px: { xs: 1, md: 2 },
            py: 1,
          }}
        >
          <Stack
            alignItems="center"
            sx={{
              alignItems: 'center',
              display: 'flex',
            }}
          >
            <Iconify icon="mdi:calendar-clock" width={30} sx={{ color: 'text.disabled' }} />
          </Stack>
          <Stack
            alignItems="center"
            sx={{
              alignItems: 'center',
              display: 'flex',
            }}
          >
            <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
              {event?.id
                ? `${dayjs(event?.start).format('HH:mm a')} - ${dayjs(event?.end).format(
                    'HH:mm a'
                  )}`
                : 'Fecha'}
            </Typography>
          </Stack>
        </Stack>
        <Stack
          alignItems="center"
          sx={{
            flexDirection: 'row',
            px: { xs: 1, md: 2 },
            py: 1,
          }}
        >
          {event?.modalidad === 1 ? (
            <>
              <Stack
                alignItems="center"
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                }}
              >
                <Iconify icon="mdi:earth" width={30} sx={{ color: 'text.disabled' }} />
              </Stack>
              <Stack
                alignItems="center"
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                }}
              >
                <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                  {event?.sede ? event?.sede : 'Querétaro'}
                </Typography>
              </Stack>
            </>
          ) : (
            <>
              <Stack
                alignItems="center"
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                }}
              >
                <Iconify icon="mdi:earth" width={30} sx={{ color: 'text.disabled' }} />
              </Stack>
              <Stack
                alignItems="center"
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                }}
              >
                <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                  {event?.sede ? `${event?.sede} (En línea)` : 'En línea'}
                </Typography>
              </Stack>
            </>
          )}
        </Stack>
        <Stack
          alignItems="center"
          sx={{
            flexDirection: 'row',
            px: { xs: 1, md: 2 },
            py: 1,
          }}
        >
          {event?.modalidad === 1 ? (
            <>
              <Stack
                alignItems="center"
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                }}
              >
                <Iconify icon="ic:outline-place" width={30} sx={{ color: 'text.disabled' }} />
              </Stack>
              <Stack
                alignItems="center"
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                }}
              >
                <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                  {event?.ubicación ? event?.ubicación : 'Calle Callerinas, 00, Centro, 76000'}
                </Typography>
              </Stack>
            </>
          ) : (
            <>
              <Stack
                alignItems="center"
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                }}
              >
                <Iconify icon="ic:outline-place" width={30} sx={{ color: 'text.disabled' }} />
              </Stack>
              <Stack
                alignItems="center"
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                }}
              >
                <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                  {event?.ubicación ? event?.ubicación : 'Remoto (En línea)'}
                </Typography>
              </Stack>
            </>
          )}
        </Stack>
        <Stack
          sx={{
            flexDirection: 'row',
            px: { xs: 1, md: 2 },
            py: 1,
          }}
        >
          <Stack
            alignItems="center"
            sx={{
              alignItems: 'center',
              display: 'flex',
            }}
          >
            <Iconify icon="ic:outline-email" width={30} sx={{ color: 'text.disabled' }} />
          </Stack>
          <Stack
            alignItems="center"
            sx={{
              alignItems: 'center',
              display: 'flex',
            }}
          >
            <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
              {event?.correoEspecialista
                ? event?.correoEspecialista.toLowerCase()
                : 'correo-demo@ciudadmaderas.com.mx'}
            </Typography>
          </Stack>
        </Stack>
        <Stack
          sx={{
            flexDirection: 'row',
            px: { xs: 1, md: 2 },
            py: 1,
          }}
        >
          <Stack
            alignItems="center"
            sx={{
              alignItems: 'center',
              display: 'flex',
            }}
          >
            <Iconify icon="fa-solid:money-bill" width={30} sx={{ color: 'text.disabled' }} />
          </Stack>
          <Stack
            alignItems="center"
            sx={{
              alignItems: 'center',
              display: 'flex',
            }}
          >
            <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
              {event?.idDetalle === null || event?.idDetalle === 0 ? (
                'Sin pago'
              ) : (
                <>
                  {event?.estatusPago === 1 || event?.estatusPago === 3
                    ? 'Pago aprobado'
                    : 'Pago declinado'}
                </>
              )}
            </Typography>
          </Stack>
        </Stack>
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
