/* eslint-disable import/no-cycle */
import dayjs from 'dayjs';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { Button, IconButton } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify/iconify';
import FormProvider, {
    RHFTextField,
} from 'src/components/hook-form';

import Request from './request';
// ----------------------------------------------------------------------

export default function Simulator({ conditional }) {

    const [FirstDay, setFirstDay] = useState('');
    const [dateNext, setdateNext] = useState('');
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        const today = new Date();

        const getFirstFriday = (date) => {
            let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            let firstFriday = new Date(firstDay);

            // Buscar el primer viernes del mes
            while (firstFriday.getDay() !== 5) {
                firstFriday.setDate(firstFriday.getDate() + 1);
            }

            // Si ya pasó el primer viernes, calcular el primer viernes del siguiente mes
            if (firstFriday < date) {
                firstDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
                firstFriday = new Date(firstDay);
                while (firstFriday.getDay() !== 5) {
                    firstFriday.setDate(firstFriday.getDate() + 1);
                }
            }

            return formatDate(firstFriday);
        };

        const formatDate = (date) => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();

            return `${day}-${month}-${year}`;
        };

        // Calcular fechas
        const firstFriday = getFirstFriday(today);

        // 12 meses despues
        const ftNext = dayjs(firstFriday).add(365, 'day').format('MM-DD-YYYY');

        // Actualizar estado
        setFirstDay(firstFriday);
        setdateNext(ftNext);
    }, []);

    const [rtSemanal, setRtSemanal] = useState('0.00');

    const [invMensual, setInvMensual] = useState('0.00');

    const [invAnual, setInvAnual] = useState('0.00');

    const [renInv, setRenInv] = useState('0.00');

    const [invRen, setInvRen] = useState('0.00');

    const NewProductSchema = Yup.object().shape({
        ahorro: Yup.number()
            .typeError('Debe ser un número')
            .required('Ingresa un monto')
            .positive('Debe ser un número positivo')
            .min(1.00, 'Debe ser mayor o igual a $1'),
    });

    const defaultValues = useMemo(
        () => ({
            ahorro: '',
        }),
        []
    );

    const methods = useForm({
        resolver: yupResolver(NewProductSchema),
        defaultValues,
    });

    const {
        handleSubmit,
    } = methods;

    const onSubmit = handleSubmit(async (data) => {
        try {
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Retención semanal
            setRtSemanal(((data.ahorro / 30.4) * 7).toFixed(2));

            // Inversión mensual
            setInvMensual((data.ahorro).toFixed(2));

            // Inversión anual
            setInvAnual((data.ahorro * 12).toFixed(2));

            // Rendimiento de invesión
            setRenInv((data.ahorro).toFixed(2));

            // Invesión + rendimiento
            setInvRen(((data.ahorro * 12) + data.ahorro).toFixed(2))

        } catch (error) {
            console.error(error);
        }
    });

    const render = (

        <>
        {conditional === 0 &&(
            <Typography variant="h4" sx={{ p: 3, fontWeight: 'bold', mb: -2, color: 'black' }}>
                Calculadora de ahorro
            </Typography>
        )}

            <Stack spacing={3} sx={{ p: 3 }}>
                <RHFTextField
                    name="ahorro"
                    size="small"
                    label="Monto mensual a ahorrar"
                    placeholder="0.00"
                    type="number"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Box component="span" sx={{ color: 'text.disabled' }}>
                                    $
                                </Box>
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderWidth: '.15em',
                                borderColor: '#BAA36B',
                            },
                            '&:hover fieldset': {
                                borderWidth: '.15em',
                                borderColor: '#BAA36B',
                            },
                            '&.Mui-focused fieldset': {
                                borderWidth: '.15em',
                                borderColor: '#BAA36B',
                            },
                        },
                    }}
                />

                <Grid container alignItems="stretch" spacing={2}>
                    <Grid item xs={12} md={5}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '80px' }}>
                            <Typography sx={{ mb: 0, fontWeight: 'bold', color: 'black', fontSize: '13px' }}>
                                Fecha de inicio de contrato
                            </Typography>
                            <RHFTextField
                                name="fechainicio"
                                size="small"
                                disabled
                                type="number"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Box component="span">
                                                {FirstDay}
                                            </Box>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(186, 163, 107, 0.26)',
                                        borderRadius: 1,
                                        '& fieldset': {
                                            border: 'none',
                                        },
                                        '&:hover fieldset': {
                                            border: 'none',
                                        },
                                        '&.Mui-focused fieldset': {
                                            border: 'none',
                                        },
                                    },
                                }}
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={5}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '80px' }}>
                            <Typography sx={{ mb: 0, fontWeight: 'bold', color: 'black', fontSize: '13px' }}>
                                Fecha de fin de contrato
                            </Typography>
                            <RHFTextField
                                disabled
                                size="small"
                                name="fechaFin"
                                type="text"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Box component="span">
                                                {dateNext}
                                            </Box>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(186, 163, 107, 0.26)',
                                        borderRadius: 1,
                                        '& fieldset': {
                                            border: 'none',
                                        },
                                        '&:hover fieldset': {
                                            border: 'none',
                                        },
                                        '&.Mui-focused fieldset': {
                                            border: 'none',
                                        },
                                    },
                                }}
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={2}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '80px' }}>
                            <Typography>ㅤ</Typography>
                            <Button
                                onClick={handleSubmit(onSubmit)}
                                variant="contained"
                                fullWidth
                                sx={{
                                    height: '40px',
                                    backgroundColor: '#00263A',
                                    color: '#ffffff',
                                    '&:hover': {
                                        backgroundColor: '#002244',
                                    },
                                }}
                            >
                                Calcular
                            </Button>
                        </Box>
                    </Grid>
                </Grid>

                <Grid container alignItems="stretch" spacing={2}>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '80px' }}>
                            <Tooltip title="Esta retención se hará de tu nomina semanal." placement="top">
                                <Typography sx={{ mb: 0, fontWeight: 'bold', color: 'black', fontSize: '13px' }}>
                                    Retención semanal
                                </Typography>
                            </Tooltip>
                            <RHFTextField
                                disabled
                                size="small"
                                name="retencionSemanal"
                                type="number"
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Box component="span" sx={{ color: 'text.disabled' }}>
                                                $ {rtSemanal}
                                            </Box>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: '#BAA36B !important',
                                        },
                                    },
                                }}
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '80px' }}>
                            <Typography sx={{ mb: 0, fontWeight: 'bold', color: 'black', fontSize: '13px' }}>
                                Inversión mensual
                            </Typography>
                            <RHFTextField
                                disabled
                                size="small"
                                name="retencionSemanal"
                                type="number"
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Box component="span" sx={{ color: 'text.disabled' }}>
                                                $ {invMensual}
                                            </Box>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: '#BAA36B !important',
                                        },
                                    },
                                }}
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '80px' }}>
                            <Tooltip title="Inversión de 12 meses." placement="top">
                                <Typography sx={{ mb: 0, fontWeight: 'bold', color: 'black', fontSize: '13px' }}>
                                    Inversión anual
                                </Typography>
                            </Tooltip>
                            <RHFTextField
                                disabled
                                size="small"
                                name="retencionSemanal"
                                type="number"
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Box component="span" sx={{ color: 'text.disabled' }}>
                                                $ {invAnual}
                                            </Box>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: '#BAA36B !important',
                                        },
                                    },
                                }}
                            />
                        </Box>
                    </Grid>
                </Grid>

                <Grid container alignItems="stretch" spacing={1}>
                    <Grid item xs={12} md={conditional === 1 ? 6 : 4}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '80px' }}>
                            <Tooltip title="Este es el rendimiento de 12 meses de inversión." placement="top">
                                <Typography sx={{ mb: 0, fontWeight: 'bold', color: 'black', fontSize: '13px' }}>
                                    Rendimiento de inversión
                                </Typography>
                            </Tooltip>
                            <RHFTextField
                                disabled
                                size="small"
                                name="retencionSemanal"
                                type="number"
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Box component="span" sx={{ color: 'text.disabled' }}>
                                                $ {renInv}
                                            </Box>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: '#BAA36B !important',
                                        },
                                    },
                                }}
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={conditional === 1 ? 6 : 4}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '80px' }}>
                            <Typography sx={{ mb: 0, fontWeight: 'bold', color: 'black', fontSize: '13px' }}>
                                Inversión + rendimiento
                            </Typography>
                            <RHFTextField
                                disabled
                                size="small"
                                name="retencionSemanal"
                                type="number"
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Box component="span" sx={{ color: 'text.disabled' }}>
                                                $ {invRen}
                                            </Box>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: '#BAA36B !important',
                                        },
                                    },
                                }}
                            />
                        </Box>
                    </Grid>

                    {conditional === 0 && (
                        <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '80px' }}>
                                <Typography>ㅤ</Typography>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        height: '40px',
                                        backgroundColor: '#00263A',
                                        color: '#ffffff',
                                        '&:hover': {
                                            backgroundColor: '#002244',
                                        },
                                    }}
                                    onClick={handleClickOpen}
                                >
                                    <Typography sx={{ p: 0.2, fontWeight: 'bold', fontSize: '12px' }}>
                                        Generar solicitud
                                    </Typography>
                                    <Iconify icon="pajamas:doc-symlink" width={24} />
                                </Button>
                            </Box>
                        </Grid>
                    )}

                </Grid>



            </Stack>
        </>
    );

    return (
        <>
            <FormProvider methods={methods} onSubmit={onSubmit}>
                <Card sx={ conditional === 1 ? { 
                    backgroundColor: '#F2EEE3',
                    boxShadow: 'none'
                } : {
                    backgroundColor: '#F2EEE3',
                    backgroundImage: `url(${import.meta.env.BASE_URL}assets/icons/glass/shape-square.svg)`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    height: {
                        xl: 500,
                    },
                    filter: '#BAA36B',
                }}>
                    <Grid container
                        className="fade-in"
                        spacing={0}
                        sx={conditional === 1 ?{}
                            :
                            {p: .05,
                                borderRadius: '20px',
                                margin: '20px',}}>
                        <Grid item xs={12}>
                            {render}
                        </Grid>
                    </Grid>
                </Card>
            </FormProvider>

            <Dialog
                fullWidth='lg'
                open={open}
                PaperProps={{
                    sx: { maxWidth: 720, },
                }}
            >
                <IconButton
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 10,
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <Request FirstDay={FirstDay} dateNext={dateNext} onClose={handleClose} />
            </Dialog>
        </>
    );
}

Simulator.propTypes = {
    conditional: PropTypes.any
};
