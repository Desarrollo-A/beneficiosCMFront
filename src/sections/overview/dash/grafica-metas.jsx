import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { alpha, useTheme } from '@mui/material/styles';

import { fNumber } from 'src/utils/format-number';

import { useGetMeta } from 'src/api/especialistas';

import Chart, { useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

export default function GraficaMetas({ id }) {
  const theme = useTheme();

  const currentMonth = new Date().getMonth() + 1;

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const handleChangeMes = (event) => {
    setSelectedMonth(event.target.value);
  };

  const { meta: metaData } = useGetMeta({ especialista: id, mes: selectedMonth });

  const [data, setData] = useState({ total: 0, meta: 0 });

  useEffect(() => {
    if (metaData !== undefined) {
      setData(metaData);
    }
  }, [metaData]);

  const total = data?.total;

  const meta = data?.meta;

  const months = Array.from({ length: currentMonth }, (_, index) => index + 1);

  const getMonthName = (month) => {
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return monthNames[month - 1];
  };

  const chartOptions = useChart({

    legend: {
      show: false,
    },
    grid: {
      padding: { top: -32, bottom: -32 },
    },
    fill: {
      type: 'gradient',
      gradient: {
        colorStops: [
          { offset: 0, color: theme.palette.primary.light, opacity: 1 },
          { offset: 100, color: theme.palette.primary.main, opacity: 1 },
        ],
      },
    },
    plotOptions: {
      radialBar: {
        hollow: { size: '64%' },
        dataLabels: {
          name: { offsetY: -16 },
          value: { offsetY: 10 },
          total: {
            label: "Citas",
            text: `${total}`,
            formatter: () => fNumber(total),
          },
        },
      },
    },
  });

  return (
    metaData!== undefined ?

      <Card>
        <CardHeader title='Meta de citas' sx={{ mb: 1.8 }} />

        <Grid container spacing={2} className="fade-in" sx={{ p: 4, backgroundColor: theme.palette.mode === 'dark' ? '#25303d' : '#f7f7f7',
        borderRadius: '20px', margin: '20px' }}>

          <Grid md={12} xs={12}>
            <FormControl sx={{
              width: "100%",
              pr: { xs: 1, md: 1 },
            }}>
              <InputLabel id="demo-simple-select-label">Mes</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={selectedMonth}
                label="Mes"
                onChange={handleChangeMes}
              >
                {months.map(month => (
                  <MenuItem key={month} value={month}>
                    {getMonthName(month)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Chart
          dir="ltr"
          type="radialBar"
          series={[total]}
          options={chartOptions}
          width="100%"
          height={310}
        />

        <Stack spacing={2} sx={{ p: 5 }}>
          <Stack
            spacing={1}
            direction="row"
            alignItems="center"
            sx={{
              typography: 'subtitle2',
            }}
          >
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: 0.75,
                bgcolor: theme.palette.primary.main,
              }}
            />
            <Box sx={{ color: 'text.secondary', flexGrow: 1 }}>Meta</Box>
            {meta} citas
          </Stack>
          <Stack
            spacing={1}
            direction="row"
            alignItems="center"
            sx={{
              typography: 'subtitle2',
            }}
          >
            <Box
              sx={{
                width: 16,
                height: 16,
                bgcolor: alpha(theme.palette.grey[500], 0.16),
                borderRadius: 0.75,
                // bgcolor: colors[1],
              }}
            />
            <Box sx={{ color: 'text.secondary', flexGrow: 1 }}>Faltan</Box>
            {meta - total} citas
          </Stack>
        </Stack>
      </Card>

      :
      <Card sx={{ pr: 2, pl: 1 }}>
        <Grid container spacing={1} sx={{ backgroundColor: "#ECECEC", animation: 'pulse 1.5s infinite', p: 5 }} justifyContent="center" alignItems="center"/>
      </Card>
  );
}

GraficaMetas.propTypes = {
  id: PropTypes.any
};
