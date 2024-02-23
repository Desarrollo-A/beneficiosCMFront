import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';
import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { alpha, useTheme } from '@mui/material/styles';

import { endpoints } from 'src/utils/axios';

import { bgGradient } from 'src/theme/css';
import { useAuthContext } from 'src/auth/hooks';
import { useGetMeta } from 'src/api/especialistas';
import { SeoIllustration } from 'src/assets/illustrations';
import { useGetGeneral, usePostGeneral } from 'src/api/general';

// import { _appAuthors, _appRelated, _appFeatured, _appInvoices, _appInstalled } from 'src/_mock';

import { useSettingsContext } from 'src/components/settings';

import AppWelcome from '../app-welcome';
import WidgetConteo from '../widget-conteo';
import GraficaMetas from '../grafica-metas';
import EncuestaBarra from '../barra-encuesta';
import GraficaMetasArea from '../grafica-metas-area';
// import AppTopRelated from '../app-top-related';
import EncuestaPorcentaje from '../porcentaje-encuesta';

// ----------------------------------------------------------------------

export default function DashView() {

  /* const { email } = useGetGeneral(endpoints.encuestas.sendMail, "email");

  console.log(email); */

  const { user } = useAuthContext();

  const settings = useSettingsContext();

  let idDt = "";

  const rol = user?.idRol
  let puestos = 0;

  if (rol === "4" || rol === 4) {
    idDt = 158;
    puestos = 158;
  } else if (rol === "2" || rol === 2 || rol === "3" || rol === 3) {
    idDt = user?.idUsuario;
    puestos = user?.idPuesto;
  } else if (rol === "1" || rol === 1) {
    idDt = user?.idPuesto;
    puestos = user?.idPuesto;
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

  const [espe, setEspe] = useState({ idData: idDt, idRol: user?.idRol });

  /*  const [ meta, setMeta] = useState({
     idData: idDt,
     idRol: user?.idRol,
     inicio: trimStart,
     fin: trimEnd
   }); */

  const [areas, setAreas] = useState(puestos);

  const [ps, setPs] = useState(158);

  // const { citas } = useGetCitasArea({puesto: ps});

  const { preguntaData } = usePostGeneral(areas, endpoints.dashboard.getPregunta, "preguntaData");

  const { encValidData } = usePostGeneral(areas, endpoints.encuestas.getValidEncContestada, "encValidData");

  const { especialistasData } = useGetGeneral(endpoints.reportes.especialistas, "especialistasData");

  const { pacientesData } = usePostGeneral(espe, endpoints.dashboard.getPacientes, "pacientesData");

  const { asistenciaData } = usePostGeneral(espe, endpoints.dashboard.getCtAsistidas, "asistenciaData");

  const { canceladaData } = usePostGeneral(espe, endpoints.dashboard.getCtCanceladas, "canceladaData");

  const { penalizadaData } = usePostGeneral(espe, endpoints.dashboard.getCtPenalizadas, "penalizadaData");

  // const { metasData } = usePostGeneral(meta, endpoints.dashboard.getMetas, "metasData");

  const { meta: metaData } = useGetMeta({ especialista: user?.idUsuario })

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
      value: _dt.percent(index) ?? 0,
    })
  );

  const handleChangeArea = (event) => {

    setPs(event.target.value);

    setAreas(event.target.value);

    setEspe({ idData: event.target.value, idRol: user?.idRol });

    /* if (event.target.value === 158) {
      setMeta({
        idData: event.target.value,
        idRol: user?.idRol,
        inicio: trimStart,
        fin: trimEnd
      })
    } else {
      setMeta({
        idData: event.target.value,
        idRol: user?.idRol,
        inicio: firstDayMonth,
        fin: lastDayMonth
      })
    } */

  };

  const [value, setValue] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setValue(new Date()), 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const theme = useTheme();


  // const appRelated = ['Chrome', 'Drive', 'Dropbox', 'Evernote', 'Github'].map(
  //   (name, index) => {
  //     const system = [2, 4].includes(index) ? 'Windows' : 'Mac';

  //     const shortcut =
  //       (name === 'Chrome' && '/assets/icons/app/ic_chrome.svg') ||
  //       (name === 'Drive' && '/assets/icons/app/ic_drive.svg') ||
  //       (name === 'Dropbox' && '/assets/icons/app/ic_dropbox.svg') ||
  //       (name === 'Evernote' && '/assets/icons/app/ic_evernote.svg') ||
  //       '/assets/icons/app/ic_github.svg';

  //     return {
  //       /* id: _mock.id(index), */
  //       name,
  //       system,
  //       shortcut,
  //       /* ratingNumber: _mock.number.rating(index),
  //       totalReviews: _mock.number.nativeL(index), */
  //     };
  //   }
  // );

  return (
    <>

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>

        <Grid container spacing={3}>

          <Grid xs={12} md={9}>
            <AppWelcome
              title={`Bienvenido 👋 \n ${user?.nombre}`}
              /* description="If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything." */
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
                width: '360px'
              }}
            >
              <Clock value={value} />
            </Card>
          </Grid>



          {rol === "4" || rol === 4 ? (
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Área</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={!areas ? '' : areas}
                label="Área"
                onChange={(e) => handleChangeArea(e)}
              >
                {especialistasData.map((i, index) => (
                  <MenuItem key={index} value={i.idPuesto}>
                    {i.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

          ) : (

            <>
            </>

          )}

          {pacientesData.map((i, index) => (
            <Grid xs={12} sm={6} md={3} key={index}>
              <WidgetConteo
                title={rol === '2' || rol === 2 ? 'Total citas' : 'Total pacientes'}
                total={i.pacientes}
                color="info"
                icon={<img alt="icon" src={`${import.meta.env.BASE_URL}assets/icons/glass/usuario.png`} />}
              />
            </Grid>
          ))}

          {asistenciaData.map((i, index) => (
            <Grid xs={12} sm={6} md={3} key={index}>
              <WidgetConteo
                title="Total citas asistidas"
                total={i.asistencia}
                icon={<img alt="icon" src={`${import.meta.env.BASE_URL}assets/icons/glass/check.png`} />}
              />
            </Grid>
          ))}

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

          {rol === "1" || rol === 1 || rol === "3" || rol === 3 || rol === "4" || rol === 4 ? (
            <>
              {user?.idRol === 1 && user?.idAreaBeneficio || user?.idRol === 4 ?
                <Grid xs={12}>
                  <GraficaMetasArea
                    puesto={ps}
                    area={user?.idAreaBeneficio ? user?.idAreaBeneficio : ''} />
                </Grid>
                : null}
              {user?.idRol === 3 && metaData ?
                <Grid xs={12} sm={6} md={4}>
                  <GraficaMetas data={metaData} />
                </Grid>
                : null}

              {sn === 0 ? (
                <Grid xs={12} sm={6} md={rol === 1 || rol === 4 ? 12 : 8}>
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

                <Grid xs={12} sm={6} md={rol === 1 || rol === 4 ? 12 : 8}>
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

          {/* <Grid xs={12} md={6} lg={4}>
            <AppTopRelated title="Evaluacion de especialistas" list={_appRelated} />
          </Grid> */}

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