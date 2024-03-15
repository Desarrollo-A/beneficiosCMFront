import PropTypes from 'prop-types';
import { es } from 'date-fns/locale';
import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Select from '@mui/material/Select';
import { styled } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { endpoints } from 'src/utils/axios';
import { fNumber } from 'src/utils/format-number';

import { usePostGeneral } from 'src/api/general';
import { useGetEspecialistasPorArea } from 'src/api/especialistas';

import Chart, { useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

const CHART_HEIGHT = 400;

const LEGEND_HEIGHT = 72;

const StyledChart = styled(Chart)(({ theme }) => ({
  height: CHART_HEIGHT,
  '& .apexcharts-canvas, .apexcharts-inner, svg, foreignObject': {
    height: `100% !important`,
  },
  '& .apexcharts-legend': {
    height: LEGEND_HEIGHT,
    borderTop: `dashed 1px ${theme.palette.divider}`,
    top: `calc(${CHART_HEIGHT - LEGEND_HEIGHT}px) !important`,
  },
}));

// ----------------------------------------------------------------------

export default function GraficaModalidad({ 
  title,
  subheader, 
  total, 
  chart, 
  beneficios, 
  diaUnoMes,
  ultimoDiaMes,
  datePikerI,
  datePikerF,
  rol,
  puesto,
  id,
  ...other }) {

  const [areas, setAreas] = useState(rol === 3 ? puesto : 158);

  const [_es, set_es] = useState(rol === 3 ? id : '0');

  const [fechaI, setFechaI] = useState(diaUnoMes);

  const [fechaF, setFechaF] = useState(ultimoDiaMes);

  const fhI = new Date(fechaI);

  const fhF = new Date(fechaF);

  const [val, setVal] = useState({
    area: areas,
    espe: _es,
    fhI: fechaI,
    fhF: fechaF
  });

  useEffect(() => {
    setVal({
      area: areas,
      espe: _es,
      fhI: fechaI,
      fhF: fechaF
    });
  }, [areas, _es, fechaI, fechaF]);

  const { modalidadData } = usePostGeneral(val, endpoints.dashboard.getCountModalidades, "modalidadData");

  const { especialistas } = useGetEspecialistasPorArea({ areas });

  const _pre = modalidadData.flatMap((est) => (est.presencial));

  const _vir = modalidadData.flatMap((est) => (est.virtual));

  const tot = parseInt(_pre, 10) + parseInt(_vir, 10);

  const pre = ((_pre * 100) / tot).toFixed(0);

  const vir = ((_vir * 100) / tot).toFixed(0);

  const countMod = [ pre, vir ];

  const handleChangeArea = useCallback(
    (event) => {
      setAreas(event.target.value);
    },
    []
  );

  const handleChangeEsp = useCallback(
    (event) => {
      set_es(event.target.value);
    },
    []
  );

  const handleFilterStartDate = useCallback(
    (newValue) => {
      const date = new Date(newValue);
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      setFechaI(formattedDate);
    },
    []
  );

  const handleFilterEndDate = useCallback(
    (newValue) => {
      const date = new Date(newValue);
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      setFechaF(formattedDate);
    },
    []
  );

  const {
    colors = [
      ['#6620D1'],
      ['#9EE351'],
    ],
    series,
    options,
  } = chart;

  const chartOptions = useChart({
    colors: colors.map((colr) => colr[0]),
    chart: {
      sparkline: {
        enabled: true,
      },
    },
    labels: series.map((i) => i.label),
    legend: {
      floating: true,
      position: 'bottom',
      horizontalAlign: 'center',
    },
    plotOptions: {
      radialBar: {
        hollow: { size: '38%' },
        dataLabels: {
          value: { offsetY: 16 },
          total: {
            text:`${tot}`,
            formatter: () => fNumber(tot),
          },
        },
      },
    },
    ...options,
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb:0 }} />

      <Grid container spacing={2} sx={{ p: 3 }}>

      {rol !== 3 ?(
        <>
        <Grid md={6} xs={12}>
          <FormControl sx={{
            width: "100%",
            pr: { xs: 1, md: 1 },
          }}>
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

        <Grid md={6} xs={12}>
          <FormControl sx={{
            width: "100%",
            pr: { xs: 1, md: 1 },
          }}>
            <InputLabel id="demo-simple-select-label">Especialista</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={_es}
              label="Especialista"
              onChange={(e) => handleChangeEsp(e)}
            >
              <MenuItem value='0'>
                Todos
              </MenuItem>
              {especialistas.map((i, index) => (
                <MenuItem key={index} value={i.idUsuario}>
                  {i.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        </>
        
      ):(
        null
      )}

        <Grid md={6} xs={12}>
          <FormControl sx={{
            width: "100%",
            pr: { xs: 1, md: 1 },
          }}>
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

        <Grid md={6} xs={12}>
          <FormControl sx={{
            width: "100%",
            pr: { xs: 1, md: 1 },
          }}>
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

      <StyledChart
        dir="ltr"
        type="radialBar"
        series={countMod}
        options={chartOptions}
        width="100%"
        height={300}
      />
    </Card>
  );
}

GraficaModalidad.propTypes = {
  chart: PropTypes.object,
  subheader: PropTypes.string,
  title: PropTypes.string,
  total: PropTypes.number,
  beneficios: PropTypes.any,
  diaUnoMes: PropTypes.any,
  ultimoDiaMes: PropTypes.any,
  datePikerI: PropTypes.any,
  datePikerF: PropTypes.any,
  rol: PropTypes.any,
  puesto: PropTypes.any,
  id: PropTypes.any,
};
