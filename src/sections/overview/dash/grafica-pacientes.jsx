import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { alpha, useTheme } from '@mui/material/styles';

import { endpoints } from 'src/utils/axios';
import { fPercent } from 'src/utils/format-number';

import { bgGradient } from 'src/theme/css';
import { usePostGeneral } from 'src/api/general';

import Chart, { useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

export default function GraficaPacientes({
  title,
  percent,
  color = 'primary',
  sx,
  rol,
  id,
  ...other
}) {
  const theme = useTheme();

  const [val, setVal] = useState({
    idRol: rol,
    espe: id,
  });

  useEffect(() => {
    setVal({
      idRol: rol,
      espe: id,
    });
  }, [id, rol]);

  const { pacientesData } = usePostGeneral(val, endpoints.dashboard.getCountPacientes, "pacientesData");

  const _1 = pacientesData.flatMap((est) => (est.enero));
  const _2 = pacientesData.flatMap((est) => (est.febrero));
  const _3 = pacientesData.flatMap((est) => (est.marzo));
  const _4 = pacientesData.flatMap((est) => (est.abril));
  const _5 = pacientesData.flatMap((est) => (est.mayo));
  const _6 = pacientesData.flatMap((est) => (est.junio));
  const _7 = pacientesData.flatMap((est) => (est.julio));
  const _8 = pacientesData.flatMap((est) => (est.agosto));
  const _9 = pacientesData.flatMap((est) => (est.septiembre));
  const _10 = pacientesData.flatMap((est) => (est.octubre));
  const _11 = pacientesData.flatMap((est) => (est.noviembre));
  const _12 = pacientesData.flatMap((est) => (est.diciembre));

  const total= pacientesData.flatMap((est) => (est.total));

  const chart={
    series: [
      { x: 'Enero', y: _1 },
      { x: 'Febrero', y: _2 },
      { x: 'Marzo', y: _3 },
      { x: 'Abril', y: _4 },
      { x: 'Mayo', y: _5 },
      { x: 'Junio', y: _6 },
      { x: 'Julio', y: _7 },
      { x: 'Agosto', y: _8 },
      { x: 'Septiembre', y: _9 },
      { x: 'Octubre', y: _10 },
      { x: 'Noviembre', y: _11 },
      { x: 'Diciembre', y: _12 },
    ],
  };

  const {
    colors = [theme.palette[color].main, theme.palette[color].dark],
    series,
    options,
  } = chart;

  const chartOptions = useChart({
    colors: [colors[1]],
    fill: {
      type: 'gradient',
      gradient: {
        colorStops: [
          { offset: 0, color: colors[0], opacity: 1 },
          { offset: 100, color: colors[1], opacity: 1 },
        ],
      },
    },
    chart: {
      sparkline: {
        enabled: true,
      },
    },
    xaxis: {
      labels: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        show: false,
      },
    },
    stroke: {
      width: 4,
    },
    legend: {
      show: false,
    },
    grid: {
      show: false,
    },
    tooltip: {
      marker: {
        show: false,
      },
      y: {
        formatter: (value) => (value),
        title: {
          formatter: () => '',
        },
      },
    },
    ...options,
  });

  return (
    <Stack
      sx={{
        ...bgGradient({
          direction: '195deg',
          startColor: alpha(theme.palette[color].light, 0.2),
          endColor: alpha(theme.palette[color].main, 0.2),
        }),
        p: 3,
        borderRadius: 2,
        color: `${color}.darker`,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: 'common.white',
        ...sx,
      }}
      {...other}
    >
      <Stack direction="row" sx={{ mb: 1 }}>
        <div>
          <Box sx={{ mb: 1, typography: 'subtitle2' }}>{title}</Box>
          <Box sx={{ typography: 'h3' }}>{(total)}</Box>
        </div>

        <div>
          <Stack spacing={1}
          direction="row"
          flexWrap="wrap"
          alignItems="center"
          sx={{ typography: 'body2' }}>

            <Box sx={{ typography: 'subtitle2' }}>
              {percent > 0 && '+'}
              {fPercent(percent)}
            </Box>
          </Stack>

        </div>
      </Stack>

      <Chart
        dir="ltr"
        type="line"
        series={[{ data: series }]}
        options={chartOptions}
        width="100%"
        height={50}
      />
    </Stack>
  );
}

GraficaPacientes.propTypes = {
  color: PropTypes.string,
  percent: PropTypes.number,
  sx: PropTypes.object,
  title: PropTypes.string,
  rol: PropTypes.any,
  id: PropTypes.any,
};
