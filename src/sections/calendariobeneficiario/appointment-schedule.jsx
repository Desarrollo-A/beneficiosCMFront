import 'dayjs/locale/es';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

import Box from '@mui/material/Box';
import Stack from '@mui/system/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import Iconify from 'src/components/iconify';

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
      // Sobrescribe los estilos del día del calendario
      styleOverrides: {
        root: {
          color: 'black', // Establece el color del día a negro
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
  handleDateChange,
  shouldDisableDate,
  horariosDisponibles,
  horarioSeleccionado,
  errorHorarioSeleccionado,
  currentEvent,
  handleHorarioSeleccionado,
}) {
  return (
    <Grid sx={{ display: { xs: 'block', sm: 'flex', md: 'flex' } }}>
      <Grid sx={{ width: '100%' }}>
        <Box
          sx={{
            width: { xs: '100%', md: '100%' },
            p: { xs: 1, md: 2 },
          }}
        >
          <Stack
            spacing={3}
            sx={
              selectedValues.modalidad
                ? {
                    color: 'white',
                  }
                : {}
            }
          >
            {currentEvent?.estatus === 1 ? (
              <Typography variant="subtitle1">
                {dayjs(currentEvent?.start).locale('es').format('dddd, DD MMMM YYYY HH:mm ')}
              </Typography>
            ) : (
              <Typography variant="subtitle1">
                {dayjs().locale('es').format('dddd, DD MMMM YYYY')}
              </Typography>
            )}
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
                      disabled={!!(beneficios?.length === 0 || currentEvent?.id)}
                    >
                      {beneficios?.map((e) => (
                        <MenuItem key={e.idPuesto} value={e.idPuesto}>
                          {e.puesto.toUpperCase()}
                        </MenuItem>
                      ))}
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
                      disabled={!!(especialistas?.length === 0 || currentEvent?.id)}
                    >
                      {especialistas?.map((e, index) => (
                        <MenuItem key={e.id} value={e.id}>
                          {e.especialista.toUpperCase()}
                        </MenuItem>
                      ))}
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
                      disabled={!!(modalidades?.length === 0 || currentEvent?.id)}
                    >
                      {modalidades?.map((e, index) => (
                        <MenuItem key={e.tipoCita} value={e.tipoCita}>
                          {e.modalidad.toUpperCase()}
                        </MenuItem>
                      ))}
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
                  {errorBeneficio && selectedValues.beneficio === '' && (
                    <FormHelperText error={errorBeneficio}>Seleccione un beneficio</FormHelperText>
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
                    disabled={!!(especialistas?.length === 0 || currentEvent?.id)}
                  >
                    {especialistas?.map((e, index) => (
                      <MenuItem key={e.id} value={e.id}>
                        {e.especialista.toUpperCase()}
                      </MenuItem>
                    ))}
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
                    disabled={!!(modalidades?.length === 0 || currentEvent?.id)}
                  >
                    {modalidades?.map((e, index) => (
                      <MenuItem key={e.tipoCita} value={e.tipoCita}>
                        {e.modalidad.toUpperCase()}
                      </MenuItem>
                    ))}
                  </Select>
                  {errorModalidad && selectedValues.modalidad === '' && (
                    <FormHelperText error={errorModalidad}>Seleccione una modalidad</FormHelperText>
                  )}
                </FormControl>
              </Stack>
            )}
            {selectedValues.modalidad === 1 && selectedValues.beneficio && (
              <>
                <Stack spacing={1} sx={{ p: { xs: 1, md: 1 } }}>
                  Dirección de la oficina :
                  {oficina && oficina.result ? (
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
                          {oficina.data[0].ubicación}
                        </Typography>
                      </Stack>
                    </Stack>
                  ) : (
                    ' Cargando...'
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
                        ? 'Se consideran 5 minutos de tolerancia.'
                        : 'Se consideran 10 minutos de tolerancia.'}
                    </Typography>
                  </Stack>
                </Stack>
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
                        ? 'Se consideran 5 minutos de tolerancia.'
                        : 'Se consideran 10 minutos de tolerancia.'}
                    </Typography>
                  </Stack>
                </Stack>
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
                <InputLabel id="modalidad-input">Horarios disponibles</InputLabel>
                <Select
                  labelId="Horarios disponibles"
                  id="select-horario"
                  label="Horarios disponibles"
                  name="Horarios disponibles"
                  value={horarioSeleccionado}
                  onChange={(e) => handleHorarioSeleccionado(e.target.value)}
                  disabled={horariosDisponibles.length === 0}
                >
                  {horariosDisponibles.map((e, index) => (
                    <MenuItem key={e.inicio} value={`${e.fecha} ${e.inicio}`}>
                      {e.inicio}
                    </MenuItem>
                  ))}
                </Select>
                {errorHorarioSeleccionado && horarioSeleccionado === '' && (
                  <FormHelperText error={errorHorarioSeleccionado}>
                    Seleccione fecha y horario
                  </FormHelperText>
                )}
              </FormControl>
            ) : (
              <>Fecha sin horarios disponibles</>
            )}
          </Stack>
        </Stack>
      </Grid>
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
  handleDateChange: PropTypes.func,
  shouldDisableDate: PropTypes.func,
  horariosDisponibles: PropTypes.array,
  horarioSeleccionado: PropTypes.string,
  errorHorarioSeleccionado: PropTypes.bool,
  currentEvent: PropTypes.object,
  handleHorarioSeleccionado: PropTypes.func,
};
