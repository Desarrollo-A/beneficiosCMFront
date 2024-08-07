import Calendar from '@fullcalendar/react'; // => request placed at the top
import dayjs from 'dayjs';
import listPlugin from '@fullcalendar/list';
import { enqueueSnackbar } from 'notistack';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import allLocales from '@fullcalendar/core/locales-all';
import { useState, useEffect, useCallback } from 'react';
import interactionPlugin from '@fullcalendar/interaction';

// import { useGoogleLogin } from '@react-oauth/google';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useResponsive } from 'src/hooks/use-responsive';

import { fTimestamp } from 'src/utils/format-time';

import { useGetNameUser } from 'src/api/user';
import { useAuthContext } from 'src/auth/hooks';
import { dropUpdate, useGetMotivos, GetCustomEvents } from 'src/api/calendar-specialist';
import { useGetSedesPresenciales, useGetHorariosPresenciales } from 'src/api/especialistas';

import { useSettingsContext } from 'src/components/settings';

import Lista from './lista';
import EventContent from './eventContent';
import AgendaDialog from './agenda-dialog';
import { StyledCalendar } from '../styles';
import CalendarToolbar from '../calendar-tool';
import { useEvent, useCalendar } from '../hooks';
// ----------------------------------------------------------------------

const defaultFilters = {
  colors: [],
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------
export default function CalendarioView() {
  const { user } = useAuthContext();

  const { sedes } = useGetSedesPresenciales({ idEspecialista: user?.idUsuario });

  const smUp = useResponsive('up', 'sm');
  const settings = useSettingsContext();
  const [filters] = useState(defaultFilters);
  const { data: names, usersMutate } = useGetNameUser(user?.idUsuario);
  const [userData, setUserData] = useState('');
  const { data: reasons } = useGetMotivos(user?.idPuesto);
  const theme = useTheme();

  const [presencialDialog, setOpenPresencialDialog] = useState(false);

  const dateError =
    filters.startDate && filters.endDate
      ? filters.startDate.getTime() > filters.endDate.getTime()
      : false;

  const {
    calendarRef,
    //
    view,
    date,
    //
    onDatePrev,
    onDropEvent,
    onDateNext,
    onSelectRange,
    onDateToday,
    onChangeView,
    onClickEvent,
    openForm,
    onCloseForm,
    //
    selectEventId,
    selectedDate,
    selectedEnd,
  } = useCalendar();

  const { events, eventsLoading } = GetCustomEvents(date, user?.idUsuario, user?.idSede);

  const { horarios, horariosGet } = useGetHorariosPresenciales({ idEspecialista: user?.idUsuario });

  const [startPresencial] = useState(new Date());
  const [endPresencial] = useState(new Date());
  const [sedePresencial] = useState();

  const currentEvent = useEvent(events, selectEventId, openForm);

  const dataFiltered = applyFilter({
    inputData: events.concat(horarios),
    filters,
    dateError,
  });

  useEffect(() => {
    if (names) {
      setUserData(names);
    }
  }, [names]);

  const onEventUpdate = useCallback(
    (arg) => {
      // validacion de los eventos, verifica que no sea anterior a la fecha actual o estatus diferente a 1
      const { estatus, fechaInicio } = arg.event.extendedProps;
      const now = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');

      if (fechaInicio < now || (estatus !== 1 && estatus !== 6)) {
        enqueueSnackbar('No puedes mover el evento', { variant: 'error' });
        arg.revert();
      } else {
        onDropEvent({ arg, idUsuario: user?.idUsuario }, dropUpdate);
      }
    },
    [onDropEvent, user?.idUsuario]
  );

  const hours = {
    // horarios laborales
    start: dayjs(new Date()).format('HH:mm'),
    end: '17:00',
    daysOfWeek: [1, 2, 3, 4, 5, 6], // excluye el dia domingo
  };

  const hours2 = {
    start: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
  };
  const statusSizeMap = {
    '': 'sm', // valor vacio para cuando se va a crear
    cancel: 'sm',
  };

  const modalSize =
    statusSizeMap[currentEvent?.estatus] || statusSizeMap[currentEvent?.type] || 'xs';

  const addHorarioPresencial = () => {
    setOpenPresencialDialog(true);
  };

  const onCloseHorariosDialog = () => {
    setOpenPresencialDialog(false);

    horariosGet({ idEspecialista: user?.idUsuario });
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      {sedes.length > 1 ? (
        <Stack
          alignItems="center"
          justifyContent="space-between"
          sx={{
            mb: { xs: 3, md: 5 },
            flexDirection: { sm: 'row', md: 'col' },
          }}
        >
          <Typography variant="h4"> </Typography>
          <Button color="inherit" variant="outlined" onClick={addHorarioPresencial}>
            Establecer horario presencial
          </Button>
        </Stack>
      ) : null}
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
            droppable
            selectable
            eventConstraint={hours2}
            businessHours={hours}
            selectLongPressDelay={0}
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
            eventDrop={(arg) => {
              onEventUpdate(arg);
            }}
            plugins={[listPlugin, dayGridPlugin, timelinePlugin, timeGridPlugin, interactionPlugin]}
          />
        </StyledCalendar>
      </Card>

      <Dialog
        fullWidth
        maxWidth={modalSize}
        open={openForm}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest - 1000,
        }}
      >
        {currentEvent?.id ? (
          <EventContent
            currentEvent={currentEvent}
            onClose={onCloseForm}
            selectedDate={selectedDate}
            selectedEnd={selectedEnd}
            reasons={reasons}
          />
        ) : (
          <Lista
            onClose={onCloseForm}
            userData={userData}
            usersMutate={usersMutate}
            selectedDate={selectedDate}
          />
        )}
      </Dialog>
      <AgendaDialog
        open={presencialDialog}
        onClose={onCloseHorariosDialog}
        start={startPresencial}
        end={endPresencial}
        sede={sedePresencial}
      />
    </Container>
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
