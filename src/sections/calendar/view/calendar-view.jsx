import { Base64 } from 'js-base64';
import Calendar from '@fullcalendar/react'; // => request placed at the top
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import { useState, useEffect, useCallback } from 'react';
import interactionPlugin from '@fullcalendar/interaction';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import Servicios from 'src/utils/servicios';
import { fTimestamp } from 'src/utils/format-time';

import { CALENDAR_COLOR_OPTIONS } from 'src/_mock/_calendar';
import { updateEvent, useGetEvents, useGetBenefits } from 'src/api/calendar';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';

import { StyledCalendar } from '../styles';
import CalendarForm from '../calendar-form';
import { useEvent, useCalendar } from '../hooks';
import CalendarToolbar from '../calendar-toolbar';
import CalendarFilters from '../calendar-filters';
import NuevaCitaForm from '../calendario-formulario';
import CalendarFiltersResult from '../calendar-filters-result';

// ----------------------------------------------------------------------

const defaultFilters = {
  colors: [],
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

export default function CalendarView() {
  const theme = useTheme();

  const settings = useSettingsContext();

  const smUp = useResponsive('up', 'sm');

  const openFilters = useBoolean();
  const servicios = Servicios();
  const [filters, setFilters] = useState(defaultFilters);

  const { events, eventsLoading } = useGetEvents();
 
  const { data } = useGetBenefits();

  const [beneficios, setBeneficios] = useState([]);
  const [selected, setSelected] = useState('');

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
    onDateToday,
    onDropEvent,
    onChangeView,
    onSelectRange,
    onClickEvent,
    onResizeEvent,
    onInitialView,
    //
    openForm,
    onOpenForm,
    onCloseForm,
    //
    selectEventId,
    selectedRange,
    //
    onClickEventInFilters,
  } = useCalendar();

  const currentEvent = useEvent(events, selectEventId, selectedRange, openForm);

  const datosUser = JSON.parse(Base64.decode(sessionStorage.getItem('accessToken').split('.')[2]));

  useEffect(() => {
    onInitialView();
  }, [onInitialView]);

  useEffect(() => {
    console.log("ID", datosUser);
  }, [datosUser])

  useEffect(() => {
    if (data) {
      setBeneficios(data);
    }
  }, [data])

  const handleFilters = useCallback((name, value) => {
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleChange = (event) => {
    setBeneficios(event.target.value);
  };

  const canReset = !!filters.colors.length || (!!filters.startDate && !!filters.endDate);

  const dataFiltered = applyFilter({
    inputData: events,
    filters,
    dateError,
  });

  const renderResults = (
    <CalendarFiltersResult
      filters={filters}
      onFilters={handleFilters}
      canReset={canReset}
      onResetFilters={handleResetFilters}
      results={dataFiltered.length}
      sx={{ mb: { xs: 3, md: 5 } }}
    />
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        >
          <Typography variant="h4">Calendar</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={onOpenForm}
          >
            Vámonos alv
          </Button>
          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Consultas</InputLabel>
              <Select
                labelId="Beneficio"
                id="demo-simple-select-001"
                label="Beneficio"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                disabled={data.length === 0}
              >
                {data.map((e, index) => (
                  <MenuItem key={e.area} value={e.area}>
                    {e.area}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Stack>

        {canReset && renderResults}

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
              onOpenFilters={openFilters.onTrue}
            />

            <Calendar
              weekends
              editable
              droppable
              selectable
              rerenderDelay={10}
              allDayMaintainDuration
              eventResizableFromStart
              ref={calendarRef}
              initialDate={date}
              initialView={view}
              dayMaxEventRows={3}
              eventDisplay="block"
              events={dataFiltered}
              headerToolbar={false}
              select={onSelectRange}
              eventClick={onClickEvent}
              height={smUp ? 720 : 'auto'}
              eventDrop={(arg) => {
                onDropEvent(arg, updateEvent);
              }}
              eventResize={(arg) => {
                onResizeEvent(arg, updateEvent);
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
      </Container>

      <Dialog
        fullWidth
        maxWidth="xs"
        open={openForm}
        onClose={onCloseForm}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest - 80,
        }}
      >
        <DialogTitle sx={{ minHeight: 76 }}>
          {openForm && <> {currentEvent?.id ? 'Edit Event' : 'Add Event'}</>}
        </DialogTitle>

        <CalendarForm
          currentEvent={currentEvent}
          colorOptions={CALENDAR_COLOR_OPTIONS}
          onClose={onCloseForm}
        />
      </Dialog>

      <CalendarFilters
        open={openFilters.value}
        onClose={openFilters.onFalse}
        //
        filters={filters}
        onFilters={handleFilters}
        //
        canReset={canReset}
        onResetFilters={handleResetFilters}
        //
        dateError={dateError}
        //
        events={events}
        colorOptions={CALENDAR_COLOR_OPTIONS}
        onClickEvent={onClickEventInFilters}
      />
      <NuevaCitaForm open={false} /* especialidadElegida={citasServicio} */ />
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
