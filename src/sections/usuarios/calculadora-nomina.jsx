import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import { Button } from '@mui/material';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Unstable_Grid2';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import LinearProgress from '@mui/material/LinearProgress';
import InputAdornment from '@mui/material/InputAdornment';

import { fCurrency } from 'src/utils/format-number';

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

export default function CalculadoraNomina({ title, subheader, data, ...other }) {

    const theme = useTheme();

    return (
        <Card {...other}>
            {/*  <CardHeader title={title} subheader={subheader} /> */}

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
                        <InputLabel htmlFor="outlined-adornment-amount">Salario</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-amount"
                            startAdornment={<InputAdornment position="start">$</InputAdornment>}
                            label="Amount"
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
                            id="outlined-select-currency"
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
                    <FormControl
                        sx={{
                            width: '100%',
                            pr: { xs: 1, md: 1 },
                        }}
                    >
                        <Button
                            /* onClick={handleSubmit(onSubmit)} */
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
                    </FormControl>
                </Grid>

            </Grid>

            <Stack spacing={4} sx={{ px: 3, pt: 3, pb: 5 }}>
                <Diario />
                <Semanal />
                <Mensual />
                <Anual />
            </Stack>
        </Card>
    );
}

CalculadoraNomina.propTypes = {
    data: PropTypes.array,
    subheader: PropTypes.string,
    title: PropTypes.string,
};

// ----------------------------------------------------------------------

function ProgressItem({ progress }) {
    return (
        <Stack spacing={1}>
            <Stack direction="row" alignItems="center">
                <Typography sx={{ flexGrow: 1, fontSize: '18px' }}>
                    {progress.label}
                </Typography>

                <Typography sx={{ fontSize: '18px', fontWeight: 'bold' }}>{fCurrency(progress.totalAmount)}</Typography>

            </Stack>

            <LinearProgress
                variant="determinate"
                value={progress.value}
                color={
                    (progress.label === 'Total Income' && 'info') ||
                    (progress.label === 'Total Expenses' && 'warning') ||
                    'primary'
                }
                sx={{
                    height: 25,
                    borderRadius: 5,
                }}
            />
        </Stack>
    );
}

function Diario() {
    return (
        <Stack spacing={1}>
            <Stack direction="row" alignItems="center">
                <Typography sx={{ flexGrow: 1, fontSize: '18px' }}>
                    Diario
                </Typography>

                <Typography sx={{ fontSize: '18px', fontWeight: 'bold' }}>{fCurrency(50)}</Typography>

            </Stack>

            <LinearProgress
                variant="determinate"
                value={0.27}
                color='primary'
                sx={{
                    height: 25,
                    borderRadius: 5,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#00263A',
                    },
                }}
            />
        </Stack>
    );
}

function Semanal() {
    return (
        <Stack spacing={1}>
            <Stack direction="row" alignItems="center">
                <Typography sx={{ flexGrow: 1, fontSize: '18px' }}>
                    Semanal
                </Typography>

                <Typography sx={{ fontSize: '18px', fontWeight: 'bold' }}>{fCurrency(350)}</Typography>

            </Stack>

            <LinearProgress
                variant="determinate"
                value={1.92}
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

function Mensual() {
    return (
        <Stack spacing={1}>
            <Stack direction="row" alignItems="center">
                <Typography sx={{ flexGrow: 1, fontSize: '18px' }}>
                    Mensual
                </Typography>

                <Typography sx={{ fontSize: '18px', fontWeight: 'bold' }}>{fCurrency(1520)}</Typography>

            </Stack>

            <LinearProgress
                variant="determinate"
                value={8.33}
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

function Anual() {
    return (
        <Stack spacing={1}>
            <Stack direction="row" alignItems="center">
                <Typography sx={{ flexGrow: 1, fontSize: '18px' }}>
                    Anual
                </Typography>

                <Typography sx={{ fontSize: '18px', fontWeight: 'bold' }}>{fCurrency(18250)}</Typography>

            </Stack>

            <LinearProgress
                variant="determinate"
                value={100}
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

ProgressItem.propTypes = {
    progress: PropTypes.object,
};
