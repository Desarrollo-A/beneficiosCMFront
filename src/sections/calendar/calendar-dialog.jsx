import 'dayjs/locale/es';
import dayjs from 'dayjs';
import * as yup from 'yup';
import PropTypes from 'prop-types';
import { es } from 'date-fns/locale'
import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Stack from "@mui/system/Stack";
import Button from "@mui/material/Button";
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControl from '@mui/material/FormControl';
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

import { reRender, cancelDate, deleteEvent, createCustom, updateCustom, createAppointment } from 'src/api/calendar-colaborador';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';


export default function CalendarDialog({ currentEvent, onClose, currentDay, /* userData */ }) {
    dayjs.locale('es') // valor para cambiar el idioma del dayjs

    const { enqueueSnackbar } = useSnackbar();
    // const [patientId, setPatienId] = useState('');
    // const [patientName, setPatientName] = useState('');
    const [type, setType] = useState('cancel');

    const formSchema = yup.object().shape({
        title: yup.string().max(100).required('Se necesita el titulo').trim(),
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
    const dateError = values.start && values.end ? fTimestamp(values.start) >= fTimestamp(values.end) : false; // se dan los datos de star y end, para la validacion que el fin no sea antes que el inicio

    const onSubmit = handleSubmit(async (data) => {


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

        let save = '';

        try {
            if (!dateError) {
                if (currentEvent?.id) {
                    save = await updateCustom(eventData);
                }
                else {
                    save = type === 'cancel' ? await createCustom(fecha, eventData) : await createAppointment(fecha, eventData);
                }

                if (save.status) {
                    enqueueSnackbar(save.message);
                    reRender();
                    reset();
                    onClose();
                }
                else {
                    enqueueSnackbar(save.message, { variant: 'error' });
                }
            }
        }
        catch (error) {
            enqueueSnackbar(error);
        }
    });

    // funcion para borrar horarios ocupados 
    const onDelete = useCallback(async () => {
        try {
            const resp = await deleteEvent(`${currentEvent?.id}`);

            if (resp.status) {
                enqueueSnackbar(resp.message);
            }
            else {
                enqueueSnackbar(resp.message, { variant: "error" });
            }

            onClose();
        } catch (error) {
            enqueueSnackbar("Error", { variant: "error" });
            onClose();
        }
    }, [currentEvent?.id, enqueueSnackbar, onClose]);

    // funcion para cancelar citas
    const onCancel = useCallback(async () => {
        try {
            const resp = await cancelDate(`${currentEvent?.id}`);

            if (resp.status) {
                enqueueSnackbar(resp.message);
            }
            else {
                enqueueSnackbar(resp.message, { variant: "error" });
            }

            onClose();
        } catch (error) {
            enqueueSnackbar("Error", { variant: "error" });
            onClose();
        }
    }, [currentEvent?.id, enqueueSnackbar, onClose]);


    // el formato de la fecha para enviar a la base de datos se envia en formato frances, ya que es el mismo formato en que se almacena en sql
    // se puede hacer el cambio tambien usando el dayjs
    const fecha = new Intl.DateTimeFormat('fr-ca', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(currentDay);
    const fechaTitulo = dayjs(currentDay).format("dddd, DD MMMM YYYY");


    return (
        <FormProvider methods={methods} onSubmit={onSubmit}>
            <DialogContent sx={{ p: { xs: 1, md: 2 } }}>
                <Stack direction="row" justifyContent='space-between' useFlexGap flexWrap="wrap" sx={{ p: { xs: 1, md: 2 } }}>
                    <Typography variant='h5' sx={{ display: "flex", alignItems: "center" }}>{currentEvent?.id ? 'EDITAR CITA' : 'AGENDAR CITA'}</Typography>
                    {!!currentEvent?.id && (
                        <Tooltip title="Cancelar cita">
                            <IconButton onClick={onCancel}>
                                <Iconify icon="solar:trash-bin-trash-bold" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>
                <Stack spacing={3} sx={{ p: { xs: 1, md: 2 } }}>
                    <Typography variant="subtitle1">{currentEvent?.id ? dayjs(currentEvent.start).format("dddd, DD MMMM YYYY") : fechaTitulo}</Typography>
                    <RHFTextField disabled={!!currentEvent?.type} name="title" label="Titulo" />
                </Stack>
                {!!currentEvent?.id && (
                    <Stack direction="row" sx={{ p: { xs: 1, md: 2 } }}>
                        <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
                            <Controller
                                name="newDate"
                                defaultValue={currentEvent?.id ? dayjs(currentEvent.start).$d : null}
                                render={({ field }) =>
                                    <MobileDatePicker
                                        label="Fecha"
                                        disabled={!!currentEvent?.type}
                                        defaultValue={currentEvent?.id ? dayjs(currentEvent.start).$d : null}
                                        onChange={
                                            (value) => field.onChange(value)
                                        }
                                    />
                                }
                            />
                        </LocalizationProvider>
                    </Stack>
                )}
                {/* AQUI VA EL SELECT */}
                <Box sx={{ minWidth: 250, flexDirection: 'row'}}>
                    <FormControl fullWidth>
                      <InputLabel id="modalidad-input">Modalidad</InputLabel>
                      {/* <Select
                        labelId="Modalidad"
                        id="demo-simple-select-003"
                        label="Modalidad"
                        value={modalidad}
                        onChange={(e) => setModalidad(e.target.value)}
                        disabled={modalidades.length === 0}
                      >
                        {modalidades.map((e, index) => (
                          <MenuItem key={e.idUsuario} value={e.nombre}>
                            {e.nombre.toUpperCase()}
                          </MenuItem>
                        ))}
                      </Select> */}
                    </FormControl>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button variant='contained' color='error' onClick={onClose}>Cancelar</Button>
                <LoadingButton type="submit" variant='contained' disabled={dateError} color='success'>Guardar</LoadingButton>
            </DialogActions>
        </FormProvider>
    )
}

CalendarDialog.propTypes = {
    currentEvent: PropTypes.object,
    onClose: PropTypes.func,
    currentDay: PropTypes.instanceOf(Date),
    // userData: PropTypes.any
};