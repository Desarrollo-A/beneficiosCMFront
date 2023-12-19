import { Base64 } from 'js-base64';
import {useState, useEffect} from 'react';
import Calendar from '@fullcalendar/react'; // => request placed at the top
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import allLocales from '@fullcalendar/core/locales-all'
import interactionPlugin from '@fullcalendar/interaction';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';

import { useResponsive } from 'src/hooks/use-responsive';

import { fTimestamp } from 'src/utils/format-time';

import { CALENDAR_COLOR_OPTIONS } from 'src/_mock/_calendar';
import { updateEvent, useGetEvents } from 'src/api/calendar';
import { useGetBenefits, useGetModalities, useGetEspecialists, useGetAppointmentsByUser } from 'src/api/calendar-colaborador';

import { useSettingsContext } from 'src/components/settings';

import { StyledCalendar } from '../styles';
import CalendarForm from '../calendar-form';
import CalendarDialog from '../calendar-dialog';
import { useEvent, useCalendar } from '../hooks';
import CalendarToolbar from '../calendar-toolbar';

// ----------------------------------------------------------------------

const defaultFilters = {
  colors: [],
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------
const datosUser = JSON.parse(Base64.decode(sessionStorage.getItem('accessToken').split('.')[2]));

export default function CalendarView() {
  const theme = useTheme();

  const settings = useSettingsContext();
  const smUp = useResponsive('up', 'sm');
  const [filters] = useState(defaultFilters);

  // const { events, eventsLoading } = useGetEvents();

  const [beneficios, setBeneficios] = useState([]);
  // const [beneficio, setBeneficio] = useState('');
  const [especialistas, setEspecialistas] = useState([]);
  // const [especialista, setEspecialista] = useState('');
  const [modalidades, setModalidades] = useState([]);
  // const [modalidad, setModalidad] = useState('');
  const [day, setDay] = useState();

  const [selectedValues, setSelectedValues] = useState({
    beneficio: '',
    especialista: '',
    modalidad: '',
  });

  const dateError =
    filters.startDate && filters.endDate
      ? filters.startDate.getTime() > filters.endDate.getTime()
      : false;

    const {
      calendarRef,
      view,
      date,
      openForm,
      onDatePrev,
      onDateNext,
      onDateToday,
      onCloseForm,
      onDropEvent,
      onChangeView,
      onSelectRange,
      onClickEvent,
      onResizeEvent,
      onInitialView,
      selectEventId,
    } = useCalendar();

  const { data: benefits } = useGetBenefits(datosUser.sede);
  const { data: especialists } = useGetEspecialists(datosUser.sede, selectedValues.beneficio);
  const { data: modalities } = useGetModalities(datosUser.sede, selectedValues.especialista);
  const { data: events, appointmentLoading: eventsLoading } = useGetAppointmentsByUser(date);

  const currentEvent = useEvent(events, selectEventId, openForm);

  const dataFiltered = applyFilter({
    inputData: events ,// events,  // [] ,
    filters,
    dateError,
  });

  useEffect(() => {
    onInitialView();
  }, [onInitialView]);

  useEffect(() => {
    console.log("Beneficios", benefits);
    if (benefits) {
      setBeneficios(benefits);
    }
  }, [benefits])

  useEffect(() => {
    console.log("Especialista", especialists);
    if (especialists) {
      setEspecialistas(especialists);
    }
  }, [especialists, beneficios])

  useEffect(() => {
    console.log("Modalidades", modalities);
    if (modalities) {
      setModalidades(modalities);
    }
  }, [modalities])

  const handleChange = (input, value) => {
    if (input === 'beneficio') {
      setSelectedValues({
        beneficio: value,
        especialista: '',
        modalidad: '',
      });
    } else if (input === 'especialista') {
      setSelectedValues({
        ...selectedValues,
        especialista: value,
        modalidad: '',
      });
    } else if (input === 'modalidad'){
      setSelectedValues({
        ...selectedValues,
        modalidad: value,
      });
    }
  };

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
          <Typography variant="h4">Calendar {selectedValues.beneficio +' - '+selectedValues.especialista+' - ' +selectedValues.modalidad}</Typography>
          <Stack direction="row" minWidth="300" justifyContent="flex-end" spacing={0.5}>
            <Box sx={{ minWidth: 200, flexDirection: 'row'}}>
              <FormControl fullWidth>
                <InputLabel id="beneficio-input">Beneficio</InputLabel>
                <Select
                  labelId="Beneficio"
                  id="demo-simple-select-001"
                  label="Beneficio"
                  value={selectedValues.beneficio}
                  onChange={(e) => handleChange('beneficio', e.target.value)}
                  disabled={beneficios.length === 0}
                >
                  {beneficios.map((e, index) => (
                    <MenuItem key={e.id} value={e.id}>
                      {e.puesto.toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ minWidth: 250, flexDirection: 'row'}}>
              <FormControl fullWidth>
                <InputLabel id="especialista-input">Especialista</InputLabel>
                <Select
                  labelId="Especialista"
                  id="demo-simple-select-002"
                  label="Especialista"
                  value={selectedValues.especialista}
                  onChange={(e) => handleChange('especialista', e.target.value)}
                  disabled={especialistas.length === 0}
                >
                  {especialistas.map((e, index) => (
                    <MenuItem key={e.id} value={e.id}>
                      {e.especialista.toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ minWidth: 250, flexDirection: 'row'}}>
              <FormControl fullWidth>
                <InputLabel id="modalidad-input">Modalidad</InputLabel>
                <Select
                  labelId="Modalidad"
                  id="demo-simple-select-003"
                  label="Modalidad"
                  value={selectedValues.modalidad}
                  onChange={(e) => handleChange('modalidad', e.target.value)}
                  disabled={modalidades.length === 0}
                >
                  {modalidades.map((e, index) => (
                    <MenuItem key={e.tipoCita} value={e.tipoCita}>
                      {e.modalidad.toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </Stack>

        {/* Calendario */}
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
              locales={allLocales} 
              locale='es'
              rerenderDelay={10}
              allDayMaintainDuration
              eventResizableFromStart
              ref={calendarRef}
              dateClick={(currentDate) => setDay(currentDate.date)}
              dayMaxEventRows={3}
              eventDisplay="block"
              events={dataFiltered}
              headerToolbar={false}
              select={onSelectRange}
              eventClick={onClickEvent}
              height={smUp ? 720 : 'auto'}
              // eventDrop={(arg) => {
              //   onDropEvent(arg, updateEvent);
              // }}
              // eventResize={(arg) => {
              //   onResizeEvent(arg, updateEvent);
              // }}
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
      {/* MODAL /}
      
      <Dialog
          fullWidth
          maxWidth='sm'
          open={openForm}
          onClose={onCloseForm}
      >
        <Lista 
            currentEvent={currentEvent}
            onClose={onCloseForm}
            currentDay= {day}
            current={date}
            userData={userData}
        />
              
      </Dialog>
      {/*   */}
      <Dialog
        fullWidth
        maxWidth="sm"
        open={openForm}
        onClose={onCloseForm}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest - 80,
        }}
      >
        <CalendarDialog
          currentEvent={currentEvent}
          onClose={onCloseForm}
          currentDay= {day}
          current={date}
          userData={{idUsuario: 1, nombre: 'LUIS ARTURO ALARCÓN BLANCO'}}
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