import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { styled, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

import { endpoints } from 'src/utils/axios';
import { fNumber } from 'src/utils/format-number';

import { useGetGeneral, usePostGeneral } from 'src/api/general';

import Chart, { useChart } from 'src/components/chart';
import EmptyContent from 'src/components/empty-content/empty-content';

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
    top: `calc(${CHART_HEIGHT - LEGEND_HEIGHT}px) !important`,
  },
}));

export default function AnalyticsConversionRates({ title, subheader, beneficios, ...other }) {
  const theme = useTheme();

  const { depaData } = useGetGeneral(endpoints.dashboard.getDepartamentos, "depaData");

  const [tit, setTit] = useState('departamentos');

  const handleChangeArea = useCallback(
    (event) => {
      setAreas(event.target.value);
    },
    []
  );

  const handleChangeDepa = useCallback(
    (event) => {
      setDepa(event.target.value);
      setAr(0);
      setPuestos(0);
      setTit('departamentos');
    },
    []
  );

  const handleChangeAr = useCallback(
    (event) => {
      setAr(event.target.value);
      setTit('áreas');
    },
    []
  );

  const handleChangePuestos = useCallback(
    (event) => {
      setPuestos(event.target.value);
      setTit('puestos');
    },
    []
  );

  const [areas, setAreas] = useState(585);

  const [depa, setDepa] = useState(0);

  const [ar, setAr] = useState(0);

  const [puestos, setPuestos] = useState(0);

  const [demandaValues, setDemandaValues] = useState(0);

  useEffect(() => {
    setDemandaValues({
      beneficio: areas,
      departamento: depa,
      area: ar,
      puestos,
    });
  }, [areas, depa, ar, puestos]);

  const { areaData } = usePostGeneral(depa, endpoints.dashboard.getAreas, "areaData");

  const { puestosData } = usePostGeneral(ar, endpoints.dashboard.getPuestos, "puestosData");

  const { demandaData } = usePostGeneral(demandaValues, endpoints.dashboard.getDemandaBeneficio, "demandaData");

  const chartSeries = demandaData.map((i) => i.value);

  const colors = [
    "#FF6633", "#FFB399", "#FF33FF", "#FFFF99", "#00B3E6",
    "#E6B333", "#3366E6", "#999966", "#99FF99", "#B34D4D",
    "#80B300", "#809900", "#E6B3B3", "#6680B3", "#66991A",
    "#FF99E6", "#CCFF1A", "#FF1A66", "#E6331A", "#33FFCC",
    "#66994D", "#B366CC", "#4D8000", "#B33300", "#CC80CC",
    "#66664D", "#991AFF", "#E666FF", "#4DB3FF", "#1AB399",
    "#E666B3", "#33991A", "#CC9999", "#B3B31A", "#00E680",
    "#4D8066", "#809980", "#E6FF80", "#1AFF33", "#999933",
    "#FF3380", "#CCCC00", "#66E64D", "#4D80CC", "#9900B3",
    "#E64D66", "#4DB380", "#FF4D4D", "#99E6E6", "#6666FF"
  ];

  const chartOptions = useChart({
    colors,
    tooltip: {
      marker: { show: false },
      y: {
        formatter: (value) => fNumber(value),
        title: {
          formatter: () => '',
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '45%',
        borderRadius: 2,
        distributed: true,
      },
    },
    xaxis: {
      categories: demandaData.map((i) => i.label),
    },
    legend: {
      show: false
    },
    title: {
      text: `Demanda por ${tit}`,
      offsetX: 30
    },
  });

  const chartOptionsPie = useChart({
    chart: {
      sparkline: {
        enabled: true,
      },
    },
    colors,
    labels: demandaData.map((i) => i.label),
    stroke: {
      colors: [theme.palette.background.paper],
    },
    legend: {
      show: false
    },
    dataLabels: {
      enabled: true,
      dropShadow: {
        enabled: false,
      },
    },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (value) => fNumber(value),
        title: {
          formatter: (seriesName) => `${seriesName}`,
        },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: false,
          },
        },
      },
    },
  });

  return (
    <>
      {depaData.length > 0 ? (

        <Card {...other}>

          <CardHeader title={title} subheader={subheader} />

          <Grid container spacing={2} sx={{
            p: 3, backgroundColor: theme.palette.mode === 'dark' ? '#25303d' : '#f7f7f7',
            borderRadius: '20px', margin: '20px'
          }}>
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
                  {!isEmpty(beneficios) ? (
                    beneficios.map((i, index) => (
                      <MenuItem key={index} value={i.idPuesto}>
                        {i.nombre}
                      </MenuItem>
                    ))
                  ) : (

                    <Grid style={{ paddingTop: '2%' }}>
                      <LinearProgress />
                      <Box mb={3} />
                    </Grid>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl sx={{
                width: "100%",
                pr: { xs: 1, md: 1 },
              }}>
                <InputLabel id="demo-simple-select-label">Departameto</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={depa}
                  label="Departamneto"
                  onChange={(e) => handleChangeDepa(e)}
                >
                  <MenuItem value={0}>
                    TOP 10
                  </MenuItem>
                  {!isEmpty(beneficios) ? (
                    depaData.map((i, index) => (
                      <MenuItem key={index} value={i.id}>
                        {i.departamento}
                      </MenuItem>
                    ))
                  ) : (

                    <Grid style={{ paddingTop: '2%' }}>
                      <LinearProgress />
                      <Box mb={3} />
                    </Grid>
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid md={6} xs={12}>
              <FormControl sx={{
                width: "100%",
                pr: { xs: 1, md: 1 },
              }}>
                <InputLabel id="demo-simple-select-label">Área</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="Área"
                  disabled={depa === 0}
                  onChange={(e) => handleChangeAr(e)}
                >
                  {!isEmpty(areaData) ? (
                    areaData.map((i, index) => (
                      <MenuItem key={index} value={i.id}>
                        {i.area}
                      </MenuItem>
                    ))
                  ) : (
                    <Grid style={{ paddingTop: '2%' }}>
                      <LinearProgress />
                      <Box mb={3} />
                    </Grid>
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid md={6} xs={12}>
              <FormControl sx={{
                width: "100%",
                pr: { xs: 1, md: 1 },
              }}>
                <InputLabel id="demo-simple-select-label">Puestos</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="Puestos"
                  disabled={ar === 0}
                  onChange={(e) => handleChangePuestos(e)}
                >
                  {!isEmpty(puestosData) ? (
                    puestosData.map((i, index) => (
                      <MenuItem key={index} value={i.id}>
                        {i.puesto}
                      </MenuItem>
                    ))
                  ) : (
                    <Grid style={{ paddingTop: '2%' }}>
                      <LinearProgress />
                      <Box mb={3} />
                    </Grid>
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            {!isEmpty(demandaData) ? (
              <>
                <Grid item xs={12} md={6} lg={8}>
                  <Chart
                    dir="ltr"
                    type="bar"
                    series={[{ data: chartSeries }]}
                    options={chartOptions}
                    width="100%"
                    height={300}
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  <StyledChart
                    dir="ltr"
                    type="pie"
                    series={chartSeries}
                    options={chartOptionsPie}
                    width="100%"
                    height={280}
                  />
                </Grid>
              </>
            ) : (
              <EmptyContent
                filled
                title="Sin datos"
                sx={{
                  py: 5,
                }}
              />
            )}
          </Grid>


        </Card>

      ) : (
        <Card {...other}>
          <Grid container spacing={1} sx={{ backgroundColor: "#ECECEC", animation: 'pulse 1.5s infinite', p: 5 }} justifyContent="center" alignItems="center" />
        </Card>
      )}

    </>
  );
}

AnalyticsConversionRates.propTypes = {
  subheader: PropTypes.string,
  title: PropTypes.string,
  beneficios: PropTypes.any,
};
