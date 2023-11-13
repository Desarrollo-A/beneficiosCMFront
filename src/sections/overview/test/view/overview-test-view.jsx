import Calendar from '@fullcalendar/react'; // => request placed at the top
import { useState } from 'react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import allLocales from '@fullcalendar/core/locales-all'
import interactionPlugin from '@fullcalendar/interaction';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';

import { useResponsive } from 'src/hooks/use-responsive';

import { fTimestamp } from 'src/utils/format-time';

import { useSettingsContext } from 'src/components/settings';

import Lista from "./lista";
import { StyledCalendar } from '../styles';
import { GetCustomEvents } from '../calendar';
import CalendarToolbar from '../calendar-tool';
import { useEvent, useCalendar } from '../hooks';

// ----------------------------------------------------------------------

const defaultFilters = {
    colors: [],
    startDate: null,
    endDate: null,
  };
  
  // ----------------------------------------------------------------------

export default function OverviewTestView(){
    const smUp = useResponsive('up', 'sm');
    const settings = useSettingsContext();
    const [ day, setDay] = useState();
    const [filters] = useState(defaultFilters);
    

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
        onDateNext,
        onSelectRange,
        onDateToday,
        onChangeView,
        onClickEvent, 
        openForm,
        onCloseForm,
        //
        selectEventId
    } = useCalendar();

    const { events, eventsLoading} = GetCustomEvents();

    const currentEvent = useEvent(events, selectEventId, openForm);

    const dataFiltered = applyFilter({
        inputData: events,
        filters,
        dateError,
      });

    return(
        <>
        <Container maxWidth={settings.themeStretch ? false : 'xl'}>
            <Stack
                direction= "row"
                alignItems= "center"
                justifyContent= "space-between"
                sx= {{
                    mb: { xs: 3, md: 5 }

                }}
            >
                <Typography variant='h4'>
                    Prueba de calendario
                </Typography>
                <Button
                    variant='outlined'
                >
                    Botón
                </Button>
            </Stack>

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
                     // onOpenFilters={openFilters.onTrue}
                    />

                    <Calendar
                     weekends
                     editable
                     droppable
                     selectable
                     locales={allLocales} 
                     locale='es'
                     rerenderDelay={10}
                     allDayMaintainDuration
                     eventResizableFromStart
                     ref={calendarRef}
                     dayMaxEventRows={3}
                     eventDisplay="block"
                     dateClick={(currentDate) => setDay(currentDate.date)}
                     events={dataFiltered}
                     headerToolbar = { false }
                     select={onSelectRange}
                     eventClick={onClickEvent}
                     height={ smUp ? 720 : 'auto' }
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
            maxWidth='sm'
            open={openForm}
            onClose={onCloseForm}
        >
            <DialogTitle sx= {{ minHeight: 76 }}>
                { openForm && <> { currentEvent?.id ? 'Editar horario' : 'Cancelar horario' } </> }
            </DialogTitle>  

            <Lista 
                currentEvent={currentEvent}
                onClose={onCloseForm}
                currentDay= {day}
                current={date}
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