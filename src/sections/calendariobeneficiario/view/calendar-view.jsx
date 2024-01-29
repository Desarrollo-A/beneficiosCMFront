import { Base64 } from 'js-base64';
import { useState, useEffect } from 'react';
import Calendar from '@fullcalendar/react'; // => request placed at the top
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import allLocales from '@fullcalendar/core/locales-all';
import interactionPlugin from '@fullcalendar/interaction';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { fTimestamp } from 'src/utils/format-time';

import { useSettingsContext } from 'src/components/settings';
import { CALENDAR_COLOR_OPTIONS } from 'src/_mock/_calendar';
// import { dropUpdate, GetCustomEvents } from 'src/api/calendar-specialist';
import { useGetAppointmentsByUser } from 'src/api/calendar-colaborador';

import { StyledCalendar } from '../styles';
import CalendarForm from '../calendar-form';
import CalendarDialog from '../calendar-dialog';
import { useEvent, useCalendar } from '../hooks';
import CalendarToolbar from '../calendar-toolbar';
import CalendarFilters from '../calendar-filters';
import NuevaCitaForm from '../calendario-formulario';

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

  const settings = useSettingsContext();
  const smUp = useResponsive('up', 'sm');
  const [filters] = useState(defaultFilters);

  const dateError =
    filters.startDate && filters.endDate
      ? filters.startDate.getTime() > filters.endDate.getTime()
      : false;

  const {
    calendarRef,
    view,
    date,
    openForm,
    onOpenForm,
    onDatePrev,
    onDateNext,
    onDateToday,
    onCloseForm,
    onChangeView,
    onSelectRange,
    onClickEvent,
    onResizeEvent,
    selectEventId,
    selectedDate,
  } = useCalendar();

  const {
    data: events,
    appointmentLoading: eventsLoading,
    appointmentMutate,
  } = useGetAppointmentsByUser(date);

  const currentEvent = useEvent(events, selectEventId, openForm);

  const dataFiltered = applyFilter({
    inputData: events,
    filters,
    dateError,
  });

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Stack
          alignItems="center"
          justifyContent="space-between"
          sx={{
            mb: { xs: 3, md: 5 },
            flexDirection: { sm: 'row', md: 'col' },
          }}
        >
          <Typography variant="h4"> </Typography>
          <Button color="inherit" variant="outlined" onClick={dialog.onTrue}>
            Agendar nueva cita
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
              editable
              selectable
              locales={allLocales}
              locale="es"
              rerenderDelay={10}
              allDayMaintainDuration
              eventResizableFromStart
              ref={calendarRef}
              dayMaxEventRows={3}
              eventDisplay="block"
              events={dataFiltered}
              headerToolbar={false}
              select={onSelectRange}
              eventClick={onClickEvent}
              height={smUp ? 720 : 'auto'}
              plugins={[
                listPlugin,
                dayGridPlugin,
                timelinePlugin,
                timeGridPlugin,
                // interactionPlugin,
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

function applyFilter({ inputData, filters, dateError }) {
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
}
