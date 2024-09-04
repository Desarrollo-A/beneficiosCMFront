import React from 'react';
import Calendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import esLocale from '@fullcalendar/core/locales/es';
import interactionPlugin from '@fullcalendar/interaction';

import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';
import { Card, Grid, Stack, Button, Container, Typography } from '@mui/material';

import { useResponsive } from 'src/hooks/use-responsive';

import { useAuthContext } from 'src/auth/hooks';

import { StyledCalendar } from 'src/sections/calendar/styles/styles';

import { useCalendar } from '../hooks';
import CalendarToolbar from '../components/calendar-toolbar';

export default function RelojChecadorView() {
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

  const { user } = useAuthContext();

  const smUp = useResponsive('up', 'sm');
  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    maxWidth: 400,
    ...theme.applyStyles('dark', {
      backgroundColor: '#1A2027',
    }),
  }));

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

  /*
   * calculate the following:
   * - minimum "opening time"
   * - maximum "opening time"
   * - working days
   * - non-working days
   */
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

  return (
    <Container>
      <Stack sx={{ mt: 2 }}>
        <Card direction="row" sx={{ mb: 3, padding: 2 }}>
          
            <Grid container spacing={2}>
              <Grid item xs={9}>
                <Item>
                  <Stack spacing={2} direction="row" sx={{ alignItems: 'center' }}>
                    <Avatar
                      src="https://assets.minimals.cc/public/assets/images/mock/avatar/avatar-11.webp"
                      sx={{ mr: 2, width: 80, height: 80 }}
                    />
                    <Stack alignItems="start" spacing={0.5}>
                      <Typography noWrap>{user?.nombre}</Typography>
                      <Typography noWrap>{user?.puesto}</Typography>
                      <Typography noWrap>{user?.numEmpleado}</Typography>
                    </Stack>
                  </Stack>
                </Item>
              </Grid>
              <Grid item xs={3} alignContent='center'>
                <Item>
                  <Button
                    variant='contained'
                    color='info'
                  >
                    Solicitud de permiso
                  </Button>
                </Item>
              </Grid>
            </Grid>

          
        </Card>
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
              businessHours={workSpec}
              slotMinTime={workMin}
              slotMaxTime={workMax}
              hiddenDays={hideDays}
              weekNumbers
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
    </Container>
  );
}
