import { useState, useEffect } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import uuidv4 from "src/utils/uuidv4";

import Dashboard from 'src/api/dash';

import { useSettingsContext } from 'src/components/settings';

import WidgetSumas from '../widget-sumas';
import GraficaArea from '../grafica-area';
import GraficaPastel from '../grafica-pastel';
import GraficaBarras from '../grafica-barras';

// ----------------------------------------------------------------------

export default function DashView() {

  const dashborad = Dashboard();

  const d = new Date();

  const year = d.getFullYear();

  const [usr, setUserCount] = useState([]);

  const [CtCount, setCtCount] = useState([]);

  const [EstatusCount, setEstatusCount] = useState([]);

  const [EstatusTot, setEstatusTot] = useState([]);

  const [EstatusXls, setEstatusXls] = useState([]);

  const [FechaAsis, setFechaAsis] = useState([]);

  const [ctCancelada, setFechaCanc] = useState([]);

  const [ctPenalizada, setFechaPen] = useState([]);

  const [FechaMin, setFechaMin] = useState([]);

  const settings = useSettingsContext();

  const [yearData, setYearData] = useState(year);

  async function handleUsrCount() {
    dashborad.getUsersCount(data => {
      setUserCount(data.data);
    });
  }

  useEffect(() => {
    handleUsrCount();
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCtCount() {
    dashborad.getCitasCount(data => {
      setCtCount(data.data);
    });
  }

  useEffect(() => {
    handleCtCount();
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCountEstatus() {
    dashborad.getCitasEstatus(data => {
      const ct = data.data.map((cita) => ({
        label: cita.estatus,
        value: cita.total,
      }));
      setEstatusCount(ct);
    });
  }

  useEffect(() => {
    handleCountEstatus();
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleEstatusXLS() {
    dashborad.getCitasEstatus(data => {
      const ct = data.data.map((cita) => ({
        estatus: cita.estatus,
        total: cita.total,
      }));
      setEstatusXls(ct);
    });
  }

  useEffect(() => {
    handleEstatusXLS();
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleEstatusTot() {
    dashborad.getEstatusTotal(data => {
      setEstatusTot(data.data);
    });
  }

  useEffect(() => {
    handleEstatusTot();
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleFechaMin() {
    dashborad.getFechaMinima(data => {
      setFechaMin(data.data);
    });
  }

  useEffect(() => {
    handleFechaMin();
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleFechaAsis() {
    dashborad.getFechaAsistencia(data => {
      setFechaAsis(data.data);
    },{
      yearData
    });
  }

  useEffect(() => {
    handleFechaAsis();
  }, [yearData]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleFechaCanc() {
    dashborad.getFechaCancelada(data => {
      setFechaCanc(data.data);
    },{
      yearData
    });
  }

  useEffect(() => {
    handleFechaCanc();
  }, [yearData]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleFechaPen() {
    dashborad.getFechaPenalizada(data => {
      setFechaPen(data.data);
    },{
      yearData
    });
  }

  useEffect(() => {
    handleFechaPen();
  }, [yearData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChangeYear = (newYear) => {
    setYearData(newYear);
  }

  const desiredLength = 12;

  const resultAs = [];
  let IndexAs = 0;
  for (let i = 1; i <= desiredLength; i += 1) {
    if (IndexAs < FechaAsis.length && FechaAsis[IndexAs].mes === i) {
      resultAs.push(FechaAsis[IndexAs]);
      IndexAs += 1;
    } else {
      resultAs.push({ mes: i, cantidad: 0, nombre: 'Asistencia' });
    }
  }
  const regAs = resultAs.map((u) => (u.cantidad));

  const resultCn = [];
  let IndexCn = 0;
  for (let i = 1; i <= desiredLength; i += 1) {
    if (IndexCn < ctCancelada.length && ctCancelada[IndexCn].mes === i) {
      resultCn.push(ctCancelada[IndexCn]);
      IndexCn += 1;
    } else {
      resultCn.push({ mes: i, cantidad: 0, nombre: 'Cancelada' });
    }
  }
  const regCn = resultCn.map((u) => (u.cantidad));

  const resultPn = [];
  let IndexPn = 0;
  for (let i = 1; i <= desiredLength; i += 1) {
    if (IndexPn < ctPenalizada.length && ctPenalizada[IndexPn].mes === i) {
      resultPn.push(ctPenalizada[IndexPn]);
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

  const yearMin = parseInt(FechaMin.map((u) => (u.year)), 10);

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
          {usr.flatMap((u) => (
            <WidgetSumas
              key={`route_${uuidv4()}`}
              title="Total de Usuarios"
              total={u.usuarios}
            />
          ))}
        </Grid>

        <Grid xs={12} md={4}>
          {CtCount.flatMap((u) => (
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
              series: EstatusCount,
            }}
            estatus={EstatusTot}
            registros={EstatusXls}
            count={CtCount}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>

          <GraficaPastel
            title="Estados de Citas"
            chart={{
              series: EstatusCount,
            }}
            registros={EstatusXls}
            count={CtCount}
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