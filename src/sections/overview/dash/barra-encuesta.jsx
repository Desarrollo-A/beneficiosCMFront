import Xlsx from 'json-as-xlsx';
import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import ButtonBase from '@mui/material/ButtonBase';
import CardHeader from '@mui/material/CardHeader';

import { endpoints } from 'src/utils/axios';

import { useGetGeneral } from 'src/api/general';

import Iconify from 'src/components/iconify';
import Chart, { useChart } from 'src/components/chart';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

function handleDownloadExcel(chart, title) {

  const respuestas = chart.categories
  
  const resultados = chart.series[0].data[0].data;

  const data = [
    {
      sheet: "",
      columns: respuestas.map((label, index) => ({ label, value: index.toString() })),
      content: [resultados.reduce((obj, value, index) => ({ ...obj, [index.toString()]: value.toString() }), {})]
    }
  ];

  const settings = {
    fileName: title,
    extraLength: 3,
    writeMode: "writeFile",
    writeOptions: {},
    RTL: false,
  }
  Xlsx(data, settings)
}

// ----------------------------------------------------------------------

export default function EncuestaBarra({ title, subheader, chart, ...other }) {

  const [seriesData, setSeriesData] = useState('data');

  const { categories, colors, series, options } = chart;

  const popover = usePopover();

  const chartOptions = useChart({
    colors,
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories,
    },
    tooltip: {
      y: {
        formatter: (value) => `${value}`,
      },
    },
    ...options,
  });

  const handleChangeSeries = useCallback(
    (newValue) => {
      popover.onClose();
      setSeriesData(newValue);
    },
    [popover,]
  );



  const handleExcel = async e => {
    e.preventDefault();
    handleDownloadExcel(
      chart,
      title
    );
  }

  return (
    <>
      <Card {...other}>

      <Tooltip title="Exportar XLS" placement="top" arrow>
          <MenuItem
            sx={{ width: 50, ml: 2, mt: 2 }}
            onClick={handleExcel}
          >
            <Iconify 
            icon="teenyicons:xls-outline"
            width={24} />
          </MenuItem>
      </Tooltip>

        <CardHeader
          title={title}
          subheader={subheader}
          action={
            <ButtonBase
              style={{ display: 'none'}}
              onClick={popover.onOpen}
              sx={{
                pl: 1,
                py: 0.5,
                pr: 0.5,
                borderRadius: 1,
                typography: 'subtitle2',
                bgcolor: 'background.neutral',
              }}
            >
              {seriesData}

              <Iconify
                width={16}
                icon={popover.open ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
                sx={{ ml: 0.5 }}
              />
            </ButtonBase>
          }
        />

        {series.map((item) => (
          <Box key={item.type} sx={{ mt: 3, mx: 3 }}>
            {item.type === seriesData && (
              <Chart
                dir="ltr"
                type="bar"
                series={item.data}
                options={chartOptions}
                width="100%"
                height={364}
              />
            )}
          </Box>
        ))}
      </Card>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 140 }}>
        {series.map((option) => (
          <MenuItem
            key={option.type}
            selected={option.type === seriesData}
            onClick={() => handleChangeSeries(option.type)}
          >
            {option.type}
          </MenuItem>
        ))}
      </CustomPopover>
    </>
  );
}

EncuestaBarra.propTypes = {
  chart: PropTypes.object,
  subheader: PropTypes.string,
  title: PropTypes.string,
  year: PropTypes.number,
  handleChangeYear: PropTypes.func,
};
