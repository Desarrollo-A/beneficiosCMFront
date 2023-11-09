import { useState, useEffect } from 'react';
import uuidv4 from "src/utils/uuidv4";

import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useSettingsContext } from 'src/components/settings';

import { GetDash, PostDash } from "src/api/dash";
import WidgetSumas from '../widget-sumas';
import GraficaArea from '../grafica-area';
import GraficaPastel from '../grafica-pastel';
import GraficaBarras from '../grafica-barras';

// ----------------------------------------------------------------------

export default function DashView() {

  const d = new  Date();

  const  year = d.getFullYear();

  const [usr, usrPost] = useState([]);

  const [cts, citasPost] = useState([]);

  const [ests, estadoPost] = useState([]);
  
  const [estatusCitas, estatusPost] = useState([]);

  const [estatusCitasXLS, estadoPostCitaXLS] = useState([]);

  const [ctAsistencia, ctFechaAsistencia] = useState([]);

  const [ctCancelada, ctFechaCancelada] = useState([]);

  const [ctPenalizada, ctFechaPenalizada] = useState([]);

  const [ctMinima, ctFechaMinima] = useState([]);

  const settings = useSettingsContext();

  const [yearData, setYearData] = useState(year);

  async function UsrCount() {
    const data = await GetDash("usr_count");
    usrPost(data);
  }

  useEffect(() => {
    UsrCount();
  }, []);

  async function CitasCount() {
    const data = await GetDash("citas_count");
    citasPost(data);
  }

  useEffect(() => {
    CitasCount();
  }, []);

  async function CitasCountEstatus() {
    const data = await GetDash("citas_count_status");
    const estado = data.map((edo) => ({
      label: edo.estatus,
      value: edo.total,
    }));

    estadoPost(estado);
  }

  useEffect(() => {
    CitasCountEstatus();
  }, []);

  async function CtEstatusXLS() {
    const data = await GetDash("citas_count_status");

    const estadoCitaXLS = data.map((edo) => ({
      estatus: edo.estatus,
      total: edo.total,
    }));
    estadoPostCitaXLS(estadoCitaXLS);
  }

  useEffect(() => {
    CtEstatusXLS();
  }, []);

  async function EstatusCitasCount() {
    const data = await GetDash("total_status_citas");
    estatusPost(data);
  }

  useEffect(() => {
    EstatusCitasCount();
  }, []);

  async function CitasFechaAsistencia(dta) {
    const data = await PostDash("estatus_fecha_asistencia", dta);
    ctFechaAsistencia(data);
  }

  useEffect(() => {
    CitasFechaAsistencia(yearData);
  }, [yearData]);

  async function CitasFechaCancelada(dta) {
    const data = await PostDash("estatus_fecha_cancelada", dta);
    ctFechaCancelada(data);
  }

  useEffect(() => {
    CitasFechaCancelada(yearData);
  }, [yearData]);

  async function CitasFechaPenalizada(dta) {
    const data = await PostDash("estatus_fecha_penalizada", dta);
    ctFechaPenalizada(data);
  }

  useEffect(() => {
    CitasFechaPenalizada(yearData);
  }, [yearData]);

  async function CitasFechaMinima() {
    const data = await GetDash("fecha_minima");
    ctFechaMinima(data);
  }

  useEffect(() => {
    CitasFechaMinima();
  }, []);

  const handleChangeYear = (newYear) => {
    setYearData(newYear);
  }

  const desiredLength = 12;
  
  const resultAs = [];
  let IndexAs = 0;
  for (let i = 1; i <= desiredLength; i+=1) {
    if (IndexAs < ctAsistencia.length && ctAsistencia[IndexAs].mes === i) {
      resultAs.push(ctAsistencia[IndexAs]);
      IndexAs+=1;
    } else {
      resultAs.push({ mes: i, cantidad: 0, nombre: 'Asistencia' });
    }
  }
  const regAs = resultAs.map((u) => (u.cantidad));

  const resultCn = [];
  let IndexCn = 0;
  for (let i = 1; i <= desiredLength; i+=1) {
    if (IndexCn < ctCancelada.length && ctCancelada[IndexCn].mes === i) {
      resultCn.push(ctCancelada[IndexCn]);
      IndexCn+=1;
    } else {
      resultCn.push({ mes: i, cantidad: 0, nombre: 'Cancelada' });
    }
  }
  const regCn = resultCn.map((u) => (u.cantidad));

  const resultPn = [];
  let IndexPn = 0;
  for (let i = 1; i <= desiredLength; i+=1) {
    if (IndexPn < ctPenalizada.length && ctPenalizada[IndexPn].mes === i) {
      resultPn.push(ctPenalizada[IndexPn]);
      IndexPn+=1;
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

  const yearMin = parseInt(ctMinima.map((u) => (u.year)), 10);

  const propGrafic = [
    {
      type: year,
      data: dataReg
    },
  ];

  for (let i = yearMin; i < year; i+=1) {
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
          {usr.flatMap((u) => (
            <WidgetSumas
              key={`route_${uuidv4()}`}
              title="Total de Usuarios"
              total={u.usuarios}
            />
          ))}
        </Grid>

        <Grid xs={12} md={4}>
          {cts.flatMap((u) => (
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
              series: ests,
            }}
            estatus={estatusCitas}
            registros={estatusCitasXLS}
            count={cts}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>

          <GraficaPastel
            title="Estados de Citas"
            chart={{
              series: ests,
            }}
            registros={estatusCitasXLS}
            count={cts}
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
