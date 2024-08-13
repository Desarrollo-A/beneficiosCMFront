import PropTypes from 'prop-types';
import Calendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timelinePlugin from '@fullcalendar/timeline';
import timeGridPlugin from '@fullcalendar/timegrid';
import allLocales from '@fullcalendar/core/locales-all';
import interactionPlugin from '@fullcalendar/interaction';

import Card from '@mui/material/Card';

import { useResponsive } from 'src/hooks/use-responsive';

import AgendarDialog from 'src/sections/calendario/dialogs/agendar';

import { useCalendar } from '../../hooks';
import { StyledCalendar } from './styles';
import CalendarToolbar from './calendar-toolbar';

// ----------------------------------------------------------------------

export default function CalendarView({
  eventsLoading = false,
  events = [],
  select,
  labels,
  eventClick,
  loading,
}) {
  const {
    view,
    date,
    // openForm,
    onDatePrev,
    onDateNext,
    // onCloseForm,
    onDateToday,
    calendarRef,
    onChangeView,
    // onClickEvent,
    // selectedDate,
    // selectEventId,
  } = useCalendar();

  const smUp = useResponsive('up', 'sm');

  return (
    <>
      <Card>
        <StyledCalendar>
          <CalendarToolbar
            date={date}
            view={view}
            labels={labels}
            onToday={onDateToday}
            loading={loading}
            onNextDate={onDateNext}
            onPrevDate={onDatePrev}
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
            events={events}
            headerToolbar={false}
            select={select}
            eventClick={eventClick}
            height={smUp ? 720 : 'auto'}
            plugins={[listPlugin, dayGridPlugin, timelinePlugin, timeGridPlugin, interactionPlugin]}
          />
        </StyledCalendar>
      </Card>
      {/* Dialog para el agendar cita */}
      <AgendarDialog
        maxWidth="md"
        open={agendarDialog.value}
        onClose={agendarDialog.onFalse}
        currentEvent={currentEvent}
        selectedDate={selectedDate}
        appointmentMutate={appointmentMutate}
      />

      {/* Dialog para reagendar */}
      <AgendarDialog
        maxWidth="xs"
        open={openForm}
        currentEvent={currentEvent}
        onClose={onCloseForm}
        selectedDate={selectedDate}
        appointmentMutate={appointmentMutate}
      />
    </>
  );
}

CalendarView.propTypes = {
  eventsLoading: PropTypes.bool,
  events: PropTypes.any,
  select: PropTypes.any,
  labels: PropTypes.any,
  eventClick: PropTypes.func,
  loading: PropTypes.bool,
};
