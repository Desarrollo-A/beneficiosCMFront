import 'dayjs/locale/es';
import dayjs from 'dayjs';
import * as yup from 'yup';
import PropTypes from 'prop-types';
import { es } from 'date-fns/locale'
import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Stack from "@mui/system/Stack";
import Button from "@mui/material/Button";
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import ToggleButton from '@mui/material/ToggleButton';
import DialogActions from "@mui/material/DialogActions";
import DialogContent from '@mui/material/DialogContent';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { MobileDatePicker, MobileTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import uuidv4 from 'src/utils/uuidv4';
import { fDate } from 'src/utils/format-time';

import { reRender, cancelDate, deleteEvent, createCustom, updateCustom, createAppointment, updateAppointment } from 'src/api/calendar-specialist';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

export default function Lista({ currentEvent, onClose, userData, selectedDate, usersMutate }) {
    dayjs.locale('es') // valor para cambiar el idioma del dayjs

    const { enqueueSnackbar } = useSnackbar();
    const [titulo, setTitulo] = useState(dayjs(selectedDate).format("dddd, DD MMMM YYYY"));
    const [type, setType] = useState('cancel'); // constante para el cambio entre cancelar hora y agendar cita
    const [patient, setPatient] = useState({
        id: '',
        nombre: ''
    });  
    const disableInputs = currentEvent?.id && currentEvent?.estatus !== 1;
    
    const formSchema = yup.object().shape({
        title: yup.string().max(100).required('Se necesita el título').trim(), // maximo de caracteres para el titulo 100
        start: yup.date().required(),
        end: yup.date().required(),
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

    const handleChangeType = useCallback((event, newType) => { // handle para el cambio entre ocupar una hora o hacer cita solo quantum balance
        if (newType !== null) {
            setType(newType);
            setPatient({
                id: '',
                nombre: ''
            });
        }

        usersMutate();// Actualizar datos
    }, [usersMutate]);

    const values = watch();
    const dateError = checkDate(values.start, values.end, type); // se hace conversion a tiemestamp para cuando se tenga id
    const selectedUser = userSelect(type, patient); // validacion si se selecciono paciente, solo al crear cita

    const onSubmit = handleSubmit(async (data) => {
        let save = '';

        // se da el formato juntando la fecha elegida y la hora que se elige con los minutos
        const eventData = {
            id: currentEvent?.id ? currentEvent?.id : uuidv4(),
            title: data?.title,
            hora_inicio: `${data.start.getHours()}:${data.start.getMinutes()}`,
            hora_final: `${data.end.getHours()}:${data.end.getMinutes()}`,
            newDate: fDate(data?.newDate),
            usuario: patient.id,
            estatus: currentEvent?.estatus
        };

        try {
            if (!dateError && selectedUser) {
                if (currentEvent?.id && currentEvent?.type === 'ocupado') {
                    save = await updateCustom(eventData); // en caso de que se un evento se modifica
                }
                else if(currentEvent?.id && currentEvent?.type === 'cita'){
                    save = await updateAppointment(eventData);
                }
                else {
                    save = type === 'cancel' ? await createCustom(eventData) : await createAppointment(eventData); // si no hay id, se cancela una hora o se crea una cita
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

            onClose();
        } 
        catch (error) {
            enqueueSnackbar("Ha ocurrido un error al eliminar", { variant: "error" });
            onClose();
        }
    }, [currentEvent?.id, enqueueSnackbar, onClose]);

    const onCancel = useCallback(async () => { // funcion para cancelar citas
        try {
            const resp = await cancelDate(`${currentEvent?.id}`);

            if (resp.result) {
                enqueueSnackbar(resp.msg);
                reRender();
            }
            else {
                enqueueSnackbar(resp.msg, { variant: "error" });
            }

            onClose();
        } 
        catch (error) {
            enqueueSnackbar("Ha ocurrido un error al cancelar", { variant: "error" });
            onClose();
        }
    }, [currentEvent?.id, enqueueSnackbar, onClose]);

    return (
        <FormProvider methods={methods} onSubmit={onSubmit}>
            <DialogContent sx={{ p: { xs: 1, md: 2 } }}>
                <Stack direction="row" justifyContent='space-between' useFlexGap flexWrap="wrap" sx={{ p: { xs: 1, md: 2 } }}>
                    <Typography variant='h5' sx={{ display: "flex", alignItems: "center" }}>{currentEvent?.id ? 'EDITAR HORARIO' : 'AGREGAR HORARIO'}</Typography>
                    {!!currentEvent?.id && currentEvent?.estatus === 1 && (
                        <Tooltip title={currentEvent.type === 'cita' ? "Cancelar cita" : "Eliminar horario"}>
                            <IconButton onClick={currentEvent.type === 'cita' ? onCancel : onDelete}>
                                <Iconify icon="solar:trash-bin-trash-bold" />
                            </IconButton>
                        </Tooltip>
                    )}
                    {!currentEvent?.id && (
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
                    )}
                </Stack>
                <Stack spacing={3} sx={{ p: { xs: 1, md: 2 } }}>
                    {type === 'date' && (
                        <RHFAutocomplete
                            name = "usuario"
                            label = "Pacientes"
                            value = {patient.nombre} // setPatientName(value?.label ? value?.label : ''); setPatienId(value?.value)
                            onChange={(_event, value) => {setPatient({id: value?.value, nombre: value?.label ? value?.label : ''});} }
                            options={userData.map((user) => ({label: user.nombre, value: user.idUsuario}))}
                        />
                    )}
                    <Typography variant="subtitle1">{titulo}</Typography>
                    <RHFTextField disabled={ disableInputs } name="title" label="Título" />
                </Stack>
                
                    <Stack direction="row" sx={{ p: { xs: 1, md: 2 } }}>
                        <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
                            <Controller
                                name="newDate"
                                defaultValue={selectedDate}
                                render={({ field }) =>
                                    <MobileDatePicker
                                        label="Fecha"
                                        disabled={ disableInputs }
                                        defaultValue={selectedDate}
                                        onChange={
                                            (value) => {
                                                field.onChange(value);
                                                setTitulo(dayjs(value).format("dddd, DD MMMM YYYY") );
                                            }
                                        }
                                    />
                                }
                            />
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
                                        error: dateError,
                                        helperText: dateError && 'Error en las horas seleccionadas',
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
            </DialogContent>

            <DialogActions>
                <Button variant='contained' color='error' onClick={onClose}>Cerrar</Button>
                { currentEvent?.estatus === 1 || currentEvent?.estatus === '' ?  
                    <LoadingButton type="submit" variant='contained' disabled={dateError} color='success'>Guardar</LoadingButton> : '' 
                }
            </DialogActions>
        </FormProvider>
    )
}

function checkDate(start, end, type){
    let dateError = false;
    
    const startStamp = dayjs(start).$d;
    const endStamp = dayjs(end).$d;
    const hour = Math.abs(startStamp - endStamp) / 36e5;

    if(start && end){
        if(startStamp >= endStamp || type === "date" && hour !== 1){
            dateError = true;
        }
    }
        
    return dateError;
}

function userSelect(type, patient){
    let selectedUser;
    if (type === "cancel") {
        selectedUser = true;
    } 
    else if (type === "date" && patient.id) {
        selectedUser = true;
    } 
    else {
        selectedUser = false;
    }

    return selectedUser;
}

Lista.propTypes = {
    currentEvent: PropTypes.object,
    onClose: PropTypes.func,
    userData: PropTypes.any,
    usersMutate: PropTypes.func,
    selectedDate: PropTypes.instanceOf(Date)
};