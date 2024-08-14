import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { fTimestamp } from 'src/utils/format-time';

import { useAuthContext } from 'src/auth/hooks';
import { GetCustomEvents } from 'src/api/calendar-specialist';
import { useGetHorariosPresenciales } from 'src/api/especialistas';
import { useGetAppointmentsByUser } from 'src/api/calendar-colaborador';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';

import { useEvent, useCalendar } from './hooks';
import BeneficiaryCalendar from './beneficiary/beneficiary-calendar';
import PresencialDialog from './specialist/dialogs/horario-presencial';
import CalendarEpecialistView from './specialist/calendar-especialist-view';
import FloatingCircleTimer from '../calendariobeneficiario/floating-circle-timer';
import AppointmentScheduleDialog from './beneficiary/dialogs/appointment-scheduled-dialog';


//---------------------------------------------------------

const defaultFilters = {
  colors: [],
  startDate: null,
  endDate: null,
};

//---------------------------------------------------------

export default function CalendarView() {
  const theme = useTheme();
  const settings = useSettingsContext();
  const { user } = useAuthContext();
  const smUp = useResponsive('up', 'sm');

  const [animate, setAnimate] = useState(false);
  const [presencialDialog, setOpenPresencialDialog] = useState(false);

  const agendarDialog = useBoolean();

  const {
    view,
    date,
    openForm,
    onDatePrev,
    onDateNext,
    onCloseForm,
    onDateToday,
    calendarRef,
    onChangeView,
    onClickEvent,
    selectedDate,
    selectEventId,
  } = useCalendar();

  const [filters] = useState(defaultFilters);

  const dateError =
    filters.startDate && filters.endDate
      ? filters.startDate.getTime() > filters.endDate.getTime()
      : false;

  const {
    data: beneficiarioEvents,
    appointmentMutate,
  } = useGetAppointmentsByUser(date, user?.idUsuario, user?.idSede);

  const { events: especialistaEvents, eventsLoading } = GetCustomEvents(
    date,
    user?.idUsuario,
    user?.idSede
  );

  const { horarios, horariosGet } = useGetHorariosPresenciales({
    idEspecialista: user?.idUsuario,
  });

  const events = [...beneficiarioEvents, ...especialistaEvents];

  const currentEvent = useEvent(events, selectEventId, openForm);

  const beneficiarioFiltered = applyFilter({
    inputData: events.concat(horarios),
    filters,
    dateError,
  });

  useEffect(() => {
    appointmentMutate();
  }, [appointmentMutate]);

  const handleClick = useCallback(() => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    setAnimate(true);
    setTimeout(() => {
      setAnimate(false);
    }, 500); // Duración de la animación en milisegundos
  }, []);

  const renderFloatingCircleTimers = () =>
    beneficiarioEvents
      .filter(
        (event) => event?.idDetalle === null && (event?.estatus === 6 || event?.estatus === 10)
      )
      .map((event, index) => (
        <FloatingCircleTimer
          key={event?.id}
          benefit={event?.beneficio}
          leftTime={event?.diferenciaEnMs}
          appointmentMutate={appointmentMutate}
          topOffset={index * 1} // Ajustar el espaciado vertical entre elementos
        />
      ));

  const addHorarioPresencial = () => {
    setOpenPresencialDialog(true);
  };

  const onCloseHorariosDialog = () => {
    setOpenPresencialDialog(false);

    horariosGet({ idEspecialista: user?.idUsuario });
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems="center"
        spacing={2}
        justifyContent="right"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        <Typography variant="h4">Calendario</Typography>
        <Box sx={{ flex: 1 }} />

        {user?.idRol === 3 ? (
          <>
            <Button
              color="inherit"
              variant="outlined"
              onClick={addHorarioPresencial}
              fullWidth={!smUp}
            >
              Establecer horario presencial
            </Button>

            <Button
              className={`ButtonCita ${animate ? 'animate' : ''}`}
              onClick={agendarDialog.onTrue}
              id="animateElement"
              fullWidth={!smUp}
            >
              <span>Agendar nueva cita</span>
              <Iconify icon="carbon:add-filled" />
            </Button>
          </>
        ) : (
          <Button
            className={`ButtonCita ${animate ? 'animate' : ''}`}
            onClick={agendarDialog.onTrue}
            id="animateElement"
            fullWidth={!smUp}
          >
            <span>Agendar nueva cita</span>
            <Iconify icon="carbon:add-filled" />
          </Button>
        )}
      </Stack>

      {user?.idRol === 3 ? (
        <>
          <CalendarEpecialistView />

          <PresencialDialog open={presencialDialog} onClose={onCloseHorariosDialog} />
        </>
      ) : (
        <BeneficiaryCalendar
          date={date}
          view={view}
          onDateNext={onDateNext}
          onDatePrev={onDatePrev}
          onDateToday={onDateToday}
          onChangeView={onChangeView}
          calendarRef={calendarRef}
          beneficiarioFiltered={beneficiarioFiltered}
          handleClick={handleClick}
          onClickEvent={onClickEvent}
        />
      )}

      {/* Modal para AgendarCita */}
      <Dialog
        fullWidth
        maxWidth="md"
        open={agendarDialog.value}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest - 1000,
        }}
      >
        <AppointmentScheduleDialog
          currentEvent={currentEvent}
          onClose={agendarDialog.onFalse}
          selectedDate={selectedDate}
          appointmentMutate={appointmentMutate}
        />
      </Dialog>

      {/* Modal para previsualizar datos de evento */}
      <Dialog
        fullWidth
        maxWidth="xs"
        open={openForm}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest - 1000,
        }}
      >
        <AppointmentScheduleDialog
          currentEvent={currentEvent}
          onClose={onCloseForm}
          selectedDate={selectedDate}
          appointmentMutate={appointmentMutate}
        />
      </Dialog>

      <Stack
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '200px' /* Ajusta el ancho según tus necesidades */,
          height: '90' /* Hace que el componente tome el 100% de la altura de la pantalla */,
          padding: '10px',
          zIndex: 9999,
          pointerEvents: 'none',
          marginTop: '12px',
          marginRight: '12px',
        }}
      >
        {!eventsLoading && renderFloatingCircleTimers()}
      </Stack>
    </Container>
  );
}

//---------------------------------------------------------

const applyFilter = ({ inputData, filters, dateError }) => {
  const { colors, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  inputData = stabilizedThis.map((el) => el[0]);

  if (colors.length) {
    inputData = inputData.filter((event) => colors.includes(event.color));
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter(
        (event) =>
          fTimestamp(event.start) >= fTimestamp(startDate) &&
          fTimestamp(event.end) <= fTimestamp(endDate)
      );
    }
  }

  return inputData;
};