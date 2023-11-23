import Xlsx from 'json-as-xlsx';
import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import CardHeader from '@mui/material/CardHeader';
import { styled, useTheme } from '@mui/material/styles';

import { fNumber } from 'src/utils/format-number';

import Iconify from 'src/components/iconify';
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

function handleDownloadExcel(registros, count) {

  const totMap = 100 / parseInt(count.map((u) => (u.citas)), 10);
  const estadoXLS = registros.map((edo) => ({
    estatus: edo.estatus,
    total: (totMap * edo.total).toFixed(2),
  }));

  const data = [
    {
      sheet: "Estados de Citas",
      columns: [
        { label: "Estatus", value: "estatus" },
        { label: "Total", value: "total" },
      ],
      content: estadoXLS,
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

export default function GraficaPastel({ title, subheader, chart, registros, count, ...other }) {
  const theme = useTheme();

  const { colors, series, options } = chart;

  const chartSeries = series.map((i) => i.value);

  const chartOptions = useChart({
    chart: {
      sparkline: {
        enabled: true,
      },
    },
    colors,
    labels: series.map((i) => i.label),
    stroke: {
      colors: [theme.palette.background.paper],
    },
    legend: {
      floating: true,
      position: 'bottom',
      horizontalAlign: 'center',
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
    ...options,
  });

  const handleExcel = async e => {
    e.preventDefault();
    handleDownloadExcel(
      registros, count
    );
  }

  return (
    <Card {...other}>

    <Tooltip title="Exportar XLS" placement="top" arrow>
      <MenuItem
            sx={{ width: 50, ml: 2, mt: 2 }}
            title='Exportar Excel'
            onClick={handleExcel}
          >
            <Iconify 
            icon="teenyicons:xls-outline"
            width={24} />
      </MenuItem>
    </Tooltip>

      <CardHeader title={title} subheader={subheader} sx={{ mb: 5 }} />

      <StyledChart
        dir="ltr"
        type="pie"
        series={chartSeries}
        options={chartOptions}
        width="100%"
        height={280}
      />
    </Card>
  );
}

GraficaPastel.propTypes = {
  chart: PropTypes.object,
  subheader: PropTypes.string,
  title: PropTypes.string,
  registros: PropTypes.array,
  count: PropTypes.array,
};
