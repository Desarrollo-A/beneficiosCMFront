import sumBy from 'lodash/sumBy';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';
import { alpha, useTheme } from '@mui/material/styles';

import { fNumber } from 'src/utils/format-number';

import Chart, { useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

export default function GraficaMetas({ data, ...other }) {
  const theme = useTheme();

  const { total, meta } = data;

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
            text:`${total}`,
            formatter: () => fNumber(total),
          },
        },
      },
    },
  });

  return (
    <Card {...other}>
      <CardHeader title='Meta de citas' sx={{ mb: 16.9 }} />

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
              bgcolor: alpha(theme.palette.grey[500], 0.16),
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
                //bgcolor: colors[1],
              }}
            />
            <Box sx={{ color: 'text.secondary', flexGrow: 1 }}>Faltan</Box>
            {meta - total} citas
          </Stack>
      </Stack>
    </Card>
  );
}

GraficaMetas.propTypes = {
  chart: PropTypes.object,
  subheader: PropTypes.string,
  title: PropTypes.string,
};
