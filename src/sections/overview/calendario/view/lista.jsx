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
import { MobileDatePicker } from '@mui/x-date-pickers';
import DialogActions from "@mui/material/DialogActions";
import DialogContent from '@mui/material/DialogContent';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import uuidv4 from 'src/utils/uuidv4';
import { fDate, fTimestamp } from 'src/utils/format-time';

import { reRender, cancelDate, deleteEvent, createCustom, updateCustom, createAppointment } from 'src/api/calendar-specialist';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';


export default function Lista({ currentEvent, onClose, userData, selectedDate }) {
    dayjs.locale('es') // valor para cambiar el idioma del dayjs

    const { enqueueSnackbar } = useSnackbar();
    const [patientId, setPatienId] = useState('');
    const [patientName, setPatientName] = useState('');
    const [type, setType] = useState('cancel'); // constante para el cambio entre cancelar hora y agendar cita

    const formSchema = yup.object().shape({
        title: yup.string().max(100).required('Se necesita el título').trim(), // maximo de caracteres para el titulo 100
        start: yup.date().required(),
        end: yup.date().required(),
    });

    const handleChangeType = useCallback((event, newType) => {
        if (newType !== null) {
            setType(newType);
        }
    }, []);

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
    const dateError = values.start && values.end ? fTimestamp(values.start) >= fTimestamp(values.end) : false; // validación que start no sea mayor a end

    const onSubmit = handleSubmit(async (data) => {
        let save = '';

        // se da el formato juntando la fecha elegida y la hora que se elige con los minutos
        const eventData = {
            id: currentEvent?.id ? currentEvent?.id : uuidv4(),
            title: data?.title,
            start: currentEvent?.id ? `${fDate(data?.newData)} ${data.start.getHours()}:${data.start.getMinutes()}` : dayjs(`${fecha} ${data.start.getHours()}:${data.start.getMinutes()}`).format("YYYY-MM-DD HH:mm"),
            end: currentEvent?.id ? `${fDate(data?.newData)} ${data.end.getHours()}:${data.end.getMinutes()}` : dayjs(`${fecha} ${data.end.getHours()}:${data.end.getMinutes()}`).format("YYYY-MM-DD HH:mm"),
            hora_inicio: `${data.start.getHours()}:${data.start.getMinutes()}`,
            hora_final: `${data.end.getHours()}:${data.end.getMinutes()}`,
            occupied: currentEvent?.id ? currentEvent.occupied : fecha,
            newDate: fDate(data?.newDate),
            usuario: patientId
        };

        try {
            if (!dateError) {
                if (currentEvent?.id) {
                    save = await updateCustom(eventData); // en caso de que se un evento se modifica
                }
                else {
                    save = type === 'cancel' ? await createCustom(fecha, eventData) : await createAppointment(fecha, eventData); // si no hay id, se cancela una hora o se crea una cita
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
        }
        catch (error) {
            enqueueSnackbar("Ha ocurrido un error al guardar");
        }
    });

    // funcion para borrar horarios ocupados 
    const onDelete = useCallback(async () => {
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

    // funcion para cancelar citas
    const onCancel = useCallback(async () => {
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
                 
    const fecha = dayjs(selectedDate).format("YYYY/MM/DD"); // se da el formato de la hora con el dayjs ya que viene en timestamp
    const fechaTitulo = dayjs(selectedDate).format("dddd, DD MMMM YYYY"); // unicamente visual

    return (
        <FormProvider methods={methods} onSubmit={onSubmit}>
            <DialogContent sx={{ p: { xs: 1, md: 2 } }}>
                <Stack direction="row" justifyContent='space-between' useFlexGap flexWrap="wrap" sx={{ p: { xs: 1, md: 2 } }}>
                    <Typography variant='h5' sx={{ display: "flex", alignItems: "center" }}>{currentEvent?.id ? 'EDITAR HORARIO' : 'AGREGAR HORARIO'}</Typography>
                    {!!currentEvent?.id && (
                        <Tooltip title={currentEvent.type ? "Cancelar cita" : "Eliminar horario"}>
                            <IconButton onClick={currentEvent.type ? onCancel : onDelete}>
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
                            value = {patientName}
                            onChange={(_event, value) => {setPatientName(value?.label ? value?.label : ''); setPatienId(value?.value)} }
                            options={userData.map((user) => ({label: user.nombre, value: user.idUsuario}))}
                        />
                    )}
                    <Typography variant="subtitle1">{currentEvent?.id ? dayjs(currentEvent.start).format("dddd, DD MMMM YYYY") : fechaTitulo}</Typography>
                    <RHFTextField disabled={!!currentEvent?.type} name="title" label="Título" />
                </Stack>
                {!!currentEvent?.id && (
                    <Stack direction="row" sx={{ p: { xs: 1, md: 2 } }}>
                        <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
                            <Controller
                                name="newDate"
                                defaultValue={currentEvent?.id ? selectedDate : null}
                                render={({ field }) =>
                                    <MobileDatePicker
                                        label="Fecha"
                                        disabled={!!currentEvent?.type}
                                        defaultValue={currentEvent?.id ? selectedDate : null}
                                        onChange={
                                            (value) => field.onChange(value)
                                        }
                                    />
                                }
                            />
                        </LocalizationProvider>
                    </Stack>
                )}
                <Stack direction="row" justifyContent='space-between' spacing={2} sx={{ p: { xs: 1, md: 2 } }}>
                    <Controller
                        name="start"
                        render={({ field }) =>
                            <TimePicker
                                disabled={!!currentEvent?.type}
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
                            <TimePicker
                                sx={{width:'100%'}}
                                disabled={!!currentEvent?.type}
                                label="Hora finalización"
                                slotProps={{
                                    textField: {
                                        error: dateError,
                                        helperText: dateError && 'La hora de fin no puede ser inferior o igual',
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
                <Button variant='contained' color='error' onClick={onClose}>Cancelar</Button>
                <LoadingButton type="submit" variant='contained' disabled={dateError} color='success'>Guardar</LoadingButton>
            </DialogActions>
        </FormProvider>
    )
}

Lista.propTypes = {
    currentEvent: PropTypes.object,
    onClose: PropTypes.func,
    userData: PropTypes.any,
    selectedDate: PropTypes.instanceOf(Date)
};