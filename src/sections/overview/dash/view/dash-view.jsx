import 'react-clock/dist/Clock.css';
import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';

import { endpoints } from 'src/utils/axios';

import { useGetCounts } from 'src/api/dash';
import { useAuthContext } from 'src/auth/hooks';
import { useGetGeneral } from 'src/api/general';
import { SeoIllustration } from 'src/assets/illustrations';
import { useGetEspecialistasPorArea } from 'src/api/especialistas';

import { useSettingsContext } from 'src/components/settings';

import './style.css';
import AppWelcome from '../app-welcome';
import AppFeatured from '../app-featured';
import WidgetConteo from '../widget-conteo';
import GraficaMetas from '../grafica-metas';
import GraficaEncuestas from '../grafica-encuestas';
import GraficaModalidad from '../grafica-modalidad';
import GraficaMetasArea from '../grafica-metas-area';
import AppCurrentDownload from '../app-current-download';
import GraficaEstatusCitas from '../grafica-estatus-citas'
import GraficaDemandaDepartamento from '../grafica-demanda-departamento';

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

  return (

    <Container maxWidth={settings.themeStretch ? false : 'xl'}>

      <Grid container spacing={3}>

        <Grid xs={12} md={8}>
          <AppWelcome
            title={user?.sexo === 'M' ? `Bienvenida 👋 \n ${user?.nombre}` : `Bienvenido  👋 \n ${user?.nombre}`}
            img={<SeoIllustration />}

          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppFeatured />
        </Grid>

        {rol === 4 ? (
          <Grid xs={12} md={12} lg={12}>
            <GraficaDemandaDepartamento
              title="Demanda de beneficios"
              beneficios={especialistasData} />
          </Grid>
        ) : (
          null
        )}

        {rol === 4 || rol === 3 ? (
          <>

            <Grid xs={12} md={6} lg={4}>

              <AppCurrentDownload
                title="Total pacientes"
                chart={{
                  series: [
                    { label: 'Mac', value: 15 },
                    { label: 'Window', value: 5 },
                  ],
                }}
                rol={rol}
                id={id}
                beneficios={especialistasData}
                especialistas={especialistas}
                diaUnoMes={diaUnoMes}
                ultimoDiaMes={ultimoDiaMes}
                datePikerI={datePikerI}
                datePikerF={datePikerF}
                puesto={puesto}
              />

              {/* <GraficaPacientes
                title="Total pacientes"
                rol={rol}
                id={id}
              /> */}

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

              {rol === 4 ? (
                <GraficaMetasArea id={id} />
              ) : (
                null
              )}

              {rol === 3 ? (
                <GraficaMetas id={id} />
              ) : (
                null
              )}
            </Grid>

          </>
        ) : (
          null
        )}

        {rol === 4 || rol === 3 ? (
          <Grid xs={12} sm={12} md={12}>
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
            {asistenciaData.length > 0 && canceladaData.length > 0 && penalizadaData.length > 0 && ctDisponiblesData.length > 0 ? (
              <>
                {asistenciaData.map((i, index) => (
                  <Grid xs={12} sm={6} md={3} key={index} className="fade-in">
                    <WidgetConteo
                      title="Total citas asistidas"
                      total={i.asistencia}
                      sx={{ backgroundColor: "#d2ffc9" }}
                      icon={<img alt="icon" src={`${import.meta.env.BASE_URL}assets/icons/glass/shield.svg`} />}
                    />
                  </Grid>
                ))
                }

                {canceladaData.map((i, index) => (
                  <Grid xs={12} sm={6} md={3} key={index} className="fade-in">
                    <WidgetConteo
                      title="Total citas canceladas"
                      total={i.cancelada}
                      sx={{ backgroundColor: "#f7e4bd" }}
                      icon={<img alt="icon" src={`${import.meta.env.BASE_URL}assets/icons/glass/close.svg`} />}
                    />
                  </Grid>
                ))}

                {penalizadaData.map((i, index) => (
                  <Grid xs={12} sm={6} md={3} key={index} className="fade-in">
                    <WidgetConteo
                      title="Total citas penalizadas"
                      total={i.penalizada}
                      sx={{ backgroundColor: "#f7d0c8" }}
                      icon={<img alt="icon" width={128} src={`${import.meta.env.BASE_URL}assets/icons/glass/danger.svg`} />}
                    />
                  </Grid>
                ))}

                {ctDisponiblesData.map((i, index) => (
                  <Grid xs={12} sm={6} md={3} key={index} className="fade-in">
                    <WidgetConteo
                      title="Citas disponibles del mes presente"
                      total={(2 - i.total) < 0 ? 0 : 2 - i.total}
                      sx={{ backgroundColor: "#fad3ff" }}
                      icon={<img alt="icon" src={`${import.meta.env.BASE_URL}assets/icons/glass/calendar.svg`} />}
                    />
                  </Grid>
                ))}
              </>
            ) : (
              <>
                <Grid xs={12} sm={6} md={3}>
                  <WidgetConteo
                    sx={{ backgroundColor: "#ECECEC", animation: 'pulse 1.5s infinite' }}
                  />
                </Grid>
                <Grid xs={12} sm={6} md={3}>
                  <WidgetConteo
                    sx={{ backgroundColor: "#ECECEC", animation: 'pulse 1.5s infinite' }}
                  />
                </Grid>
                <Grid xs={12} sm={6} md={3}>
                  <WidgetConteo
                    sx={{ backgroundColor: "#ECECEC", animation: 'pulse 1.5s infinite' }}
                  />
                </Grid>
                <Grid xs={12} sm={6} md={3}>
                  <WidgetConteo
                    sx={{ backgroundColor: "#ECECEC", animation: 'pulse 1.5s infinite' }}
                  />
                </Grid>
              </>
            )}
          </>
        ) : (
          null
        )}
      </Grid>

    </Container>
  );
}