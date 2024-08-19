import PropTypes from 'prop-types';
import { es } from 'date-fns/locale';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useResponsive } from 'src/hooks/use-responsive';

import { endpoints } from 'src/utils/axios';

import { useGetGeneral, usePostGeneral } from 'src/api/general';
import { useGetEspecialistasPorArea } from 'src/api/especialistas';

import Chart, { useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

export default function GraficaEstatusCitas({
  title,
  subheader,
  beneficios,
  diaUnoMes,
  ultimoDiaMes,
  datePikerI,
  datePikerF,
  rol,
  puesto,
  id,
  ...other
}) {
  const theme = useTheme();

  const [fechaI, setFechaI] = useState(diaUnoMes);

  const [fechaF, setFechaF] = useState(ultimoDiaMes);

  const fhI = new Date(fechaI);

  const fhF = new Date(fechaF);

  const [areas, setAreas] = useState(rol === 3 ? puesto : 585);

  const [_es, set_es] = useState(rol === 3 ? id : '0');

  const [_usr, set_usr] = useState(2);

  const [val, setVal] = useState({
    area: areas,
    espe: _es,
    fhI: fhI.setDate(fhI.getDate() + 1),
    fhF: fechaF,
    usuario: _usr,
  });

  const { especialistas } = useGetEspecialistasPorArea({ areas });

  const { estatusCitasData } = useGetGeneral(
    endpoints.dashboard.getEstatusCitas,
    'estatusCitasData'
  );

  const { countEstCitasData } = usePostGeneral(
    val,
    endpoints.dashboard.getCountEstatusCitas,
    'countEstCitasData'
  );

  useEffect(() => {
    setVal({
      area: areas,
      espe: _es,
      fhI: fechaI,
      fhF: fechaF,
      usuario: _usr,
    });
  }, [areas, _es, fechaI, fechaF, _usr]);

  const handleFilterStartDate = useCallback((newValue) => {
    const date = new Date(newValue);
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    setFechaI(formattedDate);
  }, []);

  const handleFilterEndDate = useCallback((newValue) => {
    const date = new Date(newValue);
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    setFechaF(formattedDate);
  }, []);

  const handleChangeArea = useCallback((event) => {
    setAreas(event.target.value);
  }, []);

  const handleChangeEsp = useCallback((event) => {
    set_es(event.target.value);
  }, []);

  const handleChangeUsr = useCallback((event) => {
    set_usr(event.target.value);
  }, []);

  const _estNom = estatusCitasData.flatMap((est) => est.nombre);

  const _estColor = estatusCitasData.flatMap((est) => est.color);

  const _1 = countEstCitasData.flatMap((est) => est.asistir);
  const _2 = countEstCitasData.flatMap((est) => est.cancelada);
  const _3 = countEstCitasData.flatMap((est) => est.penalizada);
  const _4 = countEstCitasData.flatMap((est) => est.asistencia);
  const _5 = countEstCitasData.flatMap((est) => est.justificada);
  const _6 = countEstCitasData.flatMap((est) => est.pendiente);
  const _7 = countEstCitasData.flatMap((est) => est.procesandoPago);

  const citas = countEstCitasData.flatMap((est) => est.citas);

  const countEstCt = [_1, _2, _3, _4, _5, _6, _7];

  const smUp = useResponsive('up', 'sm');

  const chartOptions = useChart({
    _estColor,
    colors: _estColor,
    labels: _estNom,
    stroke: {
      colors: ['#fff'],
    },
    fill: {
      opacity: 0.9,
    },
    legend: {
      position: 'right',
      itemMargin: {
        horizontal: 0,
        vertical: 1,
      },
    },
    tooltip: {
      fillSeriesColor: false,
    },
    yaxis: {
      show: true,
      logBase: 10,
      tickAmount: 1,
      min: 0,
    },
    responsive: [
      {
        breakpoint: theme.breakpoints.values.sm,
        options: {
          legend: {
            position: 'bottom',
            horizontalAlign: 'left',
          },
        },
      },
    ],
  });

  return (
    <Card {...other}>
      {countEstCitasData.length > 0 ? (
        <>
          <CardHeader title={title} subheader={subheader} />
          <Grid
            container
            spacing={2}
            className="fade-in"
            sx={{
              p: 3,
              backgroundColor: theme.palette.mode === 'dark' ? '#25303d' : '#f7f7f7',
              borderRadius: '20px',
              margin: '20px',
            }}
          >
            <Grid item md={12} xs={12}>
              <FormControl
                sx={{
                  width: '100%',
                  pr: { xs: 1, md: 1 },
                }}
              >
                <InputLabel id="demo-simple-select-label">Tipo de usuario</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={_usr}
                  label="Tipo de usuario"
                  onChange={(e) => handleChangeUsr(e)}
                >
                  <MenuItem value={2}>Todos</MenuItem>
                  <MenuItem value={0}>Colaborador</MenuItem>
                  <MenuItem value={1}>Externo</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {rol !== 3 ? (
              <>
                <Grid item md={6} xs={12}>
                  <FormControl
                    sx={{
                      width: '100%',
                      pr: { xs: 1, md: 1 },
                    }}
                  >
                    <InputLabel id="demo-simple-select-label">Beneficio</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={!areas ? '' : areas}
                      label="Beneficio"
                      onChange={(e) => handleChangeArea(e)}
                    >
                      {beneficios.map((i, index) => (
                        <MenuItem key={index} value={i.idPuesto}>
                          {i.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item md={6} xs={12}>
                  <FormControl
                    sx={{
                      width: '100%',
                      pr: { xs: 1, md: 1 },
                    }}
                  >
                    <InputLabel id="demo-simple-select-label">Especialista</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={_es}
                      label="Especialista"
                      onChange={(e) => handleChangeEsp(e)}
                    >
                      <MenuItem value="0">Todos</MenuItem>
                      {especialistas.map((i, index) => (
                        <MenuItem key={index} value={i.idUsuario}>
                          {i.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            ) : null}

            <Grid item md={6} xs={12}>
              <FormControl
                sx={{
                  width: '100%',
                  pr: { xs: 1, md: 1 },
                }}
              >
                <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Fecha inicio"
                    value={datePikerI()}
                    maxDate={fhF.setDate(fhF.getDate() + 1)}
                    onChange={handleFilterStartDate}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                      },
                    }}
                  />
                </LocalizationProvider>
              </FormControl>
            </Grid>

            <Grid item md={6} xs={12}>
              <FormControl
                sx={{
                  width: '100%',
                  pr: { xs: 1, md: 1 },
                }}
              >
                <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Fecha fin"
                    minDate={fhI}
                    value={datePikerF()}
                    onChange={handleFilterEndDate}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </FormControl>
            </Grid>
          </Grid>

          <Box
            sx={{
              my: 5,
              '& .apexcharts-legend': {
                m: 'auto',
                height: { sm: 150 },
                flexWrap: { sm: 'wrap' },
                width: { xs: 240, sm: '30%' },
              },
              '& .apexcharts-datalabels-group': {
                display: 'none',
              },
            }}
          >
            <Chart
              dir="ltr"
              type="polarArea"
              series={countEstCt}
              options={chartOptions}
              width="100%"
              height={smUp ? 470 : 480}
            />
          </Box>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <Box
            display="grid"
            gridTemplateColumns="repeat(2, 1fr)"
            sx={{ textAlign: 'center', typography: 'h4' }}
          >
            <Stack sx={{ py: 0, borderRight: `dashed 1px ${theme.palette.divider}` }}>
              <Box component="span" sx={{ mb: 0, typography: 'body2', color: 'text.secondary' }}>
                Estatus
              </Box>
              {estatusCitasData.length}
            </Stack>

            <Stack sx={{ py: 1 }}>
              <Box component="span" sx={{ mb: 0, typography: 'body2', color: 'text.secondary' }}>
                Total
              </Box>
              {citas}
            </Stack>
          </Box>
        </>
      ) : (
        <Grid
          container
          spacing={1}
          sx={{ backgroundColor: '#ECECEC', animation: 'pulse 1.5s infinite', p: 5 }}
          justifyContent="center"
          alignItems="center"
        />
      )}
    </Card>
  );
}

GraficaEstatusCitas.propTypes = {
  subheader: PropTypes.string,
  title: PropTypes.string,
  beneficios: PropTypes.any,
  diaUnoMes: PropTypes.any,
  ultimoDiaMes: PropTypes.any,
  datePikerI: PropTypes.any,
  datePikerF: PropTypes.any,
  rol: PropTypes.any,
  puesto: PropTypes.any,
  id: PropTypes.any,
};
