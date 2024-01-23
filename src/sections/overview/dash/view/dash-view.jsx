import { Base64 } from 'js-base64';
import { useState, useEffect } from 'react';
import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';

import Card from '@mui/material/Card';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import { alpha, useTheme } from '@mui/material/styles';

import { endpoints } from 'src/utils/axios';

import { SeoIllustration } from 'src/assets/illustrations';
import { useGetGeneral, usePostGeneral } from 'src/api/general';

import { useSettingsContext } from 'src/components/settings';

import { bgGradient } from 'src/theme/css';

import AppWelcome from '../app-welcome';
import WidgetConteo from '../widget-conteo';
import GraficaMetas from '../grafica-metas';
import EncuestaBarra from '../barra-encuesta';
import EncuestaPorcentaje from '../porcentaje-encuesta';

// ----------------------------------------------------------------------

export default function DashView() {

  /* const { email } = useGetGeneral(endpoints.encuestas.sendMail, "email");

  console.log(email); */

  const user = JSON.parse(Base64.decode(sessionStorage.getItem('accessToken').split('.')[2]));

  const settings = useSettingsContext();

  let idDt = "";

  const rol = user.idRol
  let puestos = 0;

  if (rol === "1") {
    idDt = 158;
    puestos = 158;
  } else {
    idDt = user.idUsuario;
    puestos = user.idPuesto;
  }

  function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getTrimesterDates() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const trimStart = new Date(currentYear, Math.floor(currentMonth / 3) * 3, 1);
    const trimEnd = new Date(trimStart);
    trimEnd.setMonth(trimStart.getMonth() + 3);
    trimEnd.setDate(trimEnd.getDate() - 1);

    return {
      trimStart: formatDate(trimStart),
      trimEnd: formatDate(trimEnd),
    };
  }

  const { trimStart, trimEnd } = getTrimesterDates();

  function rangeMonth() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Primer día del mes actual
    const firstDayMonth = new Date(currentYear, currentMonth, 1);
    const formFirstDay = formatDate(firstDayMonth);

    // Último día del mes actual
    const lastDayMonth = new Date(currentYear, currentMonth + 1, 0);
    const formLastDay = formatDate(lastDayMonth);

    return {
      firstDayMonth: formFirstDay,
      lastDayMonth: formLastDay,
    };
  }

  const { firstDayMonth, lastDayMonth } = rangeMonth();

  const [espe, setEspe] = useState({ idData: idDt, idRol: user.idRol });

  const [meta, setMeta] = useState({
    idData: idDt,
    idRol: user.idRol,
    inicio: trimStart,
    fin: trimEnd
  });

  const [areas, setAreas] = useState(puestos);

  const { preguntaData } = usePostGeneral(areas, endpoints.dashboard.getPregunta, "preguntaData");

  const { encValidData } = usePostGeneral(areas, endpoints.encuestas.getValidEncContestada, "encValidData");

  const { especialistasData } = useGetGeneral(endpoints.reportes.especialistas, "especialistasData");

  const { pacientesData } = usePostGeneral(espe, endpoints.dashboard.getPacientes, "pacientesData");

  const { asistenciaData } = usePostGeneral(espe, endpoints.dashboard.getCtAsistidas, "asistenciaData");

  const { canceladaData } = usePostGeneral(espe, endpoints.dashboard.getCtCanceladas, "canceladaData");

  const { penalizadaData } = usePostGeneral(espe, endpoints.dashboard.getCtPenalizadas, "penalizadaData");

  const { metasData } = usePostGeneral(meta, endpoints.dashboard.getMetas, "metasData");

  const [pgDt, setPgDt] = useState('');

  const [dflt, setDflt] = useState('');

  const [pg, setPg] = useState('');

  const [sn, setSn] = useState('');

  const [idEncuesta, setIdEncuesta] = useState('');

  const [pregunta, setPregunta] = useState([]);

  const [paramRes, setParamRes] = useState([]);

  const handleChangePg = (newPg) => {
    setPregunta(newPg);
  }

  const handleChangeIdPg = (newIdPg) => {
    setPg(newIdPg);
  }

  const [selectPg, setSelectPg] = useState('');

  const { respCountData } = usePostGeneral(dflt, endpoints.dashboard.getCountRespuestas, "respCountData");

  const { respData } = usePostGeneral(paramRes, endpoints.dashboard.getRespuestas, "respData");

  const respArray = respData.flatMap((i) => (
    JSON.parse(`[${i.respuestas.split(', ').flatMap(value => `"${value}"`).join(', ')}]`
    )));

  const resultArray = respArray.map((respuesta) => {
    const matchingObj = respCountData.find((obj) => obj.respuesta === respuesta);
    return matchingObj ? matchingObj.cantidad : 0;
  });

  const percent = respArray.map((respuesta) => {
    const matchingObj = respCountData.find((obj) => obj.respuesta === respuesta);
    return matchingObj ? matchingObj.porcentaje : 0;
  });

  useEffect(() => {
    if (preguntaData.length > 0) {
      setIdEncuesta(preguntaData[0]?.idEncuesta)
    }
  }, [preguntaData])

  useEffect(() => {

    if (encValidData === true) {

      if (preguntaData && Array.isArray(pregunta) && pregunta.length === 0) {

        setDflt([{ idPregunta: preguntaData[0]?.idPregunta },
        { idEncuesta: preguntaData[0]?.idEncuesta },
        { respuestas: preguntaData[0]?.respuestas },
        { pregunta: preguntaData[0]?.pregunta }]);

        setParamRes([{ idPregunta: preguntaData[0]?.idPregunta },
        { idEncuesta: preguntaData[0]?.idEncuesta },
        { idArea: preguntaData[0]?.idArea }]);

        setSelectPg(preguntaData[0]?.pregunta);

        setPgDt(preguntaData[0]?.respuestas);

      } else if (preguntaData && Array.isArray(pregunta) && pregunta.length > 0) {

        setDflt(pregunta);

        setParamRes(pregunta)

        setSelectPg(pregunta[3]?.pregunta);

        setPgDt(respData[0]?.grupo);

      } else {
        alert("Error")
      }
    }
  }, [preguntaData, pregunta, respData, encValidData]);

  useEffect(() => {
    if (preguntaData && Array.isArray(pregunta) && pregunta.length === 0) {
      setPg(preguntaData[0]?.idPregunta);
    } else if (preguntaData && Array.isArray(pregunta) && pregunta.length > 0) {
      setPg(pregunta[0]?.idPregunta);
    } else {
      alert("Error")
    }
  }, [preguntaData, pregunta]);

  useEffect(() => {
    if (preguntaData && Array.isArray(pregunta) && pregunta.length === 0 && pgDt !== "3") {
      setSn(0);
    } else if (preguntaData && Array.isArray(pregunta) && pregunta.length === 0 && pgDt === "3") {
      setSn(1);
    } else if (pregunta.length > 0 && pgDt === 3) {
      setSn(1);
    } else if (pregunta.length > 0 && pgDt !== 3) {
      setSn(0);
    } else {
      alert("Error")
    }
  }, [preguntaData, pregunta, pgDt, resultArray]);

  const _dt = {
    percent: (index) => percent[index],
  }

  const _ecommerceSalesOverview = ['No', 'Si'].map(
    (label, index) => ({
      label,
      value: _dt.percent(index),
    })
  );

  function metasDate() {

    let totMeta = 0;

    if (areas === 158 && user.idUsuario === 40) {
      totMeta = 360;
    } else if (areas === 158) {
      totMeta = 240;
    } else if (areas === 537) {
      totMeta = 100;
    } else if (areas === 686) {
      totMeta = 40;
    } else if (areas === 585) {
      totMeta = 80;
    }

    return {
      totalMeta: totMeta
    };
  }

  const { totalMeta } = metasDate();

  const handleChangeArea = (event) => {

    setAreas(event.target.value);

    setEspe({ idData: event.target.value, idRol: user.idRol });

    if (event.target.value === 158) {
      setMeta({
        idData: event.target.value,
        idRol: user.idRol,
        inicio: trimStart,
        fin: trimEnd
      })
    } else {
      setMeta({
        idData: event.target.value,
        idRol: user.idRol,
        inicio: firstDayMonth,
        fin: lastDayMonth
      })
    }

  };

  const [value, setValue] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setValue(new Date()), 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const theme = useTheme();

  return (
    <>

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>

        <Grid container spacing={3}>

          <Grid xs={12} md={9}>
            <AppWelcome
              title={`Bienvenido 👋 \n ${user?.nombre}`}
              description="If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything."
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
                width: '370px'
              }}
            >
              <Clock value={value} />
            </Card>
          </Grid>



          {rol === "1" ? (
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Área</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={areas}
                label="Área"
                onChange={(e) => handleChangeArea(e)}
              >
                {especialistasData.map((i) => (
                  <MenuItem key={i.idPuesto} value={i.idPuesto}>
                    {i.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

          ) : (

            <>
            </>

          )}

          {pacientesData.map((i) => (
            <Grid xs={12} sm={6} md={3}>
              <WidgetConteo
                title={rol === '2' ? 'Total citas' : 'Total pacientes'}
                total={i.pacientes}
                color="info"
                icon={<img alt="icon" src="/assets/icons/glass/usuario.png" />}
              />
            </Grid>
          ))}

          {asistenciaData.map((i) => (
            <Grid xs={12} sm={6} md={3}>
              <WidgetConteo
                title="Total citas asistidas"
                total={i.asistencia}
                icon={<img alt="icon" src="/assets/icons/glass/check.png" />}
              />
            </Grid>
          ))}

          {canceladaData.map((i) => (
            <Grid xs={12} sm={6} md={3}>
              <WidgetConteo
                title="Total citas canceladas"
                total={i.cancelada}
                color="warning"
                icon={<img alt="icon" src="/assets/icons/glass/cancelar.png" />}
              />
            </Grid>
          ))}

          {penalizadaData.map((i) => (
            <Grid xs={12} sm={6} md={3}>
              <WidgetConteo
                title="Total citas penalizadas"
                total={i.penalizada}
                color="error"
                icon={<img alt="icon" src="/assets/icons/glass/dolar.png" />}
              />
            </Grid>
          ))}

          {rol !== "2" ? (
            <>

              {metasData.map((i) => (
                <Grid xs={12} sm={6} md={4}>
                  <GraficaMetas
                    title="Meta de citas"
                    chart={{
                      series: [
                        { label: 'Citas', value: i.citas },
                        { label: 'Faltantes', value: totalMeta - i.citas },
                      ],
                    }}
                  />
                </Grid>
              ))}

              {sn === 0 ? (
                <Grid xs={12} sm={6} md={8}>
                  <EncuestaBarra
                    idPregunta={pg}
                    chart={{
                      categories: respArray,
                      series: [
                        {
                          type: 'data',
                          data: [
                            {
                              name: 'Total',
                              data: resultArray,
                            }
                          ],
                        },
                      ],
                    }}
                    user={user}
                    handleChangePg={handleChangePg}
                    idEncuesta={idEncuesta}
                    idArea={areas}
                    handleChangeIdPg={handleChangeIdPg}
                  />
                </Grid>

              ) : (

                <Grid xs={12} sm={6} md={8}>
                  <EncuestaPorcentaje
                    idPregunta={pg}
                    data={_ecommerceSalesOverview}
                    user={user}
                    handleChangePg={handleChangePg}
                    selectPg={selectPg}
                    idEncuesta={idEncuesta}
                    idArea={areas}
                    handleChangeIdPg={handleChangeIdPg}
                  />
                </Grid>

              )}

            </>

          ) : (

            <>
            </>

          )}

        </Grid>

      </Container>

      {/* <Grid xs={12} md={6} lg={12}>
          <GraficaBarras
            title="Registro de Citas"
            chart={{
              categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
              series: propGrafic
            }}
            year={year}
            handleChangeYear={handleChangeYear}
          />
        </Grid>  */}
    </>
  );
}