import Calendar from '@fullcalendar/react'; // => request placed at the top
import listPlugin from '@fullcalendar/list';
import { useState, useCallback } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import allLocales from '@fullcalendar/core/locales-all'
import interactionPlugin from '@fullcalendar/interaction';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';

import { useResponsive } from 'src/hooks/use-responsive';

import { fTimestamp } from 'src/utils/format-time';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';

import Lista from "./lista";
import { StyledCalendar } from '../styles';
import CalendarToolbar from '../calendar-tool';
import { useEvent, useCalendar } from '../hooks';
import { deleteEvent, GetCustomEvents } from '../calendar';

// ----------------------------------------------------------------------

const defaultFilters = {
    colors: [],
    startDate: null,
    endDate: null,
  };
  
  // ----------------------------------------------------------------------

export default function OverviewTestView(){
    const { enqueueSnackbar } = useSnackbar();
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

    const { events, eventsLoading} = GetCustomEvents(date);

    const currentEvent = useEvent(events, selectEventId, openForm);

    const dataFiltered = applyFilter({
        inputData: events,
        filters,
        dateError,
      });

      const onDelete = useCallback(async () => {
        try {
          await deleteEvent(`${currentEvent?.id}`);
          enqueueSnackbar('Delete success!');
          onCloseForm();
        } catch (error) {
          console.error(error);
        }
      }, [currentEvent?.id, enqueueSnackbar, onCloseForm]);

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
                <Stack direction="row" justifyContent='space-between' useFlexGap flexWrap="wrap">
                    { openForm && <> { currentEvent?.id ? 'Editar horario' : 'Cancelar horario' } </> }
                    {!!currentEvent?.id && (
                      <Tooltip title="Borrar horario">
                        <IconButton onClick={onDelete}>
                            <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </Tooltip>
                    )}
                </Stack>
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