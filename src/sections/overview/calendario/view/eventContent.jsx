import 'dayjs/locale/es';
import dayjs from 'dayjs';
import * as yup from 'yup';
import PropTypes from 'prop-types';
import { es } from 'date-fns/locale'
import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Stack from "@mui/system/Stack";
import Dialog from '@mui/material/Dialog';
import Button from "@mui/material/Button";
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogActions from "@mui/material/DialogActions";
import DialogContent from '@mui/material/DialogContent';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { MobileDatePicker, MobileTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import uuidv4 from 'src/utils/uuidv4';
import { fDate } from 'src/utils/format-time';

import { reRender, deleteEvent, updateCustom, cancelAppointment, updateAppointment } from 'src/api/calendar-specialist';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { RHFTextField } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';

export default function EventContent({ currentEvent, onClose, selectedDate, selectedEnd }) {
    dayjs.locale('es') // valor para cambiar el idioma del dayjs
    
    const { enqueueSnackbar } = useSnackbar();
    const [open, setOpen] = useState(false);
    const type = currentEvent?.type;

    const handleClickOpen = () => {
        setOpen(true);
    };

  const handleClose = () => {
    setOpen(false);
  };

    const [dateTitle, setDateTitle] = useState(dayjs(selectedDate).format("dddd, DD MMMM YYYY"));
    const pastCheck = selectedDate < new Date(); // checar si la fecha del evento es inferior a la fecha actual
    const disableInputs = currentEvent?.estatus !== 1 || pastCheck; // deshabilitar inputs
    const allDay = dayjs(currentEvent?.start).format('YYYY/MM/DD') < dayjs(currentEvent?.end).format('YYYY/MM/DD');
    const [defaultInicio, setDefaultInicio] = useState(selectedDate);
    const [defaultFecha, setDefaultFecha] = useState(selectedEnd);
    
    const formSchema = yup.object().shape({
        title: yup.string().max(100).required('Se necesita el título').trim(), // maximo de caracteres para el titulo 100
        start: !allDay ? yup.date().required() : '',
        end: !allDay ? yup.date().required() : '',
    });

    const methods = useForm({
        resolver: yupResolver(formSchema),
        defaultValues: currentEvent
    });

    const {
        reset,
        watch,
        handleSubmit,
    } = methods;

    const values = watch();
    const hourError = checkHour(values.start, values.end, type, defaultInicio, defaultFecha);
    const dateError = type === 'cancel' && values.fecha > defaultFecha; // validacion que la fecha final no sea menor a la fecha inicio

    const onSubmit = handleSubmit(async (data) => {
        let save = '';

        const eventData = { // se da el formato juntando la fecha elegida y la hora que se elige con los minutos
            id: currentEvent?.id ? currentEvent?.id : uuidv4(),
            title: data?.title,
            hora_inicio: dayjs(data.start).format('HH:mm:ss'),
            hora_final: dayjs(data.end).format('HH:mm:ss'),
            fechaInicio: fDate(defaultInicio),
            fechaFinal : type === 'date' ? fDate(defaultInicio) : fDate(defaultFecha),
            paciente: currentEvent?.idPaciente,
            estatus: currentEvent?.estatus
        };

        try {
            if (!dateError && !hourError) {

                switch(type){
                    case 'cancel':
                        save = await updateCustom(eventData);
                        break;

                    case 'date':
                        save = await updateAppointment(eventData);
                        break;
                    
                    default:
                        save = { result: false, msg: "Error al guardar" }
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
    
    const onDelete = useCallback(async () => { // funcion para borrar horarios ocupados 
        try {
            const resp = await deleteEvent(`${currentEvent?.id}`);

            if (resp.result) {
                enqueueSnackbar(resp.msg);
                reRender();
            }
            else {
                enqueueSnackbar(resp.msg, { variant: "error" });
            }

            setOpen(false);
            onClose();
        } 
        catch (error) {
            enqueueSnackbar("Ha ocurrido un error al eliminar", { variant: "error" });
            setOpen(false);
            onClose();
        }
    }, [currentEvent?.id, enqueueSnackbar, onClose]);

    const onCancel = useCallback(async () => { // funcion para cancelar citas
        try {
            const resp = await cancelAppointment(currentEvent);

            if (resp.result) {
                enqueueSnackbar(resp.msg);
                reRender();
            }
            else {
                enqueueSnackbar(resp.msg, { variant: "error" });
            }

            setOpen(false);
            onClose();
        } 
        catch (error) {
            enqueueSnackbar("Ha ocurrido un error al cancelar", { variant: "error" });
            setOpen(false);
            onClose();
        }
    }, [currentEvent, enqueueSnackbar, onClose]);

    return (
        <>
        <FormProvider methods={methods} onSubmit={onSubmit}>
            <DialogContent sx={{ p: { xs: 1, md: 2 } }}>
                <Stack direction="row" justifyContent='space-between' useFlexGap flexWrap="wrap" sx={{ p: { xs: 1, md: 2 } }}>
                    <Typography variant='h5' sx={{ display: "flex", alignItems: "center" }}>{dialogTitle(currentEvent?.estatus, type)}</Typography>
                    {!!currentEvent?.id && currentEvent?.estatus === 1 && !pastCheck && (
                        <Tooltip title={currentEvent?.type === 'date' ? "Cancelar cita" : "Eliminar horario"}>
                            <IconButton onClick={handleClickOpen}>
                                <Iconify icon="solar:trash-bin-trash-bold" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>
                <Stack spacing={3} sx={{ p: { xs: 1, md: 2 } }}>
                    <Typography variant="subtitle1">{dateTitle}</Typography>
                    <RHFTextField disabled={ disableInputs } name="title" label="Título" />
                </Stack>

                <Stack direction="row" justifyContent='space-between' spacing={2} sx={{ p: { xs: 1, md: 2 } }}>
                <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
                        <MobileDatePicker
                                label="Fecha inicial"
                                disabled={ disableInputs }
                                sx={{width: '100%'}}
                                value={defaultInicio}
                                onChange={
                                    (value) => {
                                        setDefaultInicio(value);
                                        setDateTitle(dayjs(value).format("dddd, DD MMMM YYYY") ); // al momento de cambiar el valor en el input, cambia el valor del titulo
                                    }
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
                                    helperText: dateError && 'Formato incorrecto',
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

                <Stack direction="row" justifyContent='space-between' spacing={2} sx={{ p: { xs: 1, md: 2 } }}>
                    <Controller
                        name="start"
                        render={({ field }) =>
                            <MobileTimePicker
                                disabled={ disableInputs }
                                sx={{width:'100%'}}
                                label="Hora de inicio"
                                defaultValue={currentEvent?.id ? dayjs(currentEvent.start).$d : null}
                                onChange={
                                    (value) => field.onChange(value)
                                }
                            />
                        }
                    />

                    <Controller
                        name="end"
                        render={({ field }) =>
                            <MobileTimePicker
                                sx={{width:'100%'}}
                                disabled={ disableInputs }
                                label="Hora finalización"
                                slotProps={{
                                    textField: {
                                        error: hourError,
                                        helperText: hourError && 'Error en las horas seleccionadas',
                                    }
                                }}
                                defaultValue={currentEvent?.id ? dayjs(currentEvent.end).$d : null}
                                onChange={
                                    (value) => field.onChange(value)
                                }
                            />
                        }
                    />
                </Stack>
                
                {type === 'date' && 
                    <Stack>
                        <Stack direction="row" alignItems='center' spacing={1} sx={{ px: { xs: 1, md: 2 }, py: 1}}>
                            
                            <Typography variant='h6'>Información del paciente</Typography>
                        </Stack>
                        
                        <Stack direction="row" alignItems='center' spacing={1} sx={{ px: { xs: 1, md: 2 }, py: 1}}>
                            <Iconify icon="mdi:account-circle-outline" />
                            <Typography fontSize='90%'>{currentEvent?.nombre}</Typography>
                        </Stack>
                    
                        <Stack direction="row" alignItems='center' spacing={1} sx={{ px: { xs: 1, md: 2 }, py: 1}}>
                            <Iconify icon="mdi:phone" />
                            <Typography fontSize='90%'>{currentEvent?.telPersonal}</Typography>
                        </Stack>
                    </Stack>
                }
            </DialogContent>

            <DialogActions>
                <Button variant='contained' color='error' onClick={onClose}>Cerrar</Button>
                { currentEvent?.estatus === 1 && !pastCheck ?
                    <LoadingButton type="submit" variant='contained' disabled={dateError || hourError} color='success'>Guardar</LoadingButton> : ''
                }
            </DialogActions>
        </FormProvider>
        

        <Dialog // dialog de confirmación de eliminación
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description">
        <DialogContent>
            <Stack direction="row" justifyContent='space-between' useFlexGap flexWrap="wrap" sx={{pt: { xs: 1, md: 2 }, pb: { xs: 1, md: 2 }}}>
                <Typography>¡ATENCIÓN!</Typography>
            </Stack>
            <Typography>¿Seguro que quieres {currentEvent?.type === 'date' ? 'cancelar la cita' : 'eliminar el horario'}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' color='error' onClick={handleClose}>Cerrar</Button>
          <Button variant='contained' color='success' onClick={currentEvent?.type === 'date' ? onCancel : onDelete} autoFocus>
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
      </>
    )
}

function checkHour(start, end, type, dateStart, dateEnd){
    let validation = false;

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
                    validation = true;
                }
                else if(type === 'date' && hour !== 1){
                    validation = true;
                }
            }
            break;
        
        case 'cancel':
            if(start && end){
                if(selectedStart >= selectedEnd){
                    validation = true;
                }
            }
            break;

        default:
            break;
    }
        
    return validation;
}


function dialogTitle(estatus, type){ // función solo para mostrar el tipo de titulo en el dialog
        switch(estatus){

            case 0:
                return 'a'
            case 1:
                if(type === 'date')
                    return 'Por asistir';
                return 'Mis horarios';
            case 2:
                return 'Cita cancelada';
            case 3:
                return 'Cita penalizada';
            case 4:
                return 'Finalizada';
    
            default:
                return 'Información';
        }
}

EventContent.propTypes = {
    currentEvent: PropTypes.object,
    onClose: PropTypes.func,
    selectedDate: PropTypes.instanceOf(Date),
    selectedEnd: PropTypes.instanceOf(Date)
};