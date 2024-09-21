import dayjs from 'dayjs';
import { enqueueSnackbar } from 'notistack';
import { useRef, useState, useCallback } from 'react';

import { useResponsive } from 'src/hooks/use-responsive';

import { fTimestamp } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export default function useCalendar() {
  const calendarRef = useRef(null);

  const calendarEl = calendarRef.current;

  const smUp = useResponsive('up', 'sm');

  const [date, setDate] = useState(new Date());

  const [openForm, setOpenForm] = useState(false);

  const [selectEventId, setSelectEventId] = useState('');

  const [selectedRange, setSelectedRange] = useState(null);

  const[selectedDate, setSelectedDate] = useState();

  const[selectedEnd, setSelectedEnd] = useState();

  const [view, setView] = useState(smUp ? 'dayGridMonth' : 'listWeek');

  const onOpenForm = useCallback(() => {
    setOpenForm(true);
  }, []);

  const onCloseForm = useCallback(() => {
    setOpenForm(false);
    setSelectedRange(null);
    setSelectEventId('');
  }, []);

  const onInitialView = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      const newView = smUp ? 'dayGridMonth' : 'listWeek';
      calendarApi.changeView(newView);
      setView(newView);
    }
  }, [calendarEl, smUp]);

  const onChangeView = useCallback(
    (newView) => {
      if (calendarEl) {
        const calendarApi = calendarEl.getApi();

        calendarApi.changeView(newView);
        setView(newView);
      }
    },
    [calendarEl]
  );

  const onDateToday = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.today();
      setDate(calendarApi.getDate());
    }
  }, [calendarEl]);

  const onDatePrev = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.prev();
      setDate(calendarApi.getDate());
    }
  }, [calendarEl]);

  const onDateNext = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.next();
      setDate(calendarApi.getDate());
    }
  }, [calendarEl]);

  const onSelectRange = useCallback(
    (arg) => {
      if (calendarEl) {
        const calendarApi = calendarEl.getApi();

        calendarApi.unselect();
      }

      if(dayjs(arg.start).format('YYYY/MM/DD') >= dayjs(new Date()).format('YYYY/MM/DD')){
        onOpenForm();
        setSelectedDate(arg.start);
      }
      else
        enqueueSnackbar('No se puede agendar en dias anteriores', { variant: 'error' });
      
      setSelectedRange({
        start: fTimestamp(arg.start),
        end: fTimestamp(arg.end),
      });
    },
    [calendarEl, onOpenForm]
  );

  const onClickEvent = useCallback(
    (arg) => {
      const { event } = arg;
      
      onOpenForm();
      setSelectEventId(event.id);
      setSelectedDate(event.start);
      setSelectedEnd(event.end);
    },
    [onOpenForm]
  );

  const onResizeEvent = useCallback((arg, updateEvent) => {
    const { event } = arg;

    updateEvent({
      id: event.id,
      allDay: event.allDay,
      start: fTimestamp(event.start),
      end: fTimestamp(event.end),
    });
  }, []);

  const onDropEvent = useCallback((arg, updateEvent) => {
    const { event } = arg;
    
    updateEvent({
      id: event.id,
      allDay: event.allDay,
      start: fTimestamp(event.start),
      end: fTimestamp(event.end),
      oldStart: event.extendedProps.fechaInicio,
      color: event.textColor,
      type: event.extendedProps.type,
      estatus: event.extendedProps.estatus,
      idPaciente: event.extendedProps.idPaciente
    });
  }, []);

  const onClickEventInFilters = useCallback(
    (eventId) => {
      if (eventId) {
        onOpenForm();
        setSelectEventId(eventId);
      }
    },
    [onOpenForm]
  );

  return {
    calendarRef,
    //
    view,
    date,
    //
    onDatePrev,
    onDateNext,
    onDateToday,
    onDropEvent,
    onClickEvent,
    onChangeView,
    onSelectRange,
    onResizeEvent,
    onInitialView,
    //
    openForm,
    onOpenForm,
    onCloseForm,
    //
    selectEventId,
    selectedRange,
    selectedDate,
    selectedEnd,
    //
    onClickEventInFilters,
  };
}