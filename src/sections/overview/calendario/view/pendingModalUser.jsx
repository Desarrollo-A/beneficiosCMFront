import 'dayjs/locale/es';
import dayjs from 'dayjs';
import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import localeData from 'dayjs/plugin/localeData';
import { Dialog, DialogContent } from '@material-ui/core';

import Card from '@mui/material/Card';
import { LoadingButton } from '@mui/lab';
import Rating from '@mui/material/Rating';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import InputBase from '@mui/material/InputBase';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import {
  Box,
  Chip,
  Stack,
  Button,
  Select,
  ListItem,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  IconButton,
  FormControl,
  ListItemText,
  Autocomplete,
  DialogActions,
} from '@mui/material';

import uuidv4 from 'src/utils/uuidv4';

import { useAuthContext } from 'src/auth/hooks';
import { AvatarShape } from 'src/assets/illustrations';
// import { reRender, useGetMotivos, useGetPending, endAppointment, cancelAppointment } from 'src/api/calendar-specialist';
import { cancelAppointment } from 'src/api/calendar-specialist';
import {
  useGetPendientes,
  updateAppointment,
  registrarDetalleDePago,
} from 'src/api/calendar-colaborador';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';

// const datosUser = JSON.parse(Base64.decode(sessionStorage.getItem('accessToken').split('.')[2]));

export default function PendingModalUser() {
  const [open, setOpen] = useState(true);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);
  const [open4, setOpen4] = useState(true);
  const [event, setEvent] = useState([]);
  const [email, setEmail] = useState('');
  const [emails, setEmails] = useState([]);
  const [errorMessage, setErrorMessage] = useState('Formato de correo erróneo');
  const [errorEmail, setErrorEmail] = useState(false);
  const [sendEmails, setSendEmails] = useState(false);
  const [valorRating, setValorRating] = useState(0);
  const { data: pendientes, pendingsMutate } = useGetPendientes(); // traer todas las citas en pendiente de pago

  dayjs.locale('es');
  dayjs.extend(localeData);

  const theme = useTheme();
  const { user: datosUser } = useAuthContext();
  console.log('SESION', datosUser);

  const onClose = () => {
    setOpen(false);
  };

  const handleClose2 = () => {
    setOpen2(false);
  };

  const handleOpen = async (currentEvent) => {
    setEvent(currentEvent);
    setOpen3(true);
    // SIMULACIÓN DE PAGO

    // checar si paga o no
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setOpen3(false);
    let precio = 50;
    let metodoPago = 1;
    if (datosUser.tipoPuesto.toLowerCase() === 'operativa' || datosUser.idDepto === 13) {
      precio = 0;
      metodoPago = 3;
    }
    const registrarPago = await registrarDetalleDePago(
      datosUser.idUsuario,
      uuidv4(),
      1,
      precio,
      metodoPago
    );
    if (registrarPago.result) {
      // enqueueSnackbar('¡Detalle de pago registrado!', {
      //   variant: 'success',
      // });
      // Hacer el proceso de actualizar cita
      const update = await updateAppointment(currentEvent.id, 1, registrarPago.data);
      if (update.result) {
        enqueueSnackbar('¡Se ha generado el pago con exito!', {
          variant: 'success',
        });
      }
      if (!update.result) {
        enqueueSnackbar('¡Se obtuvó un error al intentar generar el pago de cita!', {
          variant: 'error',
        });
      }
      console.log('YA NO ENTRA 107');
    }
    if (!registrarPago.result) {
      enqueueSnackbar('¡Ha surgido un error al intentar registrar el detalle de pago!', {
        variant: 'error',
      });
      return 'onClose()';
    }
    console.log('YA NO ENTRA 114');
    pendingsMutate();
    // preview
    setOpen2(true);

    return '';
  };

  const onCancel = async (currentEvent) => {
    const cancel = await cancelAppointment(currentEvent, currentEvent.id, 0);
    if (cancel.result) {
      enqueueSnackbar('¡Se ha cancelado la cita!', {
        variant: 'success',
      });
      pendingsMutate();
      return onClose();
    }
    if (!cancel.result) {
      enqueueSnackbar('¡Se generó un error al intentar cancelar la cita!', {
        variant: 'error',
      });
      pendingsMutate();
      return onClose();
    }
    pendingsMutate();
    return '';
  };

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

  const handleRatingChange = (event, newValue) => {
    setValorRating(newValue);
  };

  const handleRate = () => {
    alert(`Evaluado con ${valorRating} estrellas`);
  };

  return (
    <>
      {pendientes?.data?.length > 0 && ( // si hay pendientes se mostrara el modal
        <Dialog open={open} fullWidth maxWidth="sm">
          <DialogContent>
            <Stack
              direction="row"
              justifyContent="center"
              useFlexGap
              flexWrap="wrap"
              sx={{ pt: { xs: 1, md: 2 }, pb: { xs: 1, md: 2 } }}
            >
              <Typography color="red" sx={{ mt: 1, mb: 1 }}>
                <strong>¡ATENCIÓN!</strong>
              </Typography>
            </Stack>
            <Typography sx={{ textAlign: 'center', pb: 2 }}>
              ¡Tiene citas con un estado pendiente de pago! Realice el pago ahora mismo para poder
              hacer uso del beneficio.
            </Typography>
            <Typography
              direction="row"
              alignItems="center"
              sx={{ justifyContent: 'space-between' }}
            >
              {pendientes?.data?.length > 0 &&
                pendientes.data.map((pending, key) => (
                  <ListItem
                    key={pending.idCita}
                    secondaryAction={
                      <>
                        <Tooltip title="Cancelar cita">
                          <IconButton onClick={() => onCancel(pendientes?.data[key])}>
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Pagar">
                          <IconButton onClick={() => handleOpen(pendientes?.data[key])}>
                            <Iconify icon="ph:money-fill" width={22} />
                          </IconButton>
                        </Tooltip>
                      </>
                    }
                  >
                    <ListItemText primary={pending.beneficio} />
                    <ListItemText
                      primary={dayjs(pending.start).format('dddd, DD MMMM YYYY HH:mm')}
                    />
                  </ListItem>
                ))}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="error" onClick={onClose}>
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <Dialog
        open={open2}
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
            }}
          >
            <Iconify icon="mdi:account-circle" width={30} sx={{ color: 'text.disabled' }} />
            <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
              Cita en {event?.beneficio ? event?.beneficio : 'Beneficio'}
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
            }}
          >
            <Iconify icon="mdi:calendar-clock" width={30} sx={{ color: 'text.disabled' }} />
            <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
              {event?.id
                ? `${dayjs(event?.start).format('HH:mm a')} - ${dayjs(event?.end).format(
                    'HH:mm a'
                  )}`
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
                        style={{
                          backgroundColor: '#e0e0e0',
                          borderRadius: '20px',
                          alignItems: 'center',
                          alignContent: 'center',
                          justifyContent: 'center',
                        }}
                        deleteIcon={
                          <div
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
                          </div>
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
          <Button variant="contained" color="error" onClick={handleClose2}>
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
      <Dialog open={open3} maxWidth="sm">
        <DialogContent sx={{ pb: 2 }}>
          <Stack
            direction="row"
            justifyContent="center"
            useFlexGap
            flexWrap="wrap"
            sx={{ pt: { xs: 1, md: 2 }, pb: { xs: 1, md: 2 } }}
          >
            <Typography color="black" sx={{ mt: 1, mb: 1 }}>
              <strong>Confirmando pago...</strong>
            </Typography>
          </Stack>
          <Stack
            direction="row"
            justifyContent="center"
            useFlexGap
            flexWrap="wrap"
            sx={{ pt: { xs: 1, md: 2 }, pb: { xs: 1, md: 2 } }}
          >
            <Iconify icon="eos-icons:bubble-loading" width={30} sx={{ color: 'text.disabled' }} />
          </Stack>
          {/* eos-icons:bubble-loading */}
        </DialogContent>
      </Dialog>
      <Dialog
        open={open4}
        fullWidth
        disableEnforceFocus
        maxWidth="xs"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          borderRadius: 'initial',
          p: 0,
        }}
        borderRadius="initial"
        padding={0}
      >
        <Card sx={{ textAlign: 'center' }}>
          <Box sx={{ position: 'relative' }}>
            <AvatarShape
              sx={{
                left: 0,
                right: 0,
                zIndex: 10,
                mx: 'auto',
                bottom: -26,
                position: 'absolute',
              }}
            />

            <Avatar
              alt={event.especialista}
              src={
                event.sexoEspecialista === 'F'
                  ? 'https://api-dev-minimal-v510.vercel.app/assets/images/avatar/avatar_4.jpg'
                  : 'https://api-dev-minimal-v510.vercel.app/assets/images/avatar/avatar_12.jpg'
              }
              sx={{
                width: 64,
                height: 64,
                zIndex: 11,
                left: 0,
                right: 0,
                bottom: -32,
                mx: 'auto',
                position: 'absolute',
              }}
            />

            <Image
              src="https://api-dev-minimal-v510.vercel.app/assets/images/cover/cover_12.jpg"
              alt="https://api-dev-minimal-v510.vercel.app/assets/images/cover/cover_12.jpg"
              ratio="16/9"
              overlay={alpha(theme.palette.grey[900], 0.48)}
            />
          </Box>

          <ListItemText
            sx={{ mt: 7, mb: 1 }}
            primary={event.especialista ? event.especialista : 'Especialista'}
            secondary={event.puesto ? event.puesto : 'Beneficio saludable'}
            primaryTypographyProps={{ typography: 'subtitle1' }}
            tertiary={event.start ? event.start : '2024-01-01 10:00:00'}
            secondaryTypographyProps={{ component: 'span', mt: 0.5 }}
          />
          <ListItemText
            sx={{ mt: 1, mb: 5 }}
            secondary={event.start ? event.start : '2024-01-01 10:00:00'}
            primaryTypographyProps={{ typography: 'subtitle1' }}
            secondaryTypographyProps={{ component: 'span', mt: 0.5 }}
          />

          <Stack direction="row" alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
            <Rating
              name="half-rating"
              defaultValue={0}
              precision={0.5}
              value={valorRating}
              onChange={handleRatingChange}
            />
          </Stack>
          <DialogActions justifyContent="center" sx={{ justifyContent: 'center' }}>
            <Button variant="contained" color="success" onClick={handleRate}>
              Calificar
            </Button>
          </DialogActions>
        </Card>
      </Dialog>
    </>
  );
}
