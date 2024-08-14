import 'dayjs/locale/es';
import dayjs from 'dayjs';
/* import axios from 'axios'; */
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import utc from 'dayjs/plugin/utc';
import { useState, useEffect } from 'react';
import timezone from 'dayjs/plugin/timezone';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { parse, format, addHours, subHours } from 'date-fns';
// import { Marker, GoogleMap, LoadScript } from '@react-google-maps/api';

import Box from '@mui/material/Box';
import Stack from '@mui/system/Stack';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormHelperText from '@mui/material/FormHelperText';
import LinearProgress from '@mui/material/LinearProgress';
import { Checkbox, FormControlLabel } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useAuthContext } from 'src/auth/hooks';
import { getDocumento } from 'src/api/calendar-colaborador';

import Iconify from 'src/components/iconify';

import '../../styles/style.css';
import TermsAndConditionsDialog from '../dialogs/terms-and-conditions-dialog';

dayjs.locale('es');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);

let initialValue = dayjs().tz('America/Mexico_City'); // Objeto con todo los datos de fecha y hora
const lastDayOfNextMonth = initialValue.add(2, 'month').startOf('month').subtract(1, 'day');
initialValue = initialValue.hour() < 15 ? initialValue : initialValue.add(1, 'day');

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
  components: {
    MuiPickersDay: {
      styleOverrides: {
        root: {
          color: 'black',
        },
      },
    },
  },
});

export default function AppointmentSchedule({
  selectedValues,
  handleChange,
  beneficios,
  errorBeneficio,
  especialistas,
  errorEspecialista,
  modalidades,
  errorModalidad,
  oficina,
  isLoading,
  isLoadingEspecialidad,
  isLoadingModalidad,
  handleDateChange,
  shouldDisableDate,
  horariosDisponibles,
  horarioSeleccionado,
  errorHorarioSeleccionado,
  currentEvent,
  handleHorarioSeleccionado,
  beneficioActivo,
  aceptarTerminos,
  aceptar,
  beneficioDisabled,
  especialistaDisabled,
  modalidadDisabled,
  horariosDisabled,
  calendarDisabled,
  selectedDay,
}) {
  const [open, setOpen] = useState(false);
  /*   const [openMap, setOpenMap] = useState(false); */
  const [archivo, setArchivo] = useState(0);
  const [nombreEspecialidad, setNombreEspecialidad] = useState('');
  const verTerminos = async () => {
    setOpen(true);

    const getDoc = await getDocumento(beneficioActivo.beneficio);
    setArchivo(getDoc[0]?.expediente);
  };

  const close = () => {
    setOpen(false);
  };

  /*   const mapStyles = {
    height: '60vh',
    width: '100%',
  }; */

  const { user: datosUser } = useAuthContext();
  /*   const [address, setAddress] = useState(''); */

  useEffect(() => {
    switch (beneficioActivo?.beneficio) {
      case 537:
        setNombreEspecialidad('Nutrición');
        break;

      case 585:
        setNombreEspecialidad('Psicología');
        break;

      case 686:
        setNombreEspecialidad('Guía espiritual');
        break;

      default:
        setNombreEspecialidad('ERROR');
        break;
    }
  }, [beneficioActivo?.beneficio]);

  /*   useEffect(() => {
    if (!isEmpty(oficina)) {
      if (oficina?.result !== false) {
        setAddress(oficina?.data[0]?.ubicación ? oficina?.data[0]?.ubicación : '');
      }
    }
  }, [oficina]); */

  const [openWindow, setOpenWindow] = useState(false);

  /*   const handleClickOpen = () => {
    setOpenMap(true);
  }; */

  /*   const handleClose = () => {
    setOpenMap(false);
  }; */

  /*   const handleWindowActive = () => {
    setOpenWindow(true);
  }; */

  const handleWindowClose = () => {
    setOpenWindow(false);
  };

  /*   const [coordinates, setCoordinates] = useState(null); */

  /*  useEffect(() => {
    if (address !== '') {
      const fetchCoordinates = async () => {
        try {
          const response = await axios.get(`
        https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${
          import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        }
        `);

          if (response.data.results[0]?.geometry) {
            setCoordinates(response.data.results[0]?.geometry.location);
          } else {
            // console.log('No se encontraron coordenadas para esta dirección');
          }
        } catch (error) {
          console.error('Error al obtener las coordenadas', error);
        }
      };
      fetchCoordinates();
    }
  }, [address]); */

  // Función para determinar si es horario de verano
  const isDaylightSavingTime = (date) => {
    const year = date.getFullYear();
    const startDST = new Date(year, 2, 31 - new Date(year, 2, 31).getDay());
    const endDST = new Date(year, 9, 31 - new Date(year, 9, 31).getDay());

    return date >= startDST && date < endDST;
  };

  const adjustTime = (time, idSede) => {
    const parsedTime = parse(time, 'HH:mm:ss', new Date());
    const now = new Date();
    const isDST = isDaylightSavingTime(now);
    let adjustedTime;

    if (idSede === 9) {
      adjustedTime = addHours(parsedTime, 1);
    } else if (idSede === 11) {
      adjustedTime = isDST ? subHours(parsedTime, 2) : subHours(parsedTime, 1);
    } else {
      adjustedTime = parsedTime;
    }

    return format(adjustedTime, 'HH:mm:ss');
  };

  return (
    <Grid sx={{ display: { xs: 'block', sm: 'flex', md: 'flex' } }}>
      <Grid sx={{ width: '100%' }}>
        <Box
          sx={{
            width: { xs: '100%', md: '100%' },
            p: { sm: 1, xs: 1, md: 2 },
          }}
        >
          <Stack
            spacing={1}
            sx={
              selectedValues.modalidad
                ? {
                    color: 'white',
                  }
                : {}
            }
          >
            <Typography variant="subtitle1">Agendamiento de cita</Typography>
            <Box mb={1} />
            {/* El primero es reagendar. */}
            {!currentEvent?.id && selectedValues?.modalidad ? (
              <ThemeProvider theme={darkTheme}>
                <Stack direction="column" spacing={3} justifyContent="space-between">
                  <FormControl error={!!errorBeneficio} fullWidth>
                    <InputLabel id="beneficio-input" name="beneficio">
                      Beneficio
                    </InputLabel>
                    <Select
                      labelId="Beneficio"
                      id="select-beneficio"
                      label="Beneficio"
                      value={selectedValues.beneficio || ''}
                      defaultValue=""
                      onChange={(e) => handleChange('beneficio', e.target.value)}
                      /* disabled={!!(beneficios?.length === 0 || currentEvent?.id)} */
                      disabled={beneficioDisabled}
                    >
                      {!(beneficios?.length === 0 || currentEvent?.id) ? (
                        beneficios?.map((e) => (
                          <MenuItem key={e.idPuesto} value={e.idPuesto}>
                            {e.puesto.toUpperCase()}
                          </MenuItem>
                        ))
                      ) : (
                        <Grid style={{ paddingTop: '3%' }}>
                          <LinearProgress />
                          <Box mb={3} />
                        </Grid>
                      )}
                    </Select>
                    {errorBeneficio && selectedValues.beneficio === '' && (
                      <FormHelperText error={errorBeneficio}>
                        Seleccione un beneficio
                      </FormHelperText>
                    )}
                  </FormControl>
                  <FormControl error={!!errorEspecialista} fullWidth>
                    <InputLabel id="especialista-input">Especialista</InputLabel>
                    <Select
                      labelId="especialista-input"
                      id="select-especialista"
                      label="Especialista"
                      name="especialista"
                      value={selectedValues.especialista}
                      defaultValue=""
                      onChange={(e) => handleChange('especialista', e.target.value)}
                      /* disabled={!!(especialistas?.length === 0 || currentEvent?.id)} */
                      disabled={especialistaDisabled}
                    >
                      {!(especialistas?.length === 0 || currentEvent?.id) ? (
                        especialistas?.map((e, index) => (
                          <MenuItem key={e.id} value={e.id}>
                            {e.especialista.toUpperCase()}
                          </MenuItem>
                        ))
                      ) : (
                        <Grid style={{ paddingTop: '3%' }}>
                          <LinearProgress />
                          <Box mb={3} />
                        </Grid>
                      )}
                    </Select>
                    {errorEspecialista && selectedValues.especialista === '' && (
                      <FormHelperText error={errorEspecialista}>
                        Seleccione un especialista
                      </FormHelperText>
                    )}
                  </FormControl>
                  <FormControl error={!!errorModalidad} fullWidth>
                    <InputLabel id="modalidad-input">Modalidad</InputLabel>
                    <Select
                      labelId="Modalidad"
                      id="select-modalidad"
                      label="Modalidad"
                      name="Modalidad"
                      defaultValue=""
                      value={selectedValues.modalidad}
                      onChange={(e) => handleChange('modalidad', e.target.value)}
                      /* disabled={!!(modalidades?.length === 0 || currentEvent?.id)} */
                      disabled={modalidadDisabled}
                    >
                      {!(modalidades?.length === 0 || currentEvent?.id) ? (
                        modalidades?.map((e, index) => (
                          <MenuItem key={e.tipoCita} value={e.tipoCita}>
                            {e.modalidad.toUpperCase()}
                          </MenuItem>
                        ))
                      ) : (
                        <Grid style={{ paddingTop: '3%' }}>
                          <LinearProgress />
                          <Box mb={3} />
                        </Grid>
                      )}
                    </Select>
                    {errorModalidad && selectedValues.modalidad === '' && (
                      <FormHelperText error={errorModalidad}>
                        Seleccione una modalidad
                      </FormHelperText>
                    )}
                  </FormControl>
                </Stack>
              </ThemeProvider>
            ) : (
              <Stack direction="column" spacing={3} justifyContent="space-between">
                <FormControl error={!!errorBeneficio} fullWidth>
                  <InputLabel id="beneficio-input" name="beneficio">
                    Beneficio
                  </InputLabel>
                  <Select
                    labelId="Beneficio"
                    id="select-beneficio"
                    label="Beneficio"
                    value={selectedValues.beneficio || ''}
                    defaultValue=""
                    onChange={(e) => handleChange('beneficio', e.target.value)}
                    disabled={!!(beneficios?.length === 0 || currentEvent?.id)}
                  >
                    {beneficios?.map((e) => (
                      <MenuItem key={e.idPuesto} value={e.idPuesto}>
                        {e.puesto.toUpperCase()}
                      </MenuItem>
                    ))}
                  </Select>
                  {beneficios?.length === 0 && <LinearProgress />}
                  {errorBeneficio && selectedValues.beneficio === '' && (
                    <FormHelperText error={errorBeneficio}>Seleccione un beneficio</FormHelperText>
                  )}
                </FormControl>

                <>
                  <FormControl error={!!errorEspecialista} fullWidth>
                    <InputLabel id="especialista-input">Especialista</InputLabel>
                    <Select
                      labelId="especialista-input"
                      id="select-especialista"
                      label="Especialista"
                      name="especialista"
                      value={selectedValues.especialista}
                      defaultValue=""
                      onChange={(e) => handleChange('especialista', e.target.value)}
                      disabled={!!(especialistas?.length === 0 || currentEvent?.id)}
                    >
                      {especialistas?.map((e, index) => (
                        <MenuItem key={e.id} value={e.id}>
                          {e.especialista.toUpperCase()}
                        </MenuItem>
                      ))}
                    </Select>
                    {especialistas?.length === 0 && selectedValues.beneficio && <LinearProgress />}
                    {errorEspecialista && selectedValues.especialista === '' && (
                      <FormHelperText error={errorEspecialista}>
                        Seleccione un especialista
                      </FormHelperText>
                    )}
                  </FormControl>

                  <FormControl error={!!errorModalidad} fullWidth>
                    <InputLabel id="modalidad-input">Modalidad</InputLabel>
                    <Select
                      labelId="Modalidad"
                      id="select-modalidad"
                      label="Modalidad"
                      name="Modalidad"
                      defaultValue=""
                      value={selectedValues.modalidad}
                      onChange={(e) => handleChange('modalidad', e.target.value)}
                      disabled={!!(modalidades?.length === 0 || currentEvent?.id)}
                    >
                      {modalidades?.map((e, index) => (
                        <MenuItem key={e.tipoCita} value={e.tipoCita}>
                          {e.modalidad.toUpperCase()}
                        </MenuItem>
                      ))}
                    </Select>
                    {modalidades?.length === 0 && selectedValues.especialista && <LinearProgress />}
                    {errorModalidad && selectedValues.modalidad === '' && (
                      <FormHelperText error={errorModalidad}>
                        Seleccione una modalidad
                      </FormHelperText>
                    )}
                  </FormControl>
                </>
              </Stack>
            )}
            {selectedValues.modalidad === 1 && selectedValues.beneficio && (
              <>
                <Stack spacing={1} sx={{ p: { xs: 1, md: 1 } }}>
                  Dirección de la oficina :
                  {!isEmpty(oficina) ? (
                    <>
                      <Stack
                        sx={{
                          flexDirection: 'row',
                        }}
                      >
                        <Stack>
                          <Iconify
                            icon="mdi:office-building-marker"
                            width={30}
                            sx={{ color: 'text.disabled' }}
                          />
                        </Stack>
                        <Stack sx={{ flexDirection: 'col' }}>
                          <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                            {oficina?.result !== false
                              ? oficina?.data[0]?.ubicación
                              : 'Sin dirección'}
                          </Typography>
                        </Stack>
                        {/*  <Button variant="contained" color="primary" onClick={handleClickOpen}>
                          Ver mapa
                        </Button> */}
                      </Stack>

                      {/* {coordinates !== null ? (
                        <Dialog open={openMap} onClose={handleClose} fullWidth maxWidth="md">
                          <DialogTitle>
                            OFICINA: {oficina?.result !== false ? oficina?.data[0]?.oficina : ''}
                          </DialogTitle>
                          <DialogContent>
                            <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                              <GoogleMap
                                mapContainerStyle={mapStyles}
                                zoom={15}
                                center={coordinates}
                              >
                                <Marker position={coordinates} />
                              </GoogleMap>
                            </LoadScript>
                          </DialogContent>
                          <DialogActions>
                            <Button onClick={handleClose} variant="contained" color="error">
                              Cerrar
                            </Button>
                          </DialogActions>
                        </Dialog>
                      ) : null} */}
                    </>
                  ) : (
                    <LinearProgress />
                  )}
                </Stack>
                <Stack
                  sx={{
                    flexDirection: 'row',
                    p: { xs: 1, md: 1 },
                    alignItems: 'center',
                  }}
                >
                  <Stack>
                    <Iconify
                      icon="mdi:timer-edit-outline"
                      width={30}
                      sx={{ color: 'text.disabled' }}
                    />
                  </Stack>
                  <Stack sx={{ flexDirection: 'col' }}>
                    <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                      {selectedValues.beneficio === 158
                        ? 'Se consideran 5 minutos de tolerancia para asistir.'
                        : 'Se consideran 10 minutos de tolerancia para asistir.'}
                    </Typography>
                  </Stack>
                </Stack>

                <div className="card example-4">
                  <div className="inner">
                    <Stack
                      sx={{
                        flexDirection: 'row',
                        p: { xs: 1, md: 1 },
                        alignItems: 'center',
                      }}
                    >
                      <Stack>
                        <Iconify icon="line-md:alert-twotone" width={30} sx={{ color: 'yellow' }} />
                      </Stack>
                      <Stack sx={{ flexDirection: 'col' }}>
                        <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                          Una vez que agendes tu cita, tendrás 10 minutos para hacer el pago, de lo
                          contrario se cancelará.
                        </Typography>
                      </Stack>
                    </Stack>
                  </div>
                </div>

                <Dialog open={openWindow} onClose={handleWindowClose} fullWidth maxWidth="md">
                  <DialogTitle>
                    <Box />
                  </DialogTitle>
                  <DialogContent>
                    <Box
                      component="img"
                      alt="auth"
                      src={`${import.meta.env.BASE_URL}assets/img/windowTuto.gif`}
                      sx={{
                        display: 'block',
                        margin: '0 auto',
                        width: '100%',
                        maxWidth: '1200px',
                        height: 'auto',
                      }}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleWindowClose} variant="contained" color="error">
                      Cerrar
                    </Button>
                  </DialogActions>
                </Dialog>
              </>
            )}{' '}
            {selectedValues.modalidad === 2 && selectedValues.beneficio && (
              <>
                <Stack spacing={1} sx={{ p: { xs: 1, md: 1 } }}>
                  Especificaciones de la cita :
                  <Stack
                    sx={{
                      flexDirection: 'row',
                    }}
                  >
                    <Stack>
                      <Iconify
                        icon="mdi:office-building-marker"
                        width={30}
                        sx={{ color: 'text.disabled' }}
                      />
                    </Stack>
                    <Stack sx={{ flexDirection: 'col' }}>
                      <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                        Oficina virtual
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
                <Stack
                  sx={{
                    flexDirection: 'row',
                    p: { xs: 1, md: 1 },
                    alignItems: 'center',
                  }}
                >
                  <Stack>
                    <Iconify
                      icon="mdi:timer-edit-outline"
                      width={30}
                      sx={{ color: 'text.disabled' }}
                    />
                  </Stack>
                  <Stack sx={{ flexDirection: 'col' }}>
                    <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                      {selectedValues.beneficio === 158
                        ? 'Se consideran 5 minutos de tolerancia para asistir.'
                        : 'Se consideran 10 minutos de tolerancia para asistir.'}
                    </Typography>
                  </Stack>
                </Stack>
                <div className="card example-4">
                  <div className="inner">
                    <Stack
                      sx={{
                        flexDirection: 'row',
                        p: { xs: 1, md: 1 },
                        alignItems: 'center',
                      }}
                    >
                      <Stack>
                        <Iconify icon="line-md:alert-twotone" width={30} sx={{ color: 'yellow' }} />
                      </Stack>
                      <Stack sx={{ flexDirection: 'col' }}>
                        <Typography variant="body1" sx={{ pl: { xs: 1, md: 2 } }}>
                          Una vez que agendes tu cita, tendrás 10 minutos para hacer el pago, de lo
                          contrario se cancelará.
                        </Typography>
                      </Stack>
                    </Stack>
                  </div>
                </div>
              </>
            )}
          </Stack>
        </Box>
      </Grid>
      <Grid
        sx={{
          width: '100%',
          display: selectedValues.modalidad ? 'flex' : 'none',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: { xs: '40px' },
          marginBottom: { xs: '30px' },
        }}
      >
        <Stack sx={{ pading: { xs: '10px' } }}>
          <ThemeProvider theme={lightTheme}>
            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              adapterLocale="es"
              sx={{
                bgcolor: 'white', // Color de fondo del calendario
                '& .MuiPickersDay-day': {
                  color: 'black', // Color de los días
                },
                color: 'black',
              }}
            >
              <DateCalendar
                loading={isLoading}
                disabled={calendarDisabled}
                value={selectedDay}
                onChange={handleDateChange}
                renderLoading={() => <DayCalendarSkeleton />}
                minDate={initialValue}
                maxDate={lastDayOfNextMonth}
                shouldDisableDate={shouldDisableDate}
                views={['year', 'month', 'day']}
                sx={{
                  bgcolor: 'white', // Color de fondo del calendario
                  '& .MuiPickersDay-day': {
                    color: 'black', // Color de los días
                  },
                  color: 'black',
                }}
              />
            </LocalizationProvider>
          </ThemeProvider>
          <Stack
            direction="column"
            spacing={3}
            justifyContent="space-between"
            sx={{ paddingX: { xs: '10%' } }}
          >
            {horariosDisponibles ? (
              <FormControl error={!!errorHorarioSeleccionado} fullWidth>
                <ThemeProvider theme={lightTheme}>
                  <InputLabel id="modalidad-input">Horarios disponibles</InputLabel>
                  <Select
                    labelId="Horarios disponibles"
                    id="select-horario"
                    label="Horarios disponibles"
                    name="Horarios disponibles"
                    value={horarioSeleccionado}
                    onChange={(e) => handleHorarioSeleccionado(e.target.value)}
                    disabled={horariosDisponibles.length === 0 || horariosDisabled}
                    theme={lightTheme}
                  >
                    {horariosDisponibles.map((e, index) => (
                      <MenuItem key={e.inicio} value={`${e.fecha} ${e.inicio}`}>
                        {adjustTime(e.inicio, datosUser?.idSede)}
                      </MenuItem>
                    ))}
                  </Select>
                </ThemeProvider>
                {errorHorarioSeleccionado && horarioSeleccionado === '' && (
                  <FormHelperText error={errorHorarioSeleccionado}>
                    Seleccione fecha y horario
                  </FormHelperText>
                )}
              </FormControl>
            ) : (
              <>Fecha sin horarios disponibles</>
            )}
            {beneficioActivo?.primeraCita === 0 || beneficioActivo?.primeraCita === null ? (
              <Stack>
                <FormControlLabel
                  value="end"
                  control={<Checkbox value={aceptar} onClick={aceptarTerminos} />}
                  label={`Sí, he leído y acepto los términos y condiciones conforme a lo dispuesto en la Política de ${nombreEspecialidad}`}
                  sx={{ color: 'black' }}
                  // checked={isChecked}
                  // onChange={handleCheckboxChange}
                  labelPlacement="end"
                />
                <Button sx={{ color: 'blue' }} onClick={verTerminos}>
                  Ver términos y condiciones
                </Button>
              </Stack>
            ) : (
              ''
            )}
          </Stack>
        </Stack>
      </Grid>
      <Dialog fullWidth maxWidth="lg" open={open}>
        <TermsAndConditionsDialog archivo={archivo} onClose={close} />
      </Dialog>
    </Grid>
  );
}

AppointmentSchedule.propTypes = {
  selectedValues: PropTypes.object,
  handleChange: PropTypes.func,
  beneficios: PropTypes.array,
  errorBeneficio: PropTypes.bool,
  especialistas: PropTypes.array,
  errorEspecialista: PropTypes.bool,
  modalidades: PropTypes.array,
  errorModalidad: PropTypes.bool,
  oficina: PropTypes.object,
  isLoading: PropTypes.bool,
  isLoadingEspecialidad: PropTypes.bool,
  isLoadingModalidad: PropTypes.bool,
  handleDateChange: PropTypes.func,
  shouldDisableDate: PropTypes.func,
  horariosDisponibles: PropTypes.array,
  horarioSeleccionado: PropTypes.string,
  errorHorarioSeleccionado: PropTypes.bool,
  currentEvent: PropTypes.object,
  handleHorarioSeleccionado: PropTypes.func,
  beneficioActivo: PropTypes.object,
  aceptarTerminos: PropTypes.func,
  aceptar: PropTypes.bool,
  beneficioDisabled: PropTypes.bool,
  especialistaDisabled: PropTypes.bool,
  modalidadDisabled: PropTypes.bool,
  horariosDisabled: PropTypes.bool,
  calendarDisabled: PropTypes.bool,
  selectedDay: PropTypes.any,
};
