import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useAuthContext } from 'src/auth/hooks';

import { useGetAppointmentsByUser } from 'src/api/calendar-colaborador';
import { dropUpdate, useGetMotivos, GetCustomEvents } from 'src/api/calendar-specialist';
import { useGetSedesPresenciales, useGetHorariosPresenciales } from 'src/api/especialistas';

import Iconify from 'src/components/iconify';
import { Calendar } from 'src/components/calendar';
import { useSettingsContext } from 'src/components/settings';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import './style.css';
import AgendarDialog from './dialogs/agendar';
import PresencialDialog from './dialogs/presencial';
import { useEvent, useCalendar } from './hooks';

//---------------------------------------------------------

const colors = [
  {
    color: '#ffa500',
    text: 'Cita por asistir',
  },
  {
    color: '#ff0000',
    text: 'Cita cancelada colaborador / especialista',
  },
  {
    color: '#808080',
    text: 'Cita penalizada',
  },
  {
    color: '#008000',
    text: 'Cita finalizada',
  },
  {
    color: '#ff4d67',
    text: 'Cita con falta justificada',
  },
  {
    color: '#00ffff',
    text: 'Cita pendiente de pago',
  },

  {
    color: '#ff0000',
    text: 'Cita con pago pendiente expirado',
  },
  {
    color: '#ffe800',
    text: 'Primera cita',
  },
  {
    color: '#0000ff',
    text: 'Cita en línea',
  },
  {
    color: '#33105D',
    text: 'Cita en proceso de pago',
  },
];

const defaultFilters = {
  colors: [],
  startDate: null,
  endDate: null,
};

//---------------------------------------------------------

export default function CalendarioView() {
	const settings = useSettingsContext()
	const { user } = useAuthContext()
	const smUp = useResponsive('up', 'sm')

	const [animate, setAnimate] = useState(false)
	const [presencialDialog, setOpenPresencialDialog] = useState(false)

	const agendarDialog = useBoolean()

	const {
    // view,
    date,
    openForm,
    // onDatePrev,
    // onDateNext,
    onCloseForm,
    // onDateToday,
    // calendarRef,
    // onChangeView,
    onClickEvent,
    selectedDate,
    selectEventId,
  } = useCalendar()

  const [filters] = useState(defaultFilters)

  const dateError =
    filters.startDate && filters.endDate
      ? filters.startDate.getTime() > filters.endDate.getTime()
      : false;

	const {
    data: beneficiarioEvents,
    appointmentLoading,
    appointmentMutate,
  } = useGetAppointmentsByUser(date, user?.idUsuario, user?.idSede)

  const { events: especialistaEvents, eventsLoading } = GetCustomEvents(date, user?.idUsuario, user?.idSede);

  const { horarios, horariosGet, horariosLoading } = useGetHorariosPresenciales({ idEspecialista: user?.idUsuario })

  const events = [...beneficiarioEvents, ...especialistaEvents]

  const currentEvent = useEvent(events, selectEventId, openForm)

	const beneficiarioFiltered = applyFilter({
    inputData: events.concat(horarios),
    filters,
    dateError,
  })

	const handleClick = useCallback(() => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    setAnimate(true);
    setTimeout(() => {
      setAnimate(false);
    }, 500); // Duración de la animación en milisegundos
  }, [])

  const addHorarioPresencial = () => {
    setOpenPresencialDialog(true)
  }

  const onCloseHorariosDialog = () => {
    setOpenPresencialDialog(false)

    horariosGet({ idEspecialista: user?.idUsuario })
  }

  return(
		<>
			<Container maxWidth={settings.themeStretch ? false : 'xl'}>
				<Stack
	        direction={{ xs : "column", md: 'row'}}
	        alignItems="center"
	        spacing={2}
	        justifyContent="right"
	        sx={{
	          mb: { xs: 3, md: 5 },
	        }}
	      >
	      	<Typography variant='h4'>Calendario</Typography>
	      	<Box sx={{ flex: 1 }}></Box>
          <Button
            className={`ButtonCita ${animate ? 'animate' : ''}`}
            onClick={agendarDialog.onTrue}
            id="animateElement"
            fullWidth={!smUp}
          >
            <span>{user?.idRol === 3 ? 'Agendar cita como beneficiario' : 'Agendar nueva cita'}</span>
            <Iconify icon="carbon:add-filled" />
          </Button>
          {user?.idRol === 3 &&
	          <Button color="inherit" variant="outlined" onClick={addHorarioPresencial} fullWidth={!smUp}>
	            Establecer horario presencial
	          </Button>
        	}
	      </Stack>

	      <Calendar
	      	select={handleClick}
	      	labels={colors}
	      	events={beneficiarioFiltered}
	      	eventClick={onClickEvent}
	      	loading={appointmentLoading || eventsLoading || horariosLoading}
	      />

	      <AgendarDialog
	      	maxWidth="md"
	      	open={agendarDialog.value}
          onClose={agendarDialog.onFalse}
          currentEvent={currentEvent}
          selectedDate={selectedDate}
          appointmentMutate={appointmentMutate}
        />

        <AgendarDialog
        	maxWidth="xs"
	      	open={openForm}
          currentEvent={currentEvent}
          onClose={onCloseForm}
          selectedDate={selectedDate}
          appointmentMutate={appointmentMutate}
        />

        <PresencialDialog
	        open={presencialDialog}
	        onClose={onCloseHorariosDialog}
	        // start={startPresencial}
	        // end={endPresencial}
	        // sede={sedePresencial}
	      />
			</Container>
		</>
  )
}

//---------------------------------------------------------

const applyFilter = ({ inputData, filters, dateError }) => {
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