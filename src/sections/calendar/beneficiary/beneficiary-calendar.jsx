import PropTypes from 'prop-types';
import Calendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import allLocales from '@fullcalendar/core/locales-all';
import interactionPlugin from '@fullcalendar/interaction';

import Card from '@mui/material/Card';

import { useAuthContext } from 'src/auth/hooks';

import PendingModalUser from 'src/sections/calendar/beneficiary/pendingModalUser';

import '../styles/style.css';
import { StyledCalendar } from '../styles/styles';
import CalendarToolbar from '../components/calendar-toolbar';

export default function BeneficiaryCalendar({
  date,
  view,
  onDateNext,
  onDatePrev,
  onDateToday,
  onChangeView,
  calendarRef,
  beneficiarioFiltered,
  handleClick,
  onClickEvent,
  smUp,
}) {

  const { user: datosUser } = useAuthContext();

  return (
    <Card>

      <PendingModalUser idUsuario={datosUser?.idUsuario}/>

      <StyledCalendar>
        <CalendarToolbar
          date={date}
          view={view}
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
          events={beneficiarioFiltered}
          headerToolbar={false}
          select={handleClick}
          eventClick={onClickEvent}
          height={smUp ? 720 : 'auto'}
          plugins={[listPlugin, dayGridPlugin, timelinePlugin, timeGridPlugin, interactionPlugin]}
        />
      </StyledCalendar>
    </Card>
  );
}

BeneficiaryCalendar.propTypes = {
  date: PropTypes.any,
  view: PropTypes.any,
  onDateNext: PropTypes.any,
  onDatePrev: PropTypes.any,
  onDateToday: PropTypes.any,
  onChangeView: PropTypes.any,
  calendarRef: PropTypes.any,
  beneficiarioFiltered: PropTypes.any,
  handleClick: PropTypes.any,
  onClickEvent: PropTypes.any,
  smUp: PropTypes.any,
};
