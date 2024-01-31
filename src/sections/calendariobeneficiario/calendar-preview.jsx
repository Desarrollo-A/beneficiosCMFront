import 'dayjs/locale/es';
import dayjs from 'dayjs';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogContent } from '@material-ui/core';

import Tooltip from '@mui/material/Tooltip';
import DialogTitle from '@mui/material/DialogTitle';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import { Chip, Stack, Button, TextField, Typography, DialogActions } from '@mui/material';

import Iconify from 'src/components/iconify';

export default function CalendarPreview({ event, open, handleClose }) {
  const [email, setEmail] = useState('');
  const [emails, setEmails] = useState([]);
  const [errorMessage, setErrorMessage] = useState('Formato de correo erróneo');
  const [errorEmail, setErrorEmail] = useState(false);
  const [sendEmails, setSendEmails] = useState(false);

  const handleSendEmails = () => {
    setSendEmails(!sendEmails);
    setErrorEmail(false);
    setEmail('');
    setEmails([]);
  };

  const handleEmails = (newEmail) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Verificar si la cadena cumple con la expresión regular
    if (!emailRegex.test(newEmail)) {
      setErrorMessage('Formato de correo erróneo');
      return setErrorEmail(true);
    }

    // Verificar si el nuevo correo ya existe en el arreglo
    if (emails.some((emailObj) => emailObj.email.toLowerCase() === newEmail.toLowerCase())) {
      setErrorMessage('Correo ya registrado');
      return setErrorEmail(true);
    }

    setEmails([...emails, { email: newEmail }]);
    setEmail('');
    setErrorEmail(false);
    return '';
  };

  const deleteEmail = (removedEmail) => {
    const newEmails = emails.filter((each) => each.email !== removedEmail);
    setEmails(newEmails);
  };

  return (
    <Dialog
      open={open}
      fullWidth
      disableEnforceFocus
      maxWidth="xs"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle sx={{ p: { xs: 1, md: 2 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          useFlexGap
          flexWrap="wrap"
          sx={{ p: { xs: 1, md: 2 } }}
        >
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
            DATOS DE CITA
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ p: { xs: 1, md: 2 } }}>
          <Typography variant="subtitle1">
            {event?.start ? dayjs(event.start).format('dddd, DD MMMM YYYY') : 'Fecha'}
          </Typography>
        </Stack>

        <Stack
          alignItems="center"
          sx={{
            flexDirection: { sm: 'row', md: 'col' },
            px: { xs: 1, md: 2 },
            py: 1,
            alignItems: 'center',
          }}
        >
          <Iconify icon="mdi:account-circle" width={30} sx={{ color: 'text.disabled' }} />
          {event?.estatus === 1 ? (
            <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
              Cita en {`${event?.beneficio} (por asistir)`}
            </Typography>
          ) : (
            ''
          )}
          {event?.estatus === 2 || event?.estatus === '7' ? (
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
        </Stack>
        <Stack
          alignItems="center"
          sx={{
            flexDirection: { sm: 'row', md: 'col' },
            px: { xs: 1, md: 2 },
            py: 1,
          }}
        >
          <Iconify icon="solar:user-id-broken" width={30} sx={{ color: 'text.disabled' }} />
          <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
            {event?.especialista ? event?.especialista : 'Especialista'}
          </Typography>
        </Stack>
        <Stack
          alignItems="center"
          sx={{
            flexDirection: { sm: 'row', md: 'col' },
            px: { xs: 1, md: 2 },
            py: 1,
            alignItems: 'center',
          }}
        >
          <Iconify icon="mdi:phone" width={30} sx={{ color: 'text.disabled' }} />
          <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
            {event?.telefonoEspecialista ? event?.telefonoEspecialista : 'n/a'}
          </Typography>
        </Stack>
        <Stack
          alignItems="center"
          sx={{
            flexDirection: { sm: 'row', md: 'col' },
            px: { xs: 1, md: 2 },
            py: 1,
          }}
        >
          <Iconify icon="mdi:calendar-clock" width={30} sx={{ color: 'text.disabled' }} />
          <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
            {event?.id
              ? `${dayjs(event?.start).format('HH:mm a')} - ${dayjs(event?.end).format('HH:mm a')}`
              : 'Fecha'}
          </Typography>
        </Stack>
        <Stack
          alignItems="center"
          sx={{
            flexDirection: { sm: 'row', md: 'col' },
            px: { xs: 1, md: 2 },
            py: 1,
          }}
        >
          {event?.modalidad === 1 ? (
            <>
              <Iconify icon="mdi:earth" width={30} sx={{ color: 'text.disabled' }} />

              <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                {event?.sede ? event?.sede : 'Querétaro'}
              </Typography>
            </>
          ) : (
            <>
              <Iconify icon="mdi:earth" width={30} sx={{ color: 'text.disabled' }} />

              <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                {event?.sede ? `${event?.sede} (En línea)` : 'En línea'}
              </Typography>
            </>
          )}
        </Stack>
        <Stack
          alignItems="center"
          sx={{
            flexDirection: { sm: 'row', md: 'col' },
            px: { xs: 1, md: 2 },
            py: 1,
          }}
        >
          {event?.modalidad === 1 ? (
            <>
              <Iconify icon="ic:outline-place" width={30} sx={{ color: 'text.disabled' }} />

              <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                {event?.ubicación ? event?.ubicación : 'Calle Callerinas, 00, Centro, 76000'}
              </Typography>
            </>
          ) : (
            <>
              <Iconify icon="ic:outline-place" width={30} sx={{ color: 'text.disabled' }} />

              <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                {event?.ubicación ? event?.ubicación : 'Remoto (En línea)'}
              </Typography>
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
          <Stack>
            <Iconify icon="ic:outline-email" width={30} sx={{ color: 'text.disabled' }} />
          </Stack>
          <Stack sx={{ flexDirection: 'col' }}>
            <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
              {event?.correo
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
          <Stack>
            <Iconify icon="fa-solid:money-bill" width={30} sx={{ color: 'text.disabled' }} />
          </Stack>
          <Stack sx={{ flexDirection: 'col' }}>
            <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
              {event?.estatus === 1 ? 'Pagado' : 'Pagado'}
            </Typography>
          </Stack>
        </Stack>

        <Stack
          sx={{
            flexDirection: 'row',
            px: { xs: 1, md: 2 },
            py: 1,
            alignItems: 'center',
          }}
          spacing={2}
        >
          <Typography variant="subtitle1" sx={{ py: { xs: 1, md: 1 } }}>
            Notificar a externos
          </Typography>
          <Stack
            onClick={() => handleSendEmails()}
            sx={{
              cursor: 'pointer', // Hace que aparezca la manita al pasar el ratón
            }}
          >
            {!sendEmails ? (
              <Iconify icon="icons8:plus" width={24} sx={{ color: 'text.disabled' }} />
            ) : (
              <Iconify icon="icons8:minus" width={24} sx={{ color: 'text.disabled' }} />
            )}
          </Stack>
        </Stack>

        {sendEmails === true && (
          <>
            <Stack
              sx={{
                px: { xs: 1, md: 2 },
                pt: 1,
                alignItems: 'start',
              }}
            >
              <TextField
                fullWidth
                id="input-with-icon-textfield"
                label="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errorEmail}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ backgroundColor: 'text.disabled' }}
                        onClick={() => handleEmails(email)}
                      >
                        Invitar
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
              {errorEmail && <FormHelperText error={errorEmail}>{errorMessage}</FormHelperText>}
            </Stack>

            <Stack
              flexDirection="row"
              flexWrap="wrap"
              flex={1}
              spacing={2}
              sx={{ px: { xs: 1, md: 3 }, py: 1 }}
            >
              {emails.length > 0 &&
                emails.map((each) => (
                  <Tooltip title={each.email} key={each.email}>
                    <Chip
                      label={each.email}
                      variant="outlined"
                      sx={{
                        backgroundColor: '#e0e0e0',
                        borderRadius: '20px',
                        alignItems: 'center',
                        alignContent: 'center',
                        justifyContent: 'center',
                      }}
                      deleteIcon={
                        <Stack
                          style={{
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Iconify
                            icon="typcn:delete-outline"
                            sx={{
                              color: 'black',
                            }}
                          />
                        </Stack>
                      }
                      onDelete={() => deleteEmail(each.email)}
                    />
                  </Tooltip>
                ))}
            </Stack>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="error" onClick={handleClose}>
          Cerrar
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={() => alert(`Función de notificar a: ${JSON.stringify(emails)}`)}
        >
          Notificar
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
