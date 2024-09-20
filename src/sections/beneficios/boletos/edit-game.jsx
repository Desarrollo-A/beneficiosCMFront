import dayjs from 'dayjs';
import * as Yup from 'yup';
import { mutate } from 'swr';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useMemo, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import { Box } from '@mui/system';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import { MobileTimePicker } from '@mui/x-date-pickers';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { endpoints } from 'src/utils/axios';

import { useAuthContext } from 'src/auth/hooks';
import { updateObservaciones } from 'src/api/reportes';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFUpload, RHFTextField } from 'src/components/hook-form';
import { Stack, Typography } from '@mui/material';

// ----------------------------------------------------------------------

export default function EditGame({ open, onClose }) {
    const { enqueueSnackbar } = useSnackbar();

    dayjs.locale('es');

    const { user } = useAuthContext();

    // const updateObservacion = useUpdate(endpoints.reportes.observacion);

    const idUsr = user?.idUsuario;

    const NewUserSchema = Yup.object().shape({
        descripcion: Yup.string().trim().required('El campo es requerido'),
        idCita: Yup.string().required('El campo es requerido'),
        archivo: Yup.mixed().nullable(),
    });

    const defaultValues = useMemo(
        () => ({
            /* descripcion: descripcion || '',
            idCita: idCita || '',
            estatus: currentUser?.estatus || '',
            modificadoPor: currentUser?.modificadoPor || idUsr,
            ests: currentUser?.modificadoPor || 5,
            archivo: null, */
        }),
        [/* currentUser, idUsr */]
    );

    const methods = useForm({
        resolver: yupResolver(NewUserSchema),
        defaultValues,
    });

    const {
        reset,
        handleSubmit,
        setValue,
        formState: { isSubmitting },
    } = methods;

    const onSubmit = handleSubmit(async (data) => {
        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            reset();
            onClose();

            const update = await updateObservaciones(data);

            if (update.estatus === true) {
                enqueueSnackbar(update.msj, { variant: 'success' });
                mutate(endpoints.reportes.lista);
            } else {
                enqueueSnackbar(update.msj, { variant: 'error' });
            }
        } catch (error) {
            console.error('Error en handleSubmit:', error);
            enqueueSnackbar(`Error en actualizar los datos`, { variant: 'danger' });
        }
    });

    const handleDrop = useCallback(
        (acceptedFiles) => {
            const file = acceptedFiles[0];

            const newFile = Object.assign(file, {
                preview: URL.createObjectURL(file),
            });

            if (file) {
                setValue('archivo', newFile, { shouldValidate: true });
            }
        },
        [setValue]
    );

    const handleRemoveFile = useCallback(() => {
        setValue('archivo', null);
    }, [setValue]);

    const esp = {
        // idioma de los botones
        okButtonLabel: 'Seleccionar',
        cancelButtonLabel: 'Cancelar',
        datePickerToolbarTitle: 'Selecciona una fecha',
        timePickerToolbarTitle: 'Selecciona un horario',
    };

    const options = ['Querétaro', 'Cancún', 'Merida', 'Puebla'];

    return (

        <FormProvider methods={methods} onSubmit={onSubmit}>
            <DialogTitle>Editar partido</DialogTitle>

            <DialogContent sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Box mb={2} />
                <Grid container spacing={2} disableEqualOverflow>
                    <Grid item xs={12}>
                        <TextField id="titulo" label="Titulo" variant="outlined" sx={{ width: '100%' }} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField name="descripcion" label="Descripción" multiline rows={2} sx={{ width: '100%' }} />
                    </Grid>

                    <Grid item xs={6}>
                        <LocalizationProvider localeText={esp}>
                            <Box>
                                <DatePicker sx={{ width: '100%' }} label="Fecha de partido" />
                            </Box>
                        </LocalizationProvider>
                    </Grid>

                    <Grid item xs={6}>
                        <LocalizationProvider localeText={esp}>
                            <Box>
                                <MobileTimePicker
                                    sx={{ width: '100%' }}
                                    label="Hora de partido"
                                /* onChange={handleInicio} */
                                />
                            </Box>
                        </LocalizationProvider>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField id="lugar" label="Estadio" variant="outlined" sx={{ width: '100%' }} />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField id="lugar" label="Estadio" variant="outlined" sx={{ width: '100%' }} />
                    </Grid>

                    <Grid item xs={6}>
                        <LocalizationProvider localeText={esp}>
                            <Box>
                                <DatePicker sx={{ width: '100%' }} label="Inicio de publicación" />
                            </Box>
                        </LocalizationProvider>
                    </Grid>

                    <Grid item xs={6}>
                        <LocalizationProvider localeText={esp}>
                            <Box>
                                <DatePicker sx={{ width: '100%' }} label="Fin de publicación" />
                            </Box>
                        </LocalizationProvider>
                    </Grid>

                    <Grid item xs={6}>
                        <Autocomplete
                            disablePortal
                            options={options}
                            renderInput={(params) => <TextField {...params} label="Sede" />}
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            name="boletos"
                            label="Limite de boletos"
                            rows={1}
                            sx={{ width: '100%' }}
                            onInput={(e) => {
                                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                            }}
                        />
                    </Grid>

                    <Grid xs={12} md={6} >
                        <Stack spacing={1.5}>
                            <Typography variant="subtitle2">Imagen preview</Typography>
                            <RHFUpload
                                name="imagenPreview"
                                onDrop={handleDrop}
                                onDelete={handleRemoveFile}
                                accept={{ '*': [] }}
                            />
                        </Stack>
                    </Grid>

                    <Grid xs={12} md={6} >
                        <Stack spacing={1.5}>
                            <Typography variant="subtitle2">Imagen descriptiva</Typography>
                            <RHFUpload
                                name="imagen"
                                onDrop={handleDrop}
                                onDelete={handleRemoveFile}
                                accept={{ '*': [] }}
                            />
                        </Stack>
                    </Grid>
                </Grid>

            </DialogContent>

            {/* <RHFTextField name="idCita" value={idCita} style={{ display: 'none' }} /> */}

            <DialogActions>
                <Button variant="contained" color="error" onClick={onClose}>
                    Cerrar
                </Button>

                <LoadingButton type="submit" variant="contained" color="success" loading={isSubmitting}>
                    Guardar
                </LoadingButton>
            </DialogActions>
        </FormProvider>

    );
}

EditGame.propTypes = {
    onClose: PropTypes.func,
    open: PropTypes.bool,
};
