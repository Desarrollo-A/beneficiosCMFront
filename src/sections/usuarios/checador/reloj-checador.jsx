import React from 'react';
import Calendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import esLocale from '@fullcalendar/core/locales/es';
import interactionPlugin from '@fullcalendar/interaction';

import { Card, Stack, Container } from '@mui/material';

import { useResponsive } from 'src/hooks/use-responsive';

import { StyledCalendar } from 'src/sections/calendar/styles/styles';

import { useCalendar } from './hooks';
import CalendarToolbar from './components/calendar-toolbar';

export default function RelojChecador() {
  const {
    calendarRef,
    //
    view,
    date,
    //
    onDatePrev,
    onDateNext,
    onSelectRange,
    onDateToday,
    onChangeView,
    onClickEvent,
    // openForm,
    // onCloseForm,
    //
    labels,
    // selectEventId,
    // selectedDate,
    // selectedEnd,
  } = useCalendar();



  const smUp = useResponsive('up', 'sm');

  const workSpec = [
    {
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      startTime: '08:00',
      endTime: '19:00',
    },
    {
      daysOfWeek: [5],
      startTime: '09:00',
      endTime: '14:00',
    },
  ];
  
  const workMin = workSpec
    .map((item) => item.startTime)
    .sort()
    .shift();
  const workMax = workSpec
    .map((item) => item.endTime)
    .sort()
    .pop();
    
  const workDays = [...new Set(workSpec.flatMap((item) => item.daysOfWeek))];
  const hideDays = [...Array(7).keys()].filter((day) => !workDays.includes(day));

  const today = new Date();
  const pastWeekStart = new Date(today);
  pastWeekStart.setDate(today.getDate() - 7);

  const curr = new Date();
  let first = curr.getDate() - curr.getDay();
  first -= 7;
  const firstdayOb = new Date(curr.setDate(first));
  const firstday = firstdayOb.toISOString().split('T')[0];
  const firstdayTemp = firstdayOb;
  const lastday = new Date(firstdayTemp.setDate(firstdayTemp.getDate() + 7)).toISOString().split('T')[0];

  return (
      <Stack sx={{ mt: 2 }}>
        <Card>
          <StyledCalendar>
            <CalendarToolbar
              date={date}
              view={view}
              onNextDate={onDateNext}
              onPrevDate={onDatePrev}
              onToday={onDateToday}
              labels={labels}
              onChangeView={onChangeView}
            />
            <Calendar
              weekends
              editable={false} // en false para prevenir un drag del evento
              droppable
              selectable
              weekText="Semana"
              businessHours={workSpec}
              slotMinTime={workMin}
              slotMaxTime={workMax}
              hiddenDays={hideDays}
              weekNumbers
              visibleRange={{
                start: firstday,
                end: lastday,
              }}
              validRange={{
                start: firstday,
                end: lastday,
              }}
              firstDay={0}
              selectLongPressDelay={0}
              locale={esLocale}
              rerenderDelay={10}
              allDayMaintainDuration
              eventResizableFromStart
              ref={calendarRef}
              dayMaxEventRows={3}
              initialView="timeGridWeek"
              eventDisplay="block"
              headerToolbar={false}
              select={onSelectRange}
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
      </Stack>    
  );
}
