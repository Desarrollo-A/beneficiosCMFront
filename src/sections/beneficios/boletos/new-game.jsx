import dayjs from 'dayjs';
import * as Yup from 'yup';
import { mutate } from 'swr';
import PropTypes from 'prop-types';
import { es } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useState, useEffect, useCallback } from 'react';

import { Box } from '@mui/system';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { MobileDateTimePicker } from '@mui/x-date-pickers';
import { Stack, TextField, Typography } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { endpoints } from 'src/utils/axios';

import { useAuthContext } from 'src/auth/hooks';
import { newEvent, updateEvent } from 'src/api/beneficios/boletos';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFUpload, RHFTextField, RHFAutocomplete, } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function NewGame({ open, item, onClose }) {
    const { enqueueSnackbar } = useSnackbar();

    const [btnLoad, setBtnLoad] = useState(false);

    const sedesArray = [
        { idsede: 1, nsede: 'Querétaro' },
        { idsede: 5, nsede: 'Merida' },
        { idsede: 9, nsede: 'Cancún' },
        { idsede: 19, nsede: 'Puebla' }
    ];

    dayjs.locale('es');

    const { user } = useAuthContext();

    const [fechaPartido, setFechaPartido] = useState(null);
    const [errorFechaPartido, setErrorFechaPartido] = useState(false);

    const [inicioPublicacion, setInicioPublicacion] = useState(null);
    const [errorInicioPublicacion, setErrorInicioPublicacion] = useState(false);

    const [finPublicacion, setFinPublicacion] = useState(null);
    const [errorFinPublicacion, setErrorFinPublicacion] = useState(false);

    const [errorSedes, setErrorSedes] = useState(false);

    const localizationLabels = {
        okButtonLabel: 'Seleccionar',
        cancelButtonLabel: 'Cancelar',
        datePickerToolbarTitle: 'Selecciona una fecha',
        timePickerToolbarTitle: 'Selecciona un horario',
        dateTimePickerToolbarTitle: 'Selecciona un horario',
    };

    const handleSedes = (val) => {
        setErrorSedes(false);
    };

    const handleFechaPartido = (val) => {
        setFechaPartido(val);
        setErrorFechaPartido(false);
    };

    const handleInicioPublicacion = (val) => {
        setInicioPublicacion(val);
        setErrorInicioPublicacion(false);
    };

    const handleFinPublicacion = (val) => {
        setFinPublicacion(val);
        setErrorFinPublicacion(false);
    };

    const resetStates = () => {
        setFechaPartido(null);
        setInicioPublicacion(null);
        setFinPublicacion(null);
        setErrorFechaPartido(false);
        setErrorInicioPublicacion(false);
        setErrorFinPublicacion(false);
    };

    const NewUserSchema = Yup.object().shape({
        titulo: Yup.string().required('El campo es requerido'),
        estadio: Yup.string().required('El campo es requerido'),
        boletos: Yup.string().required('El campo es requerido'),
        imagenPreview: Yup.mixed().required('Ingresa una imagen válida'),
        imagen: Yup.mixed().required('Ingresa una imagen válida'),
    });

    const defaultValues = useMemo(
        () => ({
            titulo: item ? item?.titulo : '',
            descripcion: item ? item?.descripcion : '',
            estadio: item ? item?.lugarPartido : '',
            sedes: item ? item?.sede : null,
            boletos: item ? item?.limiteBoletos : '',
        }),
        [item]
    );

    const methods = useForm({
        resolver: yupResolver(NewUserSchema),
        defaultValues,
    });

    const {
        reset,
        handleSubmit,
        setValue,
    } = methods;

    const onSubmit = handleSubmit(async (data) => {

        try {

            let res = { msg: 'Surgió un error inesperado', result: false };

            if (item) {
                res = await updateEvent(
                    item?.id,
                    data?.titulo,
                    data?.descripcion,
                    dayjs(fechaPartido).format('YYYY-MM-DD HH:mm:ss'),
                    data?.estadio,
                    dayjs(inicioPublicacion).format('YYYY-MM-DD HH:mm:ss'),
                    dayjs(finPublicacion).format('YYYY-MM-DD HH:mm:ss'),
                    selectedSede?.idsede,
                    data?.boletos,
                    data?.imagenPreview,
                    data?.imagen,
                    user?.idUsuario
                );
            }
            if (!item) {
                res = await newEvent(
                    data?.titulo,
                    data?.descripcion,
                    dayjs(fechaPartido).format('YYYY-MM-DD HH:mm:ss'),
                    data?.estadio,
                    dayjs(inicioPublicacion).format('YYYY-MM-DD HH:mm:ss'),
                    dayjs(finPublicacion).format('YYYY-MM-DD HH:mm:ss'),
                    selectedSede?.idsede,
                    data?.boletos,
                    data?.imagenPreview,
                    data?.imagen,
                    user?.idUsuario
                );
            }

            enqueueSnackbar(res.msg, { variant: res.result === true ? 'success' : 'error' });
            setBtnLoad(false);

            onClose();
            reset();
            mutate(endpoints.boletos.getBoletos);
        } catch (error) {
            setBtnLoad(false);
            console.error('Error en handleSubmit:', error);
            enqueueSnackbar(`Error en actualizar los datos`, { variant: 'danger' });
        }
    });

    const validateStates = () => {
        const ahora = Date();

        if (
            selectedSede === null ||
            selectedSede === undefined ||
            selectedSede === ''
        )
            setErrorSedes(true);
        if (
            fechaPartido === null ||
            fechaPartido === undefined ||
            fechaPartido === '' ||
            fechaPartido <= ahora
        )
            setErrorFechaPartido(true);
        if (
            inicioPublicacion === null ||
            inicioPublicacion === undefined ||
            inicioPublicacion === '' ||
            inicioPublicacion <= ahora
        )
            setErrorInicioPublicacion(true);
        if (
            finPublicacion === null ||
            finPublicacion === undefined ||
            finPublicacion === '' ||
            finPublicacion <= inicioPublicacion
        )
            setErrorFinPublicacion(true);
    };

    useEffect(() => {
        reset(defaultValues);
        resetStates();
    }, [defaultValues, reset]);

    useEffect(() => {
        if (item) {
            setFechaPartido(new Date(item?.fechaPartido));
            setInicioPublicacion(new Date(item?.inicioPublicacion));
            setFinPublicacion(new Date(item?.finPublicacion));
        }
    }, [open, item]);

    const handleDrop = useCallback(
        (acceptedFiles) => {
            const file = acceptedFiles[0];

            const newFile = Object.assign(file, {
                preview: URL.createObjectURL(file),
            });

            if (file) {
                setValue('imagen', newFile, { shouldValidate: true });
            }
        },
        [setValue]
    );

    const handleImagePreview = useCallback(
        (acceptedFiles) => {
            const file = acceptedFiles[0];

            // Verificar las dimensiones de la imagen usando FileReader e Image
            const reader = new FileReader();
            const img = new Image();

            reader.onload = (event) => {
                img.src = event.target.result;

                img.onload = () => {
                    // Verificamos si la altura es exactamente 200px
                    /* if (img.height === 200 && img.width === 402) { */
                    const newFile = Object.assign(file, {
                        preview: URL.createObjectURL(file),
                    });

                    // Si la imagen es válida, la asignamos al valor del campo
                    setValue('imagenPreview', newFile, { shouldValidate: true });
                    /* } else {
                        enqueueSnackbar(`Solo se permiten imágenes con dimensiones de 402 x 200px.`, {
                            variant: 'warning'
                        });
                    } */
                };
            };

            reader.readAsDataURL(file);
        },
        [setValue]
    );

    const handleRemoveFile = useCallback(() => {
        setValue('imagen', null);
    }, [setValue]);

    const removeImagePreview = useCallback(() => {
        setValue('imagenPreview', null);
    }, [setValue]);

    const defaultSede = sedesArray.find((i) => i.idsede === defaultValues?.sedes) || null;;

    const [selectedSede, setSelectedSede] = useState(defaultSede);

    return (

        <FormProvider methods={methods} onSubmit={onSubmit}>
            <DialogTitle>Nuevo partido</DialogTitle>

            <DialogContent sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Box mb={2} />
                <Grid container spacing={2} disableEqualOverflow>
                    <Grid xs={12}>
                        <RHFTextField id="titulo" name='titulo' label="Titulo (*)" variant="outlined" sx={{ width: '100%' }} />
                    </Grid>

                    {/* <Grid xs={12}>
                        <RHFTextField name="descripcion" label="Descripción" multiline rows={2} sx={{ width: '100%' }} />
                    </Grid> */}

                    <Grid xs={12}>
                        <LocalizationProvider
                            adapterLocale={es}
                            dateAdapter={AdapterDateFns}
                            localeText={localizationLabels}
                        >
                            <MobileDateTimePicker
                                label="Fecha e inicio de evento (*)"
                                sx={{ width: '100%' }}
                                value={fechaPartido}
                                minDate={new Date()}
                                onChange={(val) => {
                                    handleFechaPartido(val);
                                }}
                                slotProps={{
                                    textField: {
                                        error: errorFechaPartido,
                                        helperText: errorFechaPartido && 'Ingresa una fecha de evento válida',
                                    },
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid xs={12}>
                        <RHFTextField name="estadio" label="Estadio (*)" rows={2} sx={{ width: '100%' }} />
                    </Grid>

                    <Grid xs={6}>
                        <LocalizationProvider
                            adapterLocale={es}
                            dateAdapter={AdapterDateFns}
                            localeText={localizationLabels}
                        >
                            <MobileDateTimePicker
                                label="Inicio de publicación del evento (*)"
                                sx={{ width: '100%' }}
                                value={inicioPublicacion}
                                minDate={new Date()}
                                onChange={(val) => {
                                    handleInicioPublicacion(val);
                                }}
                                slotProps={{
                                    textField: {
                                        error: errorInicioPublicacion,
                                        helperText:
                                            errorInicioPublicacion && 'Ingresa una fecha de inicio de publicación válida',
                                    },
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid xs={6}>
                        <LocalizationProvider
                            adapterLocale={es}
                            dateAdapter={AdapterDateFns}
                            localeText={localizationLabels}
                        >
                            <MobileDateTimePicker
                                label="Fin de publicación del evento (*)"
                                sx={{ width: '100%' }}
                                value={finPublicacion}
                                minDate={finPublicacion === null ? new Date() : new Date(inicioPublicacion)}
                                onChange={(val) => {
                                    handleFinPublicacion(val);
                                }}
                                slotProps={{
                                    textField: {
                                        error: errorFinPublicacion,
                                        helperText:
                                            errorFinPublicacion && 'Ingresa una fecha de fin de publicación válida',
                                    },
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid xs={6}>
                        <RHFAutocomplete
                            name="sedes"
                            placeholder="Sedes (*)"
                            multiple={false}
                            freeSolo
                            value={selectedSede}  
                            options={sedesArray}   
                            getOptionLabel={(i) => i.nsede || ''}  
                            onChange={(event, newValue) => {  
                                handleSedes(newValue);  

                                if (typeof newValue === 'string') {
                                    setSelectedSede({ nsede: newValue });
                                } else {
                                    setSelectedSede(newValue);
                                }
                            }}
                            renderOption={(props, i) => (
                                <li {...props} key={i.idsede}>
                                    {i.nsede}
                                </li>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    error={errorSedes}  
                                    helperText={errorSedes && 'Selecciona una sede'}  
                                    placeholder="Sedes (*)"
                                />
                            )}
                        />

                    </Grid>

                    <Grid xs={6}>
                        <RHFTextField
                            name="boletos"
                            label="Limite de boletos (*)"
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
                            {/* <Typography variant="body2" sx={{ mb: 1, color: 'gray' }}>402 x 200px</Typography> */}
                            <RHFUpload
                                name="imagenPreview"
                                onDrop={handleImagePreview}
                                onDelete={removeImagePreview}
                                accept={{ 'image/*': [] }}
                            />
                        </Stack>
                    </Grid>

                    <Grid xs={12} md={6} >
                        <Stack spacing={1.5}>
                            <Typography variant="subtitle2">
                                Imagen descriptiva
                            </Typography>
                            <RHFUpload
                                name="imagen"
                                onDrop={handleDrop}
                                onDelete={handleRemoveFile}
                                accept={{ 'image/*': [] }}
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

                <LoadingButton type="submit" variant="contained" color="success"
                    loading={btnLoad} onClick={() => {
                        validateStates()
                    }}>
                    Guardar
                </LoadingButton>
            </DialogActions>
        </FormProvider>
    );
}

NewGame.propTypes = {
    onClose: PropTypes.func,
    open: PropTypes.bool,
    item: PropTypes.object,
};
