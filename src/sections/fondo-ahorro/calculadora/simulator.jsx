/* eslint-disable import/no-cycle */
import dayjs from 'dayjs';
import * as Yup from 'yup';
import moment from 'moment';
import { mutate } from 'swr';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import { Button, IconButton } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import InputAdornment from '@mui/material/InputAdornment';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';
import { fCurrencyII } from 'src/utils/format-number';

import { useAuthContext } from 'src/auth/hooks';
import { usePostGeneral } from 'src/api/general';
import { cancelarFondoAhorro } from 'src/api/fondoAhorro/legalario';

import Iconify from 'src/components/iconify/iconify';
import { useSnackbar } from 'src/components/snackbar';
import Chart, { useChart } from 'src/components/chart';
import { ConfirmDialog } from 'src/components/custom-dialog';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import Request from './request';
// ----------------------------------------------------------------------

export default function Simulator({ conditional }) {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const confirm = useBoolean();

  const isMobile = useMediaQuery('(max-width: 960px)');

  const { fondoData } = usePostGeneral(
    user?.idContrato,
    endpoints.fondoAhorro.getFondo,
    'fondoData'
  );

  const [FirstDay, setFirstDay] = useState('');
  const [dateNext, setdateNext] = useState('');
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [montoAhorro, setMontoAhorro] = useState('');
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleMontoChange = (precio) => {
    const numericValue = precio.replace(/[^0-9.]/g, '');
    const formattedValue = fCurrencyII(numericValue);
    setMontoAhorro(formattedValue);
    methods.setValue("ahorro", numericValue);
  };;

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
      .min(500.0, 'Debe ser mayor o igual a $500') 
      .max(10000.0, 'Debe ser menor o igual a $10,000'), 
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

  const { handleSubmit } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
  
      const ahorroFormateado = fCurrencyII(data.ahorro);
      
      // Retención semanal
      setRtSemanal(((data.ahorro / 30.4) * 7).toFixed(2));
  
      // Inversión mensual
      setInvMensual(ahorroFormateado);
  
      // Inversión anual
      setInvAnual(fCurrencyII(data.ahorro * 12));
  
      // Rendimiento de inversión
      setRenInv(ahorroFormateado);
  
      // Inversión + rendimiento
      setInvRen(fCurrencyII(data.ahorro * 12 + data.ahorro));
    } catch (error) {
      console.error(error);
    }
  });
  const handleCancelarFondoAhorro = async () => {
    setIsLoading(true);
    const cancelRes = await cancelarFondoAhorro(fondoData[0]?.idFondo);
    enqueueSnackbar(cancelRes?.msg, {
      variant: cancelRes.result ? 'success' : 'error',
    });
    setIsLoading(false);
    confirm.onFalse();
    mutate(endpoints.fondoAhorro.getFondo);
  };

  const chart = {
    series: 76,
  };

  const theme = useTheme();

  const { options } = chart;

  const inicioMensualidad = moment(fondoData[0]?.fechaInicio ? fondoData[0]?.fechaInicio : 0);
  const FinMensualidad = moment(fondoData[0]?.fechaFin ? fondoData[0]?.fechaFin : 0);

  const diferienciaMensualidad = FinMensualidad.diff(inicioMensualidad, 'months');

  const porcentaje = 1.2 * (12 - diferienciaMensualidad) * 10;

  const chartOptions = useChart({
    chart: {
      offsetY: -50,
      sparkline: {
        enabled: true,
      },
    },
    grid: {
      padding: {
        bottom: 0,
      },
    },
    legend: {
      show: false,
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        track: {
          background: '#B0B0B0',
          strokeWidth: '60%',
        },
        hollow: {
          size: '65%',
        },
        dataLabels: {
          name: {
            offsetY: 18,
          },
          value: {
            offsetY: -30, // Ajusta más el desplazamiento vertical
            fontSize: '38px',
            fontWeight: 'bold',
          },
          total: {
            label: `Ahorro actual ${(fondoData[0]?.monto ?? 0) * (12 - diferienciaMensualidad)}`,
            color: theme.palette.text.disabled,
            fontSize: theme.typography.body1.fontSize,
            fontWeight: theme.typography.body1.fontWeight,
          },
        },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        colorStops: [
          { offset: 10, color: '#BAA36B', opacity: 1 },
          { offset: 100, color: '#BAA36B', opacity: 1 },
        ],
      },
    },
    ...options,
  });

  const calculadora = (
    <>
      {conditional === 0 && (
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
         value={montoAhorro} 
         onChange={(e) => handleMontoChange(e.target.value)} 
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
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '80px',
              }}
            >
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
                      <Box component="span">{FirstDay}</Box>
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
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '80px',
              }}
            >
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
                      <Box component="span">{dateNext}</Box>
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
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '80px',
              }}
            >
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
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '80px',
              }}
            >
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
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '80px',
              }}
            >
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
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '80px',
              }}
            >
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
          <Grid
            item
            xs={12}
            md={
              conditional === 1 || !isEmpty(fondoData) || fondoData[0]?.estatusFondo === 6 ? 6 : 4
            }
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '80px',
              }}
            >
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

          <Grid
            item
            xs={12}
            md={
              conditional === 1 || !isEmpty(fondoData) || fondoData[0]?.estatusFondo === 6 ? 6 : 4
            }
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '80px',
              }}
            >
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

          {conditional === 0 && (isEmpty(fondoData) || fondoData[0]?.estatusFondo === 6) && (
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '80px',
                }}
              >
                <Typography sx={{ mb: 0, fontWeight: 'bold', color: 'black', fontSize: '13px' }}>
                  ㅤ
                </Typography>
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

  const miAhorro = (
    <>
      {conditional === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h4" sx={{ p: 3, fontWeight: 'bold', color: 'black' }}>
            Tu ahorro
          </Typography>
          <Typography variant="body1" sx={{ p: 4, textAlign: 'right' }}>
            mensualidad <span style={{ fontWeight: 'bold' }}>{12 - diferienciaMensualidad}</span> de{' '}
            <span style={{ fontWeight: 'bold' }}>12</span>
          </Typography>
        </Box>
      )}

      <Stack>
        <Grid container>
          <Grid item xs={12} md={12}>
            <Box sx={{ marginBottom: isMobile ? -3 : -6 }}>
              <Chart
                dir="ltr"
                type="radialBar"
                series={[porcentaje]}
                options={chartOptions}
                width="100%"
                height={400}
              />
            </Box>
            <Box component="ul" sx={{ paddingTop: 0, p: 3 }}>
              <Box
                component="li"
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: 2,
                }}
              >
                <Box sx={{ width: 24, height: 24, flexShrink: 0, marginRight: 1 }}>
                  <Iconify
                    icon="ph:arrow-right-duotone"
                    width="100%"
                    height="100%"
                    sx={{ color: '#00263A' }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Typography variant="body1" sx={{ textAlign: 'justify', flexGrow: 1 }}>
                    Retención semanal
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                    ${(fondoData[0]?.monto ?? 0) / 4}
                  </Typography>
                </Box>
              </Box>

              <Box
                component="li"
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: 2,
                }}
              >
                <Box sx={{ width: 24, height: 24, flexShrink: 0, marginRight: 1 }}>
                  <Iconify
                    icon="ph:arrow-right-duotone"
                    width="100%"
                    height="100%"
                    sx={{ color: '#00263A' }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Typography variant="body1" sx={{ textAlign: 'justify', flexGrow: 1 }}>
                    Inversión mensual
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                    ${fondoData[0]?.monto}
                  </Typography>
                </Box>
              </Box>

              <Box
                component="li"
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: 2,
                }}
              >
                <Box sx={{ width: 24, height: 24, flexShrink: 0, marginRight: 1 }}>
                  <Iconify
                    icon="ph:arrow-right-duotone"
                    width="100%"
                    height="100%"
                    sx={{ color: '#00263A' }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Typography variant="body1" sx={{ textAlign: 'justify', flexGrow: 1 }}>
                    Inversión anual
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                    ${(fondoData[0]?.monto ?? 0) * 12}
                  </Typography>
                </Box>
              </Box>
              <Box
                component="li"
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: 2,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: '#00263A',
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: '#002244',
                      },
                      width: isMobile ? '100%' : '40%',
                    }}
                    onClick={() => {
                      confirm.onTrue();
                    }}
                  >
                    <Typography sx={{ p: 0.2, fontWeight: 'bold', fontSize: '12px' }}>
                      Cancelar ahorro
                    </Typography>
                    <Iconify icon="mdi:cancel-outline" width={24} />
                  </Button>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Stack>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        content={<Typography>¿Estás seguro de cancelar tu fondo de ahorro?</Typography>}
        action={
          <>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                confirm.onFalse();
              }}
            >
              Cancelar
            </Button>
            <LoadingButton
              variant="contained"
              color="success"
              onClick={() => handleCancelarFondoAhorro()}
              loading={isLoading}
            >
              Aceptar
            </LoadingButton>
          </>
        }
      />
    </>
  );

  return (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Card
          sx={
            conditional === 1
              ? {
                  backgroundColor: '#F2EEE3',
                  boxShadow: 'none',
                }
              : {
                  backgroundColor: '#F2EEE3',
                  backgroundImage: `url(${import.meta.env.BASE_URL}assets/icons/glass/shape-square.svg)`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                  height: {
                    xl: 500,
                  },
                  filter: '#BAA36B',
                }
          }
        >
          <Grid
            container
            className="fade-in"
            spacing={0}
            sx={
              conditional === 1
                ? {}
                : {
                    p: 0.05,
                    borderRadius: '20px',
                    margin: '20px',
                  }
            }
          >
            {fondoData[0]?.estatusFondo === 4 || fondoData[0]?.estatusFondo === 5 ? (
              <Grid item xs={12}>
                {miAhorro}
              </Grid>
            ) : (
              <Grid item xs={12}>
                {calculadora}
              </Grid>
            )}
          </Grid>
        </Card>
      </FormProvider>

      <Dialog
        fullWidth="lg"
        open={open}
        PaperProps={{
          sx: { maxWidth: 720 },
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
  conditional: PropTypes.any,
};
