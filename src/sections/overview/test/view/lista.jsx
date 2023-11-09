// import axios from "axios";
import * as yup from 'yup';
import { useState } from "react";
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Stack from "@mui/system/Stack";
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogActions from "@mui/material/DialogActions";
import DialogContent from '@mui/material/DialogContent';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

import uuidv4 from 'src/utils/uuidv4';
import { fTimestamp } from 'src/utils/format-time';

import { createCustom } from 'src/api/calendar';

import { useSnackbar } from 'src/components/snackbar';
import { RHFTextField } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';

export default function Lista({ currentEvent, onClose, currentDay }){
    const { enqueueSnackbar } = useSnackbar();
    const [horaInicio, setHoraInicio] = useState();
    const [horaFinal, setHoraFinal] = useState();

    const formSchema = yup.object().shape({
        title: yup.string().max(100).required('Se necesita el titulo'),
        start: yup.mixed(),
        end: yup.mixed()
    });

    const methods = useForm({
        resolver: yupResolver(formSchema),
        defaultValues: currentEvent
    });

    const { handleSubmit } = methods;

    const onSubmit = handleSubmit(async (data) => {
        // se da el formato fTimestamp juntando la fecha actual y la hora que se elige con los minutos
        // este procedimiento para start, hora_inicio y hora_final
        const eventData = {
            id: currentEvent?.id ? currentEvent?.id : uuidv4(),
            title: data?.title,
            start: fTimestamp(`${fecha}' '${horaInicio.getHours()}:${horaInicio.getMinutes()}`),
            end: fTimestamp(`${fecha}' '${horaFinal.getHours()}:${horaFinal.getMinutes()}`),
            hora_inicio: `${horaInicio.getHours()}:${horaInicio.getMinutes()}`,
            hora_final: `${horaFinal.getHours()}:${horaFinal.getMinutes()}`
        };
        if(horaInicio === null){

        }
        else{
            try{
                const save = await createCustom(fecha, eventData);
                if(save.status)
                    enqueueSnackbar(save.message);
                else
                    enqueueSnackbar(save.message);
            }
            catch(error){
                enqueueSnackbar(error);
            }
        }
        
        onClose();
    });
    
    // el formato de la fecha para enviar a la base de datos se envia en formato frances, ya que es el mismo formato en que se almacena en sql
    const fecha = new Intl.DateTimeFormat('fr-ca', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(currentDay);

    const fechaTitulo = new Intl.DateTimeFormat('es-MX', {weekday: 'long', year: 'numeric', month: '2-digit',day: '2-digit'}).format(currentDay);

    return(
        <FormProvider methods={methods} onSubmit={onSubmit}>
            <DialogContent sx={{
                p: { xs: 1, md: 2 }
             }}>
                <Stack spacing = {3} sx={{ 
                p: { xs: 1, md: 2 }
             }}>
                    <RHFTextField name="title" label="Titulo" />                   
                    <Typography variant="h5">Agregar horario </Typography>
                    <Typography variant="subtitle1">{fechaTitulo}</Typography>
                </Stack>
                <Stack direction= "row" spacing={ 2 } sx={{ p: { xs: 1, md: 2 } }}>
                    <TimePicker disableFuture name="start" mode= "time" label="Hora de inicio" onChange={(value) => setHoraInicio(value) } />
                    <TimePicker disableFuture name="end" mode= "time" label="Hora finalización" onChange={(value) => setHoraFinal(value) } />
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button variant='contained' color='error' onClick={onClose}>Cancelar</Button>
                <LoadingButton type="submit" variant='contained' color='success'>Guardar</LoadingButton>
            </DialogActions>
        </FormProvider>
    )
}

Lista.propTypes = {
    currentEvent: PropTypes.object,
    onClose: PropTypes.func,
    currentDay: PropTypes.instanceOf(Date)
  };