import Calendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import { StyledCalendar } from './styles';
import CalendarToolbar from './calendar-toolbar';

import { useCalendar } from '../hooks';

// ----------------------------------------------------------------------

export default function CalendarView({
  onSelectRange,
  events = [],
}){

  const {
    calendarRef,
    //
    view,
    date,
    //
    onDatePrev,
    onDropEvent,
    onDateNext,
    // onSelectRange,
    onDateToday,
    onChangeView,
    onClickEvent, 
    openForm,
    onCloseForm,
    //
    selectEventId,
    selectedDate,
    selectedEnd
  } = useCalendar();

  return(
    <>
      <StyledCalendar>
        <CalendarToolbar
          // date={date}
          view={view}
          // loading={eventsLoading}
          // onNextDate={onDateNext}
          // onPrevDate={onDatePrev}
          // onToday={onDateToday}
          onChangeView={onChangeView}
        />

        <Calendar
          // weekends
          // editable = {false} // en false para prevenir un drag del evento
          // droppable
          selectable
          // eventConstraint={hours2}
          // businessHours={hours}
          // selectLongPressDelay={0}
          // locales={allLocales}
          locale='es'
          // rerenderDelay={10}
          // allDayMaintainDuration
          // eventResizableFromStart
          ref={calendarRef}
          // dayMaxEventRows={3}
          // eventDisplay="block"
          events={events}
          headerToolbar={false}
          select={(arg) => onSelectRange(arg.start, arg.end)}
          // eventClick={onClickEvent}
          // height={ smUp ? 720 : 'auto' }
          // eventDrop={(arg) => {
          //   onEventUpdate(arg);
          // }}
          plugins={[
          //   listPlugin,
            dayGridPlugin,
          //   timelinePlugin,
          //   timeGridPlugin,
            interactionPlugin,
          ]}
        />

      </StyledCalendar>
    </>
  )
}