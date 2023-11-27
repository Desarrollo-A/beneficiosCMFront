import { useState } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import uuidv4 from "src/utils/uuidv4";
import { endpoints } from 'src/utils/axios';

import { useGetGeneral, usePostGeneral } from 'src/api/general';

import { useSettingsContext } from 'src/components/settings';

import WidgetSumas from '../widget-sumas';
import GraficaArea from '../grafica-area';
import GraficaPastel from '../grafica-pastel';
import GraficaBarras from '../grafica-barras';

// ----------------------------------------------------------------------

export default function DashView() {

  const d = new Date();

  const year = d.getFullYear();

  const [dataValue, setYearData] = useState(year);

  const { usrCountData } = useGetGeneral(endpoints.dashboard.usersCount, "usrCountData");

  const { ctCountData } = useGetGeneral(endpoints.dashboard.citasCount, "ctCountData");

  const { estCountData } = useGetGeneral(endpoints.dashboard.citasEstatus, "estCountData");

  const { estTotData } = useGetGeneral(endpoints.dashboard.estatusTotal, "estTotData");

  const { fechaMinData } = useGetGeneral(endpoints.dashboard.fechaMinima, "fechaMinData");

  const { fechaAsisData } = usePostGeneral(dataValue, endpoints.dashboard.fechaAsistencia, "fechaAsisData");

  const { fechaCncData } = usePostGeneral(dataValue, endpoints.dashboard.fechaCancelada, "fechaCncData");

  const { fechaPnData } = usePostGeneral(dataValue, endpoints.dashboard.fechaPenalizada, "fechaPnData");

  const settings = useSettingsContext();

  const estCount = estCountData.map((i) => ({
    label: i.estatus,
    value: i.total,
  }));

  const estCountXls = estCountData.map((i) => ({
    estatus: i.estatus,
    total: i.total,
  }));

  const handleChangeYear = (newYear) => {
    setYearData(newYear);
  }

  const desiredLength = 12;

  const resultAs = [];
  let IndexAs = 0;
  for (let i = 1; i <= desiredLength; i += 1) {
    if (IndexAs < fechaAsisData.length && fechaAsisData[IndexAs].mes === i) {
      resultAs.push(fechaAsisData[IndexAs]);
      IndexAs += 1;
    } else {
      resultAs.push({ mes: i, cantidad: 0, nombre: 'Asistencia' });
    }
  }
  const regAs = resultAs.map((u) => (u.cantidad));

  const resultCn = [];
  let IndexCn = 0;
  for (let i = 1; i <= desiredLength; i += 1) {
    if (IndexCn < fechaCncData.length && fechaCncData[IndexCn].mes === i) {
      resultCn.push(fechaCncData[IndexCn]);
      IndexCn += 1;
    } else {
      resultCn.push({ mes: i, cantidad: 0, nombre: 'Cancelada' });
    }
  }
  const regCn = resultCn.map((u) => (u.cantidad));

  const resultPn = [];
  let IndexPn = 0;
  for (let i = 1; i <= desiredLength; i += 1) {
    if (IndexPn < fechaPnData.length && fechaPnData[IndexPn].mes === i) {
      resultPn.push(fechaPnData[IndexPn]);
      IndexPn += 1;
    } else {
      resultPn.push({ mes: i, cantidad: 0, nombre: 'Penalización' });
    }
  }
  const regPn = resultPn.map((u) => (u.cantidad));

  const dataReg = [
    {
      name: 'Asistencias',
      data: regAs,
    },
    {
      name: 'Cancelaciones',
      data: regCn,
    },
    {
      name: 'Penalizaciones',
      data: regPn,
    },
  ];

  const yearMin = parseInt(fechaMinData.map((u) => (u.year)), 10);

  const propGrafic = [
    {
      type: year,
      data: dataReg
    },
  ];

  for (let i = yearMin; i < year; i += 1) {
    propGrafic.push({ type: i, data: dataReg });
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>

      <Typography
        variant="h4"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        Dashboard
      </Typography>

      <Grid container spacing={3}>

        <Grid xs={12} md={4}>
          {usrCountData.flatMap((u) => (
            <WidgetSumas
              key={`route_${uuidv4()}`}
              title="Total de Usuarios"
              total={u.usuarios}
            />
          ))}
        </Grid>

        <Grid xs={12} md={4}>
          {ctCountData.flatMap((u) => (
            <WidgetSumas
              key={`route_${uuidv4()}`}
              title="Total de citas"
              total={u.citas}
            />
          ))}
        </Grid>

        <Grid xs={12} md={4}>
          <WidgetSumas
            title="Total Horarios Ocupados"
            total={678}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <GraficaArea
            title="Estados de Citas"
            chart={{
              series: estCount,
            }}
            estatus={estTotData}
            registros={estCountXls}
            count={ctCountData}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>

          <GraficaPastel
            title="Estados de Citas"
            chart={{
              series: estCount,
            }}
            registros={estCountXls}
            count={ctCountData}
          />
        </Grid>

        <Grid xs={12} md={6} lg={12}>
          <GraficaBarras
            title="Registro de Citas"
            chart={{
              categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
              series: propGrafic
            }}
            year={year}
            handleChangeYear={handleChangeYear}
          />
        </Grid>

      </Grid>
    </Container>
  );
}