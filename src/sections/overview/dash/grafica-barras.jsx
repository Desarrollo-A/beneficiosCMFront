import Xlsx from 'json-as-xlsx';
import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import ButtonBase from '@mui/material/ButtonBase';
import CardHeader from '@mui/material/CardHeader';

import Dashboard from 'src/api/dash';

import Iconify from 'src/components/iconify';
import Chart, { useChart } from 'src/components/chart';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

function CitasDownloadExcel(Grafic, seriesData, title) {
    const year = seriesData.toString();
    const data = [
      {
        sheet: title+year,
        columns: [
          { label: "Mes", value: "mes" },
          { label: "Total", value: "cantidad" },
          { label: "Estatus", value: "nombre" },
        ],
        content: Grafic,
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

export default function GraficaBarras({ title, subheader, chart, year, handleChangeYear, ...other }) {

  const dashborad = Dashboard();

  const { categories, colors, series, options } = chart;

  const popover = usePopover();

  const [seriesData, setSeriesData] = useState(year);

  const [Grafic, setGrafic] = useState([]);

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
      handleChangeYear(newValue);
    },
    [popover, handleChangeYear]
  );

  async function handleGrafic() {
    dashborad.getCitasAnual(data => {
      setGrafic(data.data);
    });
  }

  useEffect(() => {
    handleGrafic();
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleExcel = async e => {
    e.preventDefault();
    CitasDownloadExcel(
      Grafic,
      seriesData,
      title
    );
  }

  return (
    <>
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
        <CardHeader
          title={title}
          subheader={subheader}
          action={
            <ButtonBase
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

GraficaBarras.propTypes = {
  chart: PropTypes.object,
  subheader: PropTypes.string,
  title: PropTypes.string,
  year: PropTypes.number,
  handleChangeYear: PropTypes.func,
};
