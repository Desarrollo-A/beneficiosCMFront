import Calendar from '@fullcalendar/react'; // => request placed at the top
import { useState, useEffect, useCallback } from 'react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import allLocales from '@fullcalendar/core/locales-all'
import interactionPlugin from '@fullcalendar/interaction';

import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import Container from '@mui/material/Container';
import dayjs from 'dayjs';
import { useTheme } from '@mui/material/styles';

import { useResponsive } from 'src/hooks/use-responsive';

import { fTimestamp } from 'src/utils/format-time';

import { useGetNameUser } from 'src/api/user';
import { dropUpdate, GetCustomEvents } from 'src/api/calendar-specialist';

import { useSettingsContext } from 'src/components/settings';

import Lista from "./lista";
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

export default function CalendarioView(){
    const smUp = useResponsive('up', 'sm');
    const settings = useSettingsContext();
    const [filters] = useState(defaultFilters);
    const { data: names, usersMutate } = useGetNameUser();
    const [userData, setUserData] = useState('');
    const theme = useTheme();
    const [isOld, setIsOld] = useState(false);

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
        selectedDate
    } = useCalendar();

    const { events, eventsLoading} = GetCustomEvents(date);

    const currentEvent = useEvent(events, selectEventId, openForm);

    const dataFiltered = applyFilter({
        inputData: events,
        filters,
        dateError,
      });

      useEffect(() => {
        if(names){
          setUserData(names);
        }
      }, [names]);

      const onEventUpdate = useCallback((arg) => {
        console.log(isOld);
        if (arg.oldEvent.start < new Date || isOld){
          arg.revert();
        }
        else{
          onDropEvent(arg, dropUpdate);
        }
      }, [onDropEvent, isOld]);

     const hours = {
        start: dayjs(new Date).format('HH:mm'), /* Current Hour/Minute 24H format */
        end: '17:00', // 5pm? set to whatever
        daysOfWeek: [ 1, 2, 3, 4, 5, 6 ], // Monday - Thursday
    }

    const hours2 = {
      start: dayjs(new Date).format('YYYY-MM-DD HH:mm:ss'), /* Current Hour/Minute 24H format */
  }
      
    return(
        <Container maxWidth={settings.themeStretch ? false : 'xl'}>
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
                droppable
                selectable
                eventDragStart={(arg) => {
                  // Check if the event start time is in the past
                  if (arg.event.start < new Date()) {
                    setIsOld(true);
                  }
                  else{
                    setIsOld(false);
                  }
                }}
                eventConstraint={hours2}
                businessHours={hours}
                selectLongPressDelay={0}
                LongPressDelay={0}
                locales={allLocales} 
                locale='es'
                rerenderDelay={10}
                allDayMaintainDuration
                eventResizableFromStart
                ref={calendarRef}
                dayMaxEventRows={3}
                eventDisplay="block"
                events={dataFiltered}
                headerToolbar = { false }
                select={onSelectRange}
                eventClick={onClickEvent}
                height={ smUp ? 720 : 'auto' }
                eventDrop={(arg) => {
                  onEventUpdate(arg);
                }}
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
          
          <Dialog
            fullWidth
            maxWidth='sm'
            open={openForm}
            onClose={onCloseForm}
            transitionDuration={{
              enter: theme.transitions.duration.shortest,
              exit: theme.transitions.duration.shortest - 1000,
            }}
          >
            <Lista
              currentEvent={currentEvent}
              onClose={onCloseForm}
              userData={userData}
              usersMutate={usersMutate}
              selectedDate={selectedDate}
            />
          </Dialog>
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