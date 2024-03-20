import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';
import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import { alpha, useTheme } from '@mui/material/styles';

import { endpoints } from 'src/utils/axios';

import { bgGradient } from 'src/theme/css';
import { useGetCounts } from 'src/api/dash';
import { useAuthContext } from 'src/auth/hooks';
import { useGetGeneral } from 'src/api/general';
import { SeoIllustration } from 'src/assets/illustrations';
import { useGetEspecialistasPorArea } from 'src/api/especialistas';

import { useSettingsContext } from 'src/components/settings';

import AppWelcome from '../app-welcome';
import WidgetConteo from '../widget-conteo';
import GraficaMetas from '../grafica-metas';
import GraficaPacientes from '../grafica-pacientes';
import GraficaEncuestas from '../grafica-encuestas';
import GraficaModalidad from '../grafica-modalidad';
import GraficaMetasArea from '../grafica-metas-area';
import GraficaEstatusCitas from '../grafica-estatus-citas'

// ----------------------------------------------------------------------

export default function DashView() {

  const diaUnoMes = () => {
    const fechaInicio = new Date();
    const fecha = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), 1);

    const year = fecha.getFullYear();
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const day = fecha.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const ultimoDiaMes = () => {
    const fechaInicio = new Date();
    const MesSiguiente = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth() + 1, 1);
    const ultimoDia = new Date(MesSiguiente.getFullYear(), MesSiguiente.getMonth(), 0);

    const year = ultimoDia.getFullYear();
    const month = (ultimoDia.getMonth() + 1).toString().padStart(2, '0');
    const day = ultimoDia.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const datePikerI = () => {
    const fechaInicio = new Date();
    return new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), 1);
  };

  const datePikerF = () => {
    const fechaInicio = new Date();
    const MesSiguiente = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth() + 1, 1);
    return new Date(MesSiguiente.getFullYear(), MesSiguiente.getMonth(), 0);
  };

  const { user } = useAuthContext();

  const settings = useSettingsContext();

  const [_es, set_es] = useState('0');

  const rol = user?.idRol;

  const puesto = user?.idPuesto;

  const id = user?.idUsuario;

  const [areas, setAreas] = useState(0);

  useEffect(() => {

    if (user?.idRol === 4) {
      setAreas(158);
    } else if (user?.idRol === 2 || user?.idRol === 3) {
      setAreas(user?.idPuesto);
    }

  }, [user]);

  const { especialistasData } = useGetGeneral(endpoints.reportes.especialistas, "especialistasData");

  const { asistenciaData } = useGetCounts(id, endpoints.dashboard.getCtAsistidas, "asistenciaData");

  const { canceladaData } = useGetCounts(id, endpoints.dashboard.getCtCanceladas, "canceladaData");

  const { penalizadaData } = useGetCounts(id, endpoints.dashboard.getCtPenalizadas, "penalizadaData");

  const { ctDisponiblesData } = useGetCounts(id, endpoints.dashboard.getCtDisponibles, "ctDisponiblesData");

  const { especialistas } = useGetEspecialistasPorArea({ areas });

  useEffect(() => {
    if (especialistas.length !== 0) {
      set_es(especialistas[0]?.idUsuario)
    }
  }, [especialistas]);

  const [value, setValue] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setValue(new Date()), 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const theme = useTheme();

  return (

    <Container maxWidth={settings.themeStretch ? false : 'xl'}>

      <Grid container spacing={3}>

        <Grid xs={12} md={9}>
          <AppWelcome
            title={user?.sexo === 'M' ? `Bienvenida 👋 \n ${user?.nombre}` : `Bienvenido  👋 \n ${user?.nombre}`}
            img={<SeoIllustration />}

          />
        </Grid>

        <Grid container justifyContent="center" alignItems="center" xs={12} md={3}>
          <Card
            sx={{
              ...bgGradient({
                direction: '135deg',
                startColor: alpha(theme.palette.primary.light, 0.2),
                endColor: alpha(theme.palette.primary.main, 0.2),
              }),
              height: '275px',
              position: 'relative',
              color: 'primary.darker',
              backgroundColor: 'common.white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '90%'
            }}
          >
            <Clock value={value} />
          </Card>
        </Grid>

        {rol === 4 || rol === 3 ? (
          <>

            <Grid xs={12} md={6} lg={4}>

              <GraficaPacientes
                title="Total pacientes"
                rol={rol}
                id={id}
              />

              <Stack
                spacing={1}
                alignItems={{ xs: 'flex-start', md: 'flex-start' }}
                direction={{
                  xs: 'column',
                  md: 'row',
                }}
                sx={{
                  p: 0,
                  pr: { xs: 1, md: 1 },
                }}
              >ㅤ</Stack>

              <GraficaModalidad
                title="Modalidad de citas"
                beneficios={especialistasData}
                especialistas={especialistas}
                diaUnoMes={diaUnoMes}
                ultimoDiaMes={ultimoDiaMes}
                datePikerI={datePikerI}
                datePikerF={datePikerF}
                rol={rol}
                puesto={puesto}
                id={id}
                chart={{
                  series: [
                    { label: 'Presencial', value: 35 },
                    { label: 'Virtual', value: 75 },
                  ],
                }}
              />
            </Grid>

            <Grid xs={12} sm={12} md={8}>

                <GraficaEstatusCitas
                  title="Estatus de citas"
                  beneficios={especialistasData}
                  especialistas={especialistas}
                  diaUnoMes={diaUnoMes}
                  ultimoDiaMes={ultimoDiaMes}
                  datePikerI={datePikerI}
                  datePikerF={datePikerF}
                  rol={rol}
                  puesto={puesto}
                  id={id}
                />
            </Grid>

          </>
        ) : (
          null
        )}

        {rol === 4 ? (
          <Grid xs={12} sm={6} md={6}>
            <GraficaMetasArea id={id} />
          </Grid>
        ) : (
          null
        )}

        {rol === 3 ? (
          <Grid xs={12} sm={6} md={6}>
            <GraficaMetas id={id} />
          </Grid>
        ) : (
          null
        )}

        {rol === 4 || rol === 3 ? (
          <Grid xs={12} sm={6} md={6}>
            <GraficaEncuestas
              user={user}
              _es={_es}
              rol={rol}
              title="Evaluación de encuestas"
              beneficios={especialistasData}
              especialistas={especialistas}
              diaUnoMes={diaUnoMes}
              ultimoDiaMes={ultimoDiaMes}
              datePikerI={datePikerI}
              datePikerF={datePikerF}
              puesto={puesto}
              id={id}
            />
          </Grid>
        ) : (
          null
        )}


        {rol === 2 ? (
          <>
            {
              asistenciaData.map((i, index) => (
                <Grid xs={12} sm={6} md={3} key={index}>
                  <WidgetConteo
                    title="Total citas asistidas"
                    total={i.asistencia}
                    sx={{ backgroundColor: "#DDFAD7" }}
                    icon={<img alt="icon" src={`${import.meta.env.BASE_URL}assets/icons/glass/check.png`} />}
                  />
                </Grid>
              ))
            }

            {canceladaData.map((i, index) => (
              <Grid xs={12} sm={6} md={3} key={index}>
                <WidgetConteo
                  title="Total citas canceladas"
                  total={i.cancelada}
                  color="warning"
                  icon={<img alt="icon" src={`${import.meta.env.BASE_URL}assets/icons/glass/cancelar.png`} />}
                />
              </Grid>
            ))}

            {penalizadaData.map((i, index) => (
              <Grid xs={12} sm={6} md={3} key={index}>
                <WidgetConteo
                  title="Total citas penalizadas"
                  total={i.penalizada}
                  color="error"
                  icon={<img alt="icon" src={`${import.meta.env.BASE_URL}assets/icons/glass/dolar.png`} />}
                />
              </Grid>
            ))}

            {ctDisponiblesData.map((i, index) => (
              <Grid xs={12} sm={6} md={3} key={index}>
                <WidgetConteo
                  title="Citas diponibles del mes presente"
                  total={2 - i.total}
                  sx={{ backgroundColor: "#E5D7FA" }}
                  icon={<img alt="icon" src={`${import.meta.env.BASE_URL}assets/icons/glass/calendario.png`} />}
                />
              </Grid>
            ))}
          </>
        ) : (
          null
        )}
      </Grid>

    </Container>
  );
}