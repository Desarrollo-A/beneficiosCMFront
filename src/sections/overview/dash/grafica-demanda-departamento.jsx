import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import { fNumber } from 'src/utils/format-number';
import { endpoints } from 'src/utils/axios';

import { useGetGeneral, usePostGeneral } from 'src/api/general';
import { useGetEspecialistasPorArea } from 'src/api/especialistas';

import Chart, { useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

export default function AnalyticsConversionRates({ title, subheader, chart, beneficios, ...other }) {
  const { colors, series, options } = chart;

  const { depaData } = useGetGeneral(endpoints.gestor.getDepartamentos, "depaData");

  const handleChangeArea = useCallback(
    (event) => {
      setAreas(event.target.value);
    },
    []
  );

  const handleChangeDepa = useCallback(
    (event) => {
      setDepa(event.target.value);
    },
    []
  );

  const handleChangeAr = useCallback(
    (event) => {
      setAr(event.target.value);
    },
    []
  );

  const handleChangePuestos = useCallback(
    (event) => {
      setPuestos(event.target.value);
    },
    []
  );

  const [areas, setAreas] = useState(158);

  const [depa, setDepa] = useState(0);

  const [ar, setAr] = useState(0);

  const [puestos, setPuestos] = useState(0);

  const { areaData } = usePostGeneral(depa, endpoints.gestor.getAreasPs, "areaData");

  const { puestosData } = usePostGeneral(ar, endpoints.gestor.getPuestos, "puestosData");

  console.log(puestosData)

  const chartSeries = series.map((i) => i.value);

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
        barHeight: '28%',
        borderRadius: 2,
      },
    },
    xaxis: {
      categories: series.map((i) => i.label),
    },
    ...options,
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Grid container spacing={2} sx={{ p: 3 }}>
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
            <InputLabel id="demo-simple-select-label">Departamneto</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Departamneto"
              onChange={(e) => handleChangeDepa(e)}
            >
              {depaData.map((i, index) => (
                <MenuItem key={index} value={i.id}>
                  {i.departamento}
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
            <InputLabel id="demo-simple-select-label">Área</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Área"
              onChange={(e) => handleChangeAr(e)}
            >
              {areaData.map((i, index) => (
                <MenuItem key={index} value={i.id}>
                  {i.area}
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
            <InputLabel id="demo-simple-select-label">Puestos</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Puestos"
              onChange={(e) => handleChangePuestos(e)}
            >
              {puestosData.map((i, index) => (
                <MenuItem key={index} value={i.id}>
                  {i.puesto}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box sx={{ mx: 3 }}>
        <Chart
          dir="ltr"
          type="bar"
          series={[{ data: chartSeries }]}
          options={chartOptions}
          width="100%"
          height={364}
        />
      </Box>
    </Card>
  );
}

AnalyticsConversionRates.propTypes = {
  chart: PropTypes.object,
  subheader: PropTypes.string,
  title: PropTypes.string,
  beneficios: PropTypes.any,
};
