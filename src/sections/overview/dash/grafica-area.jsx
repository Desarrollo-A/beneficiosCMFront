import PropTypes from 'prop-types';
import Xlsx from 'json-as-xlsx';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';

import { useResponsive } from 'src/hooks/use-responsive';

import Iconify from 'src/components/iconify';
import Chart, { useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

function CitasDownloadExcel(registros) {
  const data = [
    {
      sheet: "Estados de Citas",
      columns: [
        { label: "Estatus", value: "estatus" },
        { label: "Total", value: "total" },
      ],
      content: registros,
    },
  ]

  const settings = {
    fileName: "Historial Citas",
    extraLength: 3,
    writeMode: "writeFile",
    writeOptions: {},
    RTL: false,
  }
  Xlsx(data, settings)
}

// ----------------------------------------------------------------------

export default function GraficaArea({ title, subheader, chart, estatus, registros, count, ...other }) {
  const theme = useTheme();

  const smUp = useResponsive('up', 'sm');

  const { colors, series, options } = chart;

  const chartSeries = series.map((i) => i.value);

  const chartOptions = useChart({
    colors,
    labels: series.map((i) => i.label),
    stroke: {
      colors: [theme.palette.background.paper],
    },
    fill: {
      opacity: 0.8,
    },
    legend: {
      position: 'right',
      itemMargin: {
        horizontal: 10,
        vertical: 7,
      },
    },
    tooltip: {
      fillSeriesColor: false,
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
    ...options,
  });

  const handleExcel = async e => {
    e.preventDefault();
    CitasDownloadExcel(
      registros
    );
  }
  
  return (
    <Card {...other}>
      <MenuItem
            sx={{ width: 50, ml: 2, mt: 2 }}
            title='Exportar Excel'
            onClick={handleExcel}
          >
            <Iconify 
            icon="teenyicons:xls-outline"
            width={24} />
      </MenuItem>
      <CardHeader title={title} subheader={subheader} />
      <Box
        sx={{
          my: 5,
          '& .apexcharts-legend': {
            m: 'auto',
            height: { sm: 160 },
            flexWrap: { sm: 'wrap' },
            width: { xs: 240, sm: '50%' },
          },
          '& .apexcharts-datalabels-group': {
            display: 'none',
          },
        }}
      >
        <Chart
          dir="ltr"
          type="polarArea"
          series={chartSeries}
          options={chartOptions}
          width="100%"
          height={smUp ? 240 : 360}
        />
      </Box>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Box
        display="grid"
        gridTemplateColumns="repeat(2, 1fr)"
        sx={{ textAlign: 'center', typography: 'h4' }}
      >
        <Stack sx={{ py: 2, borderRight: `dashed 1px ${theme.palette.divider}` }}>
          <Box component="span" sx={{ mb: 1, typography: 'body2', color: 'text.secondary' }}>
            Total de Citas
          </Box>
          { count.flatMap((u) => (
          u.citas
          ))}
        </Stack>
            

        <Stack sx={{ py: 2 }}>
          <Box component="span" sx={{ mb: 1, typography: 'body2', color: 'text.secondary' }}>
            Total de Estatus
          </Box>
          { estatus.flatMap((u) => (
          u.total
          ))}
        </Stack>
      </Box>
    </Card>
  );
}

GraficaArea.propTypes = {
  chart: PropTypes.object,
  subheader: PropTypes.string,
  title: PropTypes.string,
  estatus: PropTypes.array,
  registros: PropTypes.array,
  count: PropTypes.array,
};
