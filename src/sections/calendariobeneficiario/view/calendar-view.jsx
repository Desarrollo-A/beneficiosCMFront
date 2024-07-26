import Calendar from '@fullcalendar/react';
import { useState, useEffect, useCallback } from 'react'; // => request placed at the top
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import allLocales from '@fullcalendar/core/locales-all';
import interactionPlugin from '@fullcalendar/interaction';

import Card from '@mui/material/Card';
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
import { useGetAppointmentsByUser } from 'src/api/calendar-colaborador';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import '../style.css';
import { StyledCalendar } from '../styles';
import CalendarDialog from '../calendar-dialog';
import { useEvent, useCalendar } from '../hooks';
import CalendarToolbar from '../calendar-toolbar';

// ----------------------------------------------------------------------

const defaultFilters = {
  colors: [],
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

export default function CalendarView() {
  const theme = useTheme();
  const dialog = useBoolean();

  const { user: datosUser } = useAuthContext();

  const settings = useSettingsContext();
  const smUp = useResponsive('up', 'sm');
  const [filters] = useState(defaultFilters);

  const dateError =
    filters.startDate && filters.endDate
      ? filters.startDate.getTime() > filters.endDate.getTime()
      : false;

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

  const {
    data: events,
    appointmentLoading: eventsLoading,
    appointmentMutate,
  } = useGetAppointmentsByUser(date, datosUser?.idUsuario, datosUser?.idSede);

  const currentEvent = useEvent(events, selectEventId, openForm);

  const dataFiltered = applyFilter({
    inputData: events,
    filters,
    dateError,
  });

  useEffect(() => {
    appointmentMutate();
  }, [appointmentMutate]);

  const [animate, setAnimate] = useState(false);

  const handleClick = useCallback(() => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    setAnimate(true);
    setTimeout(() => {
      setAnimate(false);
    }, 500); // Duración de la animación en milisegundos
  }, []);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        >
          <Typography variant="h4">Calendario</Typography>
          <Button
            className={`ButtonCita ${animate ? 'animate' : ''}`}
            onClick={dialog.onTrue}
            id="animateElement"
            sx={{backgroundColor: theme.palette.mode === 'dark' ? '#25303d' : 'white',}}
          >
            <span>Agendar nueva cita</span>
            <Iconify icon="carbon:add-filled" />
          </Button>
        </Stack>

        {/* Calendario */}
        <Card>
          <StyledCalendar>
            <CalendarToolbar
              date={date}
              view={view}
              loading={eventsLoading}
              onNextDate={onDateNext}
              onPrevDate={onDatePrev}
              onToday={onDateToday}
              onChangeView={onChangeView}
            />
            <Calendar
              weekends
              editable={false} // en false para prevenir un drag del evento
              selectable
              locales={allLocales}
              locale="es"
              fixedWeekCount={false}
              showNonCurrentDates={false}
              rerenderDelay={10}
              allDayMaintainDuration
              eventResizableFromStart
              ref={calendarRef}
              dayMaxEventRows={3}
              eventDisplay="block"
              events={dataFiltered}
              headerToolbar={false}
              select={handleClick}
              eventClick={onClickEvent}
              height={smUp ? 720 : 'auto'}
              plugins={[
                listPlugin,
                dayGridPlugin,
                timelinePlugin,
                timeGridPlugin,
                interactionPlugin,
              ]}
            />
          </StyledCalendar>
        </Card>
      </Container>
      <Dialog
        fullWidth
        maxWidth="md"
        open={dialog.value}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest - 1000,
        }}
      >
        <CalendarDialog
          currentEvent={currentEvent}
          onClose={dialog.onFalse}
          selectedDate={selectedDate}
          appointmentMutate={appointmentMutate}
        />
      </Dialog>
      <Dialog
        fullWidth
        maxWidth="xs"
        open={openForm}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest - 1000,
        }}
      >
        <CalendarDialog
          currentEvent={currentEvent}
          onClose={onCloseForm}
          selectedDate={selectedDate}
          appointmentMutate={appointmentMutate}
        />
      </Dialog>
    </>
  );
}

// ----------------------------------------------------------------------

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
