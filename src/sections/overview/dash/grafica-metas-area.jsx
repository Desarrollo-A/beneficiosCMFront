import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

import { useTheme } from '@mui/material/styles';

import Chart, { useChart } from 'src/components/chart';

import { useAuthContext } from 'src/auth/hooks';
import { useGetCitasArea } from 'src/api/especialistas';

import { titleCase } from 'src/utils/format-string'

// ---------------------------------------------------------

export default function GraficaMetasArea({ ...other }) {
  const theme = useTheme();

  const { user } = useAuthContext();

  const { citas } = useGetCitasArea({area : user.idAreaBeneficio})

  const data = {
    name : 'Citas',
    data : citas,
  }

  const chartOptions = useChart(
    {
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
        enabled: true
      },
      legend: {
        show: true,
        showForSingleSeries: true,
        customLegendItems: ['Metas'],
        markers: {
          fillColors: ['red']
        }
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
      }
    }
  );

  return (
    citas.length > 0 ?
        <Card sx={{ pr: 2, pl: 1 }}>
          <CardHeader title='Metas de citas de los especialistas' />
          <Chart
            dir="ltr"
            type="bar"
            series={[data]}
            options={chartOptions}
            width="100%"
            height={(50 * citas.length) + 90}
          />
        </Card>
    : null
  )
}