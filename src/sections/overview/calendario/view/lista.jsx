// import axios from "axios";
import 'dayjs/locale/es';
import * as yup from 'yup';
import dayjs  from 'dayjs';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Stack from "@mui/system/Stack";
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogActions from "@mui/material/DialogActions";
import DialogContent from '@mui/material/DialogContent';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

import uuidv4 from 'src/utils/uuidv4';
import {fTimestamp } from 'src/utils/format-time';

import { useSnackbar } from 'src/components/snackbar';
import { RHFTextField } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';

import { createCustom, updateCustom } from '../calendar';

export default function Lista({ currentEvent, onClose, currentDay }){
    const { enqueueSnackbar } = useSnackbar();

    const formSchema = yup.object().shape({
        title: yup.string().max(100).required('Se necesita el titulo'),
        start: yup.date().required(),
        end: yup.date().required()
    });

    const methods = useForm({
        resolver: yupResolver(formSchema),
        defaultValues: currentEvent
    });

    dayjs.locale('es') // variable para cambiar el idioma del dayjs

    const {
        reset,
        watch,
        handleSubmit,
    } = methods;

    const values = watch();
    const dateError = values.start && values.end ? fTimestamp(values.start) >= fTimestamp(values.end) : false;

    const onSubmit = handleSubmit(async (data) => {
            // se da el formato fTimestamp juntando la fecha actual y la hora que se elige con los minutos
            // este procedimiento para start, hora_inicio y hora_final
            const eventData = {
                id: currentEvent?.id ? currentEvent?.id : uuidv4(),
                title: data?.title,
                start: currentEvent?.id ? `${currentEvent.occupied} ${data.start.getHours()}:${data.start.getMinutes()}` : dayjs(`${fecha} ${data.start.getHours()}:${data.start.getMinutes()}`).format("YYYY-MM-DD HH:mm"),
                end: currentEvent?.id ? `${currentEvent.occupied} ${data.end.getHours()}:${data.end.getMinutes()}` : dayjs(`${fecha} ${data.end  .getHours()}:${data.end.getMinutes()}`).format("YYYY-MM-DD HH:mm"),
                hora_inicio: `${data.start.getHours()}:${data.start.getMinutes()}`,
                hora_final: `${data.end.getHours()}:${data.end.getMinutes()}`,
                occupied: currentEvent?.id ? currentEvent.occupied : fecha
            };

            let save ='';

            try{
                if(!dateError){
                    if(currentEvent?.id){
                        save = await updateCustom(eventData);
                    }
                    else{
                        save = await createCustom(fecha, eventData); 
                    }
    
                    if(save.status)
                        enqueueSnackbar(save.message);
                    else
                        enqueueSnackbar(save.message);

                    reset();
                }
            }
            catch(error){
                enqueueSnackbar(error);
            }
               
        onClose();
    });
    
    // el formato de la fecha para enviar a la base de datos se envia en formato frances, ya que es el mismo formato en que se almacena en sql
    const fecha = new Intl.DateTimeFormat('fr-ca', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(currentDay);
    const fechaTitulo = new Intl.DateTimeFormat('es-MX', {weekday: 'long', year: 'numeric', month: '2-digit',day: '2-digit'}).format(currentDay);

    return(
        <FormProvider methods={methods} onSubmit={onSubmit}>
            <DialogContent sx={{ p: { xs: 1, md: 2 } }}>
                <Stack spacing = {3} sx={{ p: { xs: 1, md: 2 } }}>
                    <RHFTextField disabled={!!currentEvent?.type} name="title" label="Titulo" />
                    <Typography variant="h5">{currentEvent?.type ? "Horario de la cita" : "Agregar horario"} </Typography>
                    <Typography variant="subtitle1">{currentEvent?.id ? dayjs(currentEvent.start).format("dddd, DD/MM/YYYY") : fechaTitulo}</Typography>
                </Stack>
                <Stack direction= "row" spacing={ 2 } sx={{ p: { xs: 1, md: 2 } }}>
                    <Controller
                        name = "start"
                        render = {({field})=>
                            <TimePicker
                                disabled = {!!currentEvent?.type}
                                label="Hora de inicio"
                                defaultValue={currentEvent?.id ? dayjs(currentEvent.start).$d : null}
                                onChange={
                                    (value) => field.onChange(value)
                                }
                            />
                        }
                    />
                    <Controller
                        name = "end"
                        render = {({field})=>
                            <TimePicker
                                disabled = {!!currentEvent?.type}
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
    currentDay: PropTypes.instanceOf(Date),
  };