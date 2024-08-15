import { useState, useCallback } from 'react';

import Card from '@mui/material/Card';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import { endpoints } from 'src/utils/axios';

import { useGetGeneral } from 'src/api/general';
import { useGetCitasArea } from 'src/api/especialistas';

import Chart, { useChart } from 'src/components/chart';

export default function GraficaMetasArea() {
  const theme = useTheme();

  const { beneficios } = useGetGeneral(endpoints.reportes.especialistas, 'beneficios');

  const currentMonth = new Date().getMonth() + 1;

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [areas, setAreas] = useState(585);

  const handleChangeArea = useCallback((event) => {
    setAreas(event.target.value);
  }, []);

  const { citas } = useGetCitasArea({ areas, mes: selectedMonth });

  const data = {
    name: 'Citas',
    data: citas,
  };

  const handleChangeMes = (event) => {
    setSelectedMonth(event.target.value);
  };

  const months = Array.from({ length: currentMonth }, (_, index) => index + 1);

  const getMonthName = (month) => {
    const monthNames = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return monthNames[month - 1];
  };

  const chartOptions = useChart({
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        borderRadius: 1,
        columnWidth: '80%',
        barHeight: '80%',
      },
    },
    dataLabels: {
      enabled: true,
    },
    legend: {
      show: true,
      showForSingleSeries: true,
      customLegendItems: ['Metas'],
      markers: {
        fillColors: ['#2FF665'],
      },
    },
    yaxis: {
      labels: {
        align: 'left',
        maxWidth: 160,
        style: {
          fontSize: '12px',
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontWeight: 400,
          cssClass: 'apexcharts-yaxis-label',
        },
      },
    },
  });

  return citas.length > 0 ? (
    <Card sx={{ pr: 2, pl: 1 }}>
      <CardHeader title="Metas de citas de los especialistas" />

      <Grid
        container
        spacing={2}
        sx={{
          p: 3,
          backgroundColor: theme.palette.mode === 'dark' ? '#25303d' : '#f7f7f7',
          borderRadius: '20px',
          margin: '20px',
        }}
      >
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
                <MenuItem value={i.idPuesto} key={index}>
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
            <InputLabel id="demo-simple-select-label">Mes</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={selectedMonth}
              label="Mes"
              onChange={handleChangeMes}
            >
              {months.map((month) => (
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
        type="bar"
        series={[data]}
        options={chartOptions}
        width="100%"
        height={50 * citas.length + 90}
      />
    </Card>
  ) : (
    <Card>
      <Grid
        container
        spacing={1}
        sx={{ backgroundColor: '#ECECEC', animation: 'pulse 1.5s infinite', p: 5 }}
        justifyContent="center"
        alignItems="center"
      />
    </Card>
  );
}

GraficaMetasArea.propTypes = {};
