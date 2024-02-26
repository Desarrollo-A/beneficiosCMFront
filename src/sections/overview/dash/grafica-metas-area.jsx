import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

import { useGetCitasArea } from 'src/api/especialistas';

import Chart, { useChart } from 'src/components/chart';

export default function GraficaMetasArea({ area, puesto, ...other }) {

  const { citas } = useGetCitasArea({puesto, area})

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

GraficaMetasArea.propTypes = {
  area: PropTypes.any,
  puesto: PropTypes.any,
};
