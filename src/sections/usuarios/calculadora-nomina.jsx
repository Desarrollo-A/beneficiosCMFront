import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { Button } from '@mui/material';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import LinearProgress from '@mui/material/LinearProgress';
import InputAdornment from '@mui/material/InputAdornment';

import { fCurrency } from 'src/utils/format-number';

import FormProvider, {
    RHFTextField,
} from 'src/components/hook-form';

// ----------------------------------------------------------------------

const currencies = [
    {
        value: 'diario',
        label: 'Diario',
    },
    {
        value: 'semanal',
        label: 'Semanal',
    },
    {
        value: 'mensual',
        label: 'Mensual',
    },
    {
        value: 'anual',
        label: 'Anual',
    },
];

export default function CalculadoraNomina() {

    const theme = useTheme();

    const [periodo, setPeriodo] = useState('diario');

    const handleChange = (event) => {
        setPeriodo(event.target.value);
    };

    const [salarioDiario, setSalarioDiario] = useState(0);

    const [salarioSemanal, setSalarioSemanal] = useState(0);

    const [salarioMensual, setSalarioMensual] = useState(0);

    const [salarioAnual, setSalarioAnual] = useState(0);

    const NewProductSchema = Yup.object().shape({
        salario: Yup.number()
            .typeError('Debe ser un número')
            .required('Ingresa un monto')
            .positive('Debe ser un número positivo'),
    });

    const defaultValues = useMemo(
        () => ({
            salario: null,
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

            if(periodo === 'diario'){
                setSalarioDiario((data.salario));
                setSalarioSemanal((data.salario * 7));
                setSalarioMensual((data.salario * 30.4));
                setSalarioAnual((data.salario * 364.8));
            }
            
            if(periodo === 'semanal'){
                setSalarioDiario((data.salario / 7));
                setSalarioSemanal((data.salario));
                setSalarioMensual(((data.salario) * (30.4/7)));
                setSalarioAnual((data.salario * ((30.4 / 7) * 12) ));
            }

            if(periodo === 'mensual'){
                setSalarioDiario((data.salario / 30.4));
                setSalarioSemanal((data.salario / (30.4/7)));
                setSalarioMensual((data.salario));
                setSalarioAnual((data.salario * 12));
            }

            if(periodo === 'anual'){
                setSalarioDiario((data.salario / 364.8));
                setSalarioSemanal((data.salario / 12)/(30.4/7));
                setSalarioMensual(data.salario / 12);
                setSalarioAnual((data.salario));
            }

        } catch (error) {
            console.error(error);
        }
    });

    return (
        <Card>

            <FormProvider methods={methods} onSubmit={onSubmit}>
                <Grid container
                    className="fade-in"
                    spacing={2}
                    sx={{
                        p: 1,
                        backgroundColor: theme.palette.mode === 'dark' ? '#25303d' : '#f7f7f7',
                        borderRadius: '10px',
                        margin: '20px',
                    }}>
                    <Grid item xs={12} md={5}>
                        <FormControl
                            sx={{
                                width: '100%',
                                pr: { xs: 1, md: 1 },
                            }}
                        >
                            <RHFTextField
                                name="salario"
                                label="Salario"
                                placeholder={0.00}
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
                            />
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={5}>
                        <FormControl
                            sx={{
                                width: '100%',
                                pr: { xs: 1, md: 1 },
                            }}
                        >
                            <TextField
                                id="periodo"
                                name='periodo'
                                onChange={handleChange}
                                select
                                defaultValue="diario"
                            >
                                {currencies.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={2} >
                            <Button
                                onClick={handleSubmit(onSubmit)}
                                variant="contained"
                                fullWidth
                                sx={{
                                    height: '55px',
                                    backgroundColor: '#00263A',
                                    color: '#ffffff',
                                    '&:hover': {
                                        backgroundColor: '#002244',
                                    },
                                }}
                            >
                                Calcular
                            </Button>
                    </Grid>

                </Grid>
            </FormProvider>

            <Stack spacing={4} sx={{ px: 3, pt: 3, pb: 5 }}>
                <Diario salarioDiario={salarioDiario} />
                <Semanal salarioSemanal={salarioSemanal} />
                <Mensual salarioMensual={salarioMensual} />
                <Anual salarioAnual={salarioAnual} />
            </Stack>
        </Card>
    );
}

// ----------------------------------------------------------------------

function Diario({ salarioDiario }) {
    return (
        <Stack spacing={1}>
            <Stack direction="row" alignItems="center">
                <Typography sx={{ flexGrow: 1, fontSize: '18px' }}>
                    Diario
                </Typography>

                <Typography sx={{ fontSize: '18px', fontWeight: 'bold' }}>{fCurrency(salarioDiario)}</Typography>

            </Stack>

            <LinearProgress
                variant="determinate"
                value={salarioDiario !== 0 ? 10 : 0}
                color='primary'
                sx={{
                    height: 25,
                    borderRadius: 5,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: '#00A0F4',
                    },
                }}
            />
        </Stack>
    );
}
Diario.propTypes = {
    salarioDiario: PropTypes.number,
};

function Semanal({ salarioSemanal }) {
    return (
        <Stack spacing={1}>
            <Stack direction="row" alignItems="center">
                <Typography sx={{ flexGrow: 1, fontSize: '18px' }}>
                    Semanal
                </Typography>

                <Typography sx={{ fontSize: '18px', fontWeight: 'bold' }}>{fCurrency(salarioSemanal)}</Typography>

            </Stack>

            <LinearProgress
                variant="determinate"
                value={salarioSemanal !== 0 ? 25 : 0}
                sx={{
                    height: 25,
                    borderRadius: 5,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: '#FDDC83',
                    },
                }}
            />
        </Stack>
    );
}
Semanal.propTypes = {
    salarioSemanal: PropTypes.number,
};

function Mensual({ salarioMensual }) {
    return (
        <Stack spacing={1}>
            <Stack direction="row" alignItems="center">
                <Typography sx={{ flexGrow: 1, fontSize: '18px' }}>
                    Mensual
                </Typography>

                <Typography sx={{ fontSize: '18px', fontWeight: 'bold' }}>{fCurrency(salarioMensual)}</Typography>

            </Stack>

            <LinearProgress
                variant="determinate"
                value={salarioMensual !== 0 ? 55 : 0}
                sx={{
                    height: 25,
                    borderRadius: 5,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: '#5BE49B',
                    },
                }}
            />
        </Stack>
    );
}
Mensual.propTypes = {
    salarioMensual: PropTypes.number,
};

function Anual({ salarioAnual }) {
    return (
        <Stack spacing={1}>
            <Stack direction="row" alignItems="center">
                <Typography sx={{ flexGrow: 1, fontSize: '18px' }}>
                    Anual
                </Typography>

                <Typography sx={{ fontSize: '18px', fontWeight: 'bold' }}>{fCurrency(salarioAnual)}</Typography>

            </Stack>

            <LinearProgress
                variant="determinate"
                value={salarioAnual !== 0 ? 100 : 0}
                sx={{
                    height: 25,
                    borderRadius: 5,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: '#C481FF',
                    },
                }}
            />
        </Stack>
    );
}
Anual.propTypes = {
    salarioAnual: PropTypes.number,
};
