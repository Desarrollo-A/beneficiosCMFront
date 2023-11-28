// import axios from "axios";
import 'dayjs/locale/es';
import * as yup from 'yup';
import dayjs  from 'dayjs';
import {es} from 'date-fns/locale'
import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Stack from "@mui/system/Stack";
import Button from "@mui/material/Button";
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { MobileDatePicker } from '@mui/x-date-pickers';
import DialogActions from "@mui/material/DialogActions";
import DialogContent from '@mui/material/DialogContent';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import uuidv4 from 'src/utils/uuidv4';
import {fDate, fTimestamp } from 'src/utils/format-time';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { RHFTextField } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';

import { reRender, cancelDate, deleteEvent, createCustom, updateCustom } from '../calendar';

export default function Lista({ currentEvent, onClose, currentDay }){
    const { enqueueSnackbar } = useSnackbar();

    const formSchema = yup.object().shape({
        title: yup.string().max(100).required('Se necesita el titulo').trim(),
        start: yup.date().required(),
        end: yup.date().required(),
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
                start: currentEvent?.id ? `${fDate(data?.newData)} ${data.start.getHours()}:${data.start.getMinutes()}` : dayjs(`${fecha} ${data.start.getHours()}:${data.start.getMinutes()}`).format("YYYY-MM-DD HH:mm"),
                end: currentEvent?.id ? `${fDate(data?.newData)} ${data.end.getHours()}:${data.end.getMinutes()}` : dayjs(`${fecha} ${data.end  .getHours()}:${data.end.getMinutes()}`).format("YYYY-MM-DD HH:mm"),
                hora_inicio: `${data.start.getHours()}:${data.start.getMinutes()}`,
                hora_final: `${data.end.getHours()}:${data.end.getMinutes()}`,
                occupied: currentEvent?.id ? currentEvent.occupied : fecha,
                newDate: fDate(data?.newDate)
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
    
                    if(save.status){
                        enqueueSnackbar(save.message);
                        reRender();
                    }
                    else
                        enqueueSnackbar(save.message, {variant: 'error'});

                    reset();
                }
            }
            catch(error){
                enqueueSnackbar(error);
            }
               
        onClose();
    });

    const onDelete = useCallback(async () => {
        try {
          const resp = await deleteEvent(`${currentEvent?.id}`);
          
          if(resp.status){
            enqueueSnackbar(resp.message);
          }
          else{
            enqueueSnackbar(resp.message, {variant: "error"});
          }

          onClose();
        } catch (error) {
          enqueueSnackbar("Error", {variant: "error"});
          onClose();
        }
      }, [currentEvent?.id, enqueueSnackbar, onClose]);

      const onCancel = useCallback(async () => {
        try {
          const resp = await cancelDate(`${currentEvent?.id}`);
          
          if(resp.status){
            enqueueSnackbar(resp.message);
          }
          else{
            enqueueSnackbar(resp.message, {variant: "error"});
          }

          onClose();
        } catch (error) {
          enqueueSnackbar("Error", {variant: "error"});
          onClose();
        }
      }, [currentEvent?.id, enqueueSnackbar, onClose]);

    
    // el formato de la fecha para enviar a la base de datos se envia en formato frances, ya que es el mismo formato en que se almacena en sql
    const fecha = new Intl.DateTimeFormat('fr-ca', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(currentDay);
    const fechaTitulo = dayjs(currentDay).format("dddd, DD MMMM YYYY");


    return(
        <FormProvider methods={methods} onSubmit={onSubmit}>
            <DialogContent sx={{ p: { xs: 1, md: 2 } }}>
                <Stack direction="row" justifyContent='space-between' useFlexGap flexWrap="wrap" sx={{ p: { xs:1, md:2 } }}>
                    <Typography variant='h5' sx={{ display: "flex", alignItems: "center" }}>{ currentEvent?.id ? 'EDITAR HORARIO' : 'AGREGAR HORARIO' }</Typography>
                    {!!currentEvent?.id && (
                      <Tooltip title= {currentEvent.type ? "Cancelar cita" : "Eliminar horario"}>
                        <IconButton onClick={currentEvent.type ? onCancel : onDelete }>
                            <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </Tooltip>
                    )}
                </Stack>
                <Stack spacing = {3} sx={{ p: { xs: 1, md: 2 } }}>
                    <Typography variant="subtitle1">{currentEvent?.id ? dayjs(currentEvent.start).format("dddd, DD MMMM YYYY") : fechaTitulo}</Typography>
                    <RHFTextField disabled={!!currentEvent?.type} name="title" label="Titulo" />
                </Stack>
                {!!currentEvent?.id && (
                    <Stack direction="row" sx={{ p: { xs: 1, md: 2 } }}>
                        <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
                            <Controller
                                name = "newDate"
                                defaultValue={currentEvent?.id ? dayjs(currentEvent.start).$d : null}
                                render = {({field})=>
                                    <MobileDatePicker 
                                        label="Fecha" 
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