import 'dayjs/locale/es';
import dayjs from 'dayjs';
import * as yup from 'yup';
import PropTypes from 'prop-types';
import { es } from 'date-fns/locale'
import { useState, useCallback, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Stack from '@mui/system/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import ToggleButton from '@mui/material/ToggleButton';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { Checkbox, FormControlLabel } from '@mui/material';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { MobileDatePicker, MobileTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import uuidv4 from 'src/utils/uuidv4';
import { fDate } from 'src/utils/format-time';

import { reRender, createCustom, createAppointment } from 'src/api/calendar-specialist';

import { enqueueSnackbar } from 'src/components/snackbar';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

export default function Lista({ currentEvent, onClose, userData, selectedDate, usersMutate, modalities }) {
    dayjs.locale('es') // valor para cambiar el idioma del dayjs

    const [allDay, setAllDay] = useState(false);
    const defaultHour = {
        horaInicio: dayjs('0000/00/00 08:00:00').format('HH:mm:ss'),
        horaFinal: dayjs('0000/00/00 18:00:00').format('HH:mm:ss')
    };
    const [defaultFecha, setDefaultFecha] = useState(selectedDate);
    const [defaultInicio, setDefaultInicio] = useState(selectedDate);
    const [defaultEnd, setDefaultEnd] = useState(null);
    const [dateTitle, setDateTitle] = useState(dayjs(selectedDate).format("dddd, DD MMMM YYYY"));
    const [type, setType] = useState('cancel'); // constante para el cambio entre cancelar hora y agendar cita
    const [patient, setPatient] = useState({
        id: '',
        nombre: '',
        idSede: ''
    });
    const [modalitie, setModalitie] = useState({
        id: '',
        idAtencionXSede: ''
    });
    
    const formSchema = yup.object().shape({
        title: type === 'cancel' ? yup.string().max(100).required('Se necesita el título').trim() : '', // maximo de caracteres para el titulo 100
        start: !allDay ? yup.date().required() : ''
    });

          case 'date':
            save = await createAppointment(eventData);
            break;

    const {
        reset,
        watch,
        handleSubmit,
    } = methods;

    const values = watch();
    const hourError = checkHour(values.start, defaultEnd, type, defaultInicio, defaultFecha, allDay);
    const selectedUser = userSelect(type, patient); // validacion si se selecciono paciente, solo al crear cita
    const selectedModalitie = !!(type === 'date' && modalitie.id || type === 'cancel');
    const dateError = type === 'cancel' && defaultInicio > defaultFecha; // validacion que la fecha final no sea menor a la fecha inicio
    const endValidation = allDay ? !defaultEnd : defaultEnd;

    const handleChangeType = useCallback((event, newType) => { // handle para el cambio entre ocupar una hora o hacer cita solo quantum balance
        if (newType !== null) {
            setType(newType);
            setPatient({ id: '', nombre: '' });
            setModalitie('');
            setAllDay(false);
            setDefaultFecha(selectedDate);
            setDefaultEnd(null);
        }

        usersMutate();// Actualizar datos
    }, [usersMutate, selectedDate]);

    const handleChangeDay = useCallback((value) => {
        if(!value){
            setDefaultFecha(selectedDate);
        }
        setDefaultEnd(null);
        setAllDay(value);
    },[selectedDate]);
    
    const handleHourChange = useCallback((value) => {
        const date = value ? (value.getTime() + 1 * 60 * 60 * 1000) : null; // se suma 1 hora a la fecha seleccionada en el primer input
        
        setDefaultEnd(date);
    }, []);
    
    useEffect(() => {
        
    }, []);

    const onSubmit = handleSubmit(async (data) => {
        let save = '';

        const eventData = { // se da el formato juntando la fecha elegida y la hora que se elige con los minutos
            id: uuidv4(),
            title: type === 'cancel' ? data?.title : `Cita con ${patient.nombre}`,
            hora_inicio: !allDay ? dayjs(data?.start).format('HH:mm:ss') : defaultHour.horaInicio,
            hora_final: !allDay ? dayjs(defaultEnd).format('HH:mm:ss') : defaultHour.horaFinal,
            fechaInicio: fDate(defaultInicio),
            fechaFinal: type === 'date' ? fDate(defaultInicio) : fDate(defaultFecha),
            paciente: patient.id
        };

        try {
            if (!dateError && selectedUser && !hourError.result && endValidation && selectedModalitie) {

                switch(type){
                    case 'cancel':
                        save = await createCustom(eventData);
                        break;

                    case 'date':
                        save = await createAppointment(eventData);
                        break;
                    
                    default:
                        save = { result: false, msg: 'Error al guardar' };
                        break;
                }

                if (save.result) {
                    enqueueSnackbar(save.msg);
                    reRender(); // ayuda a que se haga un mutate en caso que sea true el resultado
                    reset();
                    onClose();
                }
                else {
                    enqueueSnackbar(save.msg, { variant: 'error' });
                }
            }
            else{
                enqueueSnackbar("Faltan datos en el formulario", { variant: 'error' });
            }
        }
        catch (error) {
            enqueueSnackbar("Ha ocurrido un error al guardar", { variant: 'error' });
        }
    });

    return (
        <FormProvider methods={methods} onSubmit={onSubmit}>
            <DialogContent sx={{ p: { xs: 1, md: 2 } }}>
                <Stack direction="row" justifyContent='space-between' useFlexGap flexWrap="wrap" sx={{ p: { xs: 1, md: 2 } }}>
                    <Typography variant='h5' sx={{ display: "flex", alignItems: "center" }}>{type === 'cancel' ? 'Cancelar horario' : 'Agendar cita'}</Typography>
                        <ToggleButtonGroup
                        exclusive
                        value={type}
                        size="small"
                        onChange={handleChangeType}
                        >
                            <ToggleButton value="cancel">
                                Cancelar horario
                            </ToggleButton>

                            <ToggleButton value="date">
                                Crear cita
                            </ToggleButton>
                        </ToggleButtonGroup>
                </Stack>
                <Stack direction="row" justifyContent="space-between " sx={{ p: { xs: 1, md: 2 } }}>
                    <Typography variant="subtitle1">{dateTitle}</Typography>
                    {type === 'cancel' &&
                        <FormControlLabel
                        sx={{ mt:-0.85 }}
                         control={
                             <Checkbox onChange={(value) => handleChangeDay(value.target.checked)}/>
                         }
                         label="Ocupar dia(s)"
                         labelPlacement="start"
                         name='daySwitch'
                        />
                    }
                </Stack>
                {type === 'date' && (
                    <Stack spacing={3} sx={{ p: { xs: 1, md: 2 } }}>
                        <RHFAutocomplete
                            name = "usuario"
                            label = "Pacientes"
                            value = ''
                            onChange={(_event, value) => {setPatient({id: value?.value, nombre: value?.label, idSede: value?.idSede}) } }
                            options={userData.map((user) => ({label: user.nombre, value: user.idUsuario,  idSede: user.idSede}))}
                        />
                    </Stack>
                )}
                <Stack spacing={3} sx={{ p: { xs: 1, md: 2 } }}>
                    {type === 'date' ? (
                            <RHFAutocomplete
                                name = "tipoCita"
                                label = "Tipo de cita"
                                value = {modalitie.nombre}
                                onChange={(_event, value) => { setModalitie({id: value?.label, idAtencionXSede: value?.value}) }}
                                options={ modalities.map((mod) => ({label: mod.modalidad, value: mod.idAtencionXSede })) }
                            />
                    ) : (<RHFTextField name="title" label="Título" />)}
                    
                </Stack>

                <Stack direction="row" justifyContent='space-between' spacing={2} sx={{ p: { xs: 1, md: 2 } }}>
                    <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
                        <Controller
                            name="fechaInicio"
                            render={({ field }) =>
                                <MobileDatePicker
                                    label="Fecha inicial"
                                    sx={{width: '100%'}}
                                    value={defaultInicio}
                                    onChange={
                                        (value) => {
                                            setDefaultInicio(value);
                                            setDateTitle(dayjs(value).format("dddd, DD MMMM YYYY") ); // al momento de cambiar el valor en el input, cambia el valor del titulo
                                        }
                                    }
                                />
                            }
                        />
                        {type === 'cancel' && 
                        (<MobileDatePicker
                            label="Fecha final"
                            sx={{width: '100%'}}
                            value={defaultFecha}
                            slotProps={{
                                textField: {
                                    error: dateError,
                                    helperText: dateError && 'Error: Menor a la fecha Inicial'
                                }
                            }}
                            onChange={
                                (value) => {
                                    setDefaultFecha(value);
                                }
                            }
                        />)
                        }
                    </LocalizationProvider>

                    
                </Stack>

                {!allDay &&
                (<Stack direction="row" justifyContent='space-between' spacing={2} sx={{ p: { xs: 1, md: 2 } }}>
                    <Controller
                        name="start"
                        render={({ field }) =>
                            <MobileTimePicker
                                sx={{width:'100%'}}
                                label="Hora de inicio"
                                onChange={
                                    (value) => {
                                        field.onChange(value);
                                        handleHourChange(value);
                                    }
                                }
                            />
                        }
                    />

                    <Controller
                        name="end"
                        render={({ field }) =>
                            <MobileTimePicker
                                sx={{width:'100%'}}
                                label="Hora de finalización"
                                value={defaultEnd}
                                disabled = {type === 'date'}
                                slotProps={{
                                    textField: {
                                        error: hourError.result,
                                        helperText: hourError.result && hourError.msg,
                                    }
                                }}
                                onChange={
                                    (value) => setDefaultEnd(value)
                                }
                            />
                        }
                    />
                </Stack>)
                }
            </DialogContent>

            <DialogActions>
                <Button variant='contained' color='error' onClick={onClose}>Cerrar</Button> 
                <LoadingButton type="submit" variant='contained' disabled={dateError || hourError.result} color='success'>Guardar</LoadingButton>
            </DialogActions>
        </FormProvider>
    )
}

function checkHour(start, end, type, dateStart, dateEnd){
    let validation = {result: false, msg: ''};

    const startStamp = dayjs(start).$d;
    const endStamp = dayjs(end).$d;
    let hour = '';

    dateStart = dayjs(dateStart).format('YYYY/MM/DD');
    dateEnd = dayjs(dateEnd).format('YYYY/MM/DD');
    const hourStart = dayjs(start).format('HH:mm:ss');
    const hourEnd = dayjs(end).format('HH:mm:ss');

    const selectedStart = dayjs(`${dateStart} ${hourStart}`).$d;
    const selectedEnd = dayjs(`${dateEnd} ${hourEnd}`).$d;
    

    switch(type){
        case 'date':
            if(start && end){
                hour = Math.abs(startStamp - endStamp) / 36e5;

                if(startStamp >= endStamp){
                    validation = {result: true, msg: 'Error: hora de inicio mayor a la hora final'};
                }
                else if(type === 'date' && hour !== 1){
                    validation = {result: true, msg: 'Error: No se puede agendar mas de una hora'};
                }
            }
            break;
        
        case 'cancel':
            if(start && end){
                if(selectedStart >= selectedEnd){
                    validation = {result: true, msg: 'Error: hora de inicio mayor a la hora final'};
                }
            }
            break;

        default:
            enqueueSnackbar('Error en las validaciones', {variant: 'error'})
            break;
    }
        
    return validation;
}

function checkDate(start, end, type, allDay) {
  let dateError = false;

  const startStamp = dayjs(start).$d;
  const endStamp = dayjs(end).$d;
  const hour = Math.abs(startStamp - endStamp) / 36e5;

  if (start && end && !allDay) {
    if (startStamp >= endStamp) {
      dateError = true;
    } else if (type === 'date' && hour !== 1) {
      dateError = true;
    }
  }

  return dateError;
}

function userSelect(type, patient) {
  let selectedUser = true;

  if (type === 'date' && !patient.id) {
    selectedUser = false;
  }

  return selectedUser;
}


Lista.propTypes = {
    currentEvent: PropTypes.object,
    onClose: PropTypes.func,
    userData: PropTypes.any,
    usersMutate: PropTypes.func,
    modalities: PropTypes.any,
    selectedDate: PropTypes.instanceOf(Date)
};
