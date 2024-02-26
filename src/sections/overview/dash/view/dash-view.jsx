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
import { useModalidad } from 'src/api/dash';
import { useAuthContext } from 'src/auth/hooks';
import { usePostSelect } from 'src/api/reportes';
import { useGetMeta } from 'src/api/especialistas';
import { SeoIllustration } from 'src/assets/illustrations';
import { useGetGeneral, usePostGeneral } from 'src/api/general';

import { useSettingsContext } from 'src/components/settings';

import AppWelcome from '../app-welcome';
import WidgetConteo from '../widget-conteo';
import GraficaMetas from '../grafica-metas';
import EncuestaBarra from '../barra-encuesta';
import GraficaMetasArea from '../grafica-metas-area';
import EncuestaPorcentaje from '../porcentaje-encuesta';

// ----------------------------------------------------------------------

export default function DashView() {

  const { user } = useAuthContext();

  const settings = useSettingsContext();

  const [_es, set_es] = useState('0');

  const rol = user?.idRol
  let puestos = 0;

  if (rol === 4) {
    puestos = 158;
  } else if (rol === 2 || rol === 3) {
    puestos = user?.idPuesto;
  }

  const [areas, setAreas] = useState(puestos);

  const [ps, setPs] = useState(158);

  const [valEsp, setValEsp] = useState({idData: ps, idRol: user?.idRol, slEs: _es, idUser: user?.idUsuario});

  useEffect(() => {
    setValEsp({idData: ps, idRol: user?.idRol, slEs: _es, idUser: user?.idUsuario});
  }, [ps, user, _es]);

  const { preguntaData } = usePostGeneral(areas, endpoints.dashboard.getPregunta, "preguntaData");

  const { especialistasData } = useGetGeneral(endpoints.reportes.especialistas, "especialistasData");

  const { pacientesData } = usePostGeneral(valEsp, endpoints.dashboard.getPacientes, "pacientesData");

  const { asistenciaData } = usePostGeneral(valEsp, endpoints.dashboard.getCtAsistidas, "asistenciaData");

  const { canceladaData } = usePostGeneral(valEsp, endpoints.dashboard.getCtCanceladas, "canceladaData");

  const { penalizadaData } = usePostGeneral(valEsp, endpoints.dashboard.getCtPenalizadas, "penalizadaData");

  const { virtualData } = useModalidad(valEsp, endpoints.dashboard.getCtVirtuales, "virtualData");

  const { presencialData } = useModalidad(valEsp, endpoints.dashboard.getCtPresenciales, "presencialData");

  const { espData } = usePostSelect(ps, endpoints.gestor.getEsp, "espData");

  const { meta: metaData } = useGetMeta({ especialista: rol === 4 && _es !== '0' ? _es : user?.idUsuario });

  const [pgDt, setPgDt] = useState('');

  const [dflt, setDflt] = useState('');

  const [pg, setPg] = useState('1');

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
  }, [preguntaData]);

  useEffect(() => {

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
  }, [preguntaData, pregunta, respData]);

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

    set_es('0')

  };

  const handleChangeEsp = (event) => {

    set_es(event.target.value);

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
                width: '90%'
              }}
            >
              <Clock value={value} />
            </Card>
          </Grid>

          {rol === "4" || rol === 4 ? (
            <>
              <Grid md={6}>
                <FormControl sx={{
                  width: "100%",
                }}>
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
              </Grid>

              <Grid md={6}>
                <FormControl sx={{
                  width: "100%",
                }}>
                  <InputLabel id="demo-simple-select-label">Especialista</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={_es}
                    label="Especialista"
                    onChange={(e) => handleChangeEsp(e)}
                  >
                    <MenuItem value='0'>
                        Todos
                    </MenuItem>
                    {espData.map((i, index) => (
                      <MenuItem key={index} value={i.idUsuario}>
                        {i.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          ) : (

            <>
            </>

          )}

          {pacientesData.map((i, index) => (
            <Grid xs={12} sm={6} md={2} key={index}>
              <WidgetConteo
                title={rol === '2' || rol === 2 ? 'Total citas' : 'Total pacientes'}
                total={i.pacientes}
                color="info"
                icon={<img alt="icon" src={`${import.meta.env.BASE_URL}assets/icons/glass/usuario.png`} />}
              />
            </Grid>
          ))}

          {asistenciaData.map((i, index) => (
            <Grid xs={12} sm={6} md={2} key={index}>
              <WidgetConteo
                title="Total citas asistidas"
                total={i.asistencia}
                sx={{ backgroundColor: "#DDFAD7" }}
                icon={<img alt="icon" src={`${import.meta.env.BASE_URL}assets/icons/glass/check.png`} />}
              />
            </Grid>
          ))}

          {canceladaData.map((i, index) => (
            <Grid xs={12} sm={6} md={2} key={index}>
              <WidgetConteo
                title="Total citas canceladas"
                total={i.cancelada}
                color="warning"
                icon={<img alt="icon" src={`${import.meta.env.BASE_URL}assets/icons/glass/cancelar.png`} />}
              />
            </Grid>
          ))}

          {penalizadaData.map((i, index) => (
            <Grid xs={12} sm={6} md={2} key={index}>
              <WidgetConteo
                title="Total citas penalizadas"
                total={i.penalizada}
                color="error"
                icon={<img alt="icon" src={`${import.meta.env.BASE_URL}assets/icons/glass/dolar.png`} />}
              />
            </Grid>
          ))}

          {virtualData.map((i, index) => (
            <Grid xs={12} sm={6} md={2} key={index}>
              <WidgetConteo
                title="Total citas virtuales"
                total={i.virtual}
                sx={{ backgroundColor: "#E5D7FA" }}
                icon={<img alt="icon" src={`${import.meta.env.BASE_URL}assets/icons/glass/virtual.png`} />}
              />
            </Grid>
          ))}

          {presencialData.map((i, index) => (
            <Grid xs={12} sm={6} md={2} key={index}>
              <WidgetConteo
                title="Total citas presenciales"
                total={i.presencial}
                sx={{ backgroundColor: "#D7E4FA" }}
                icon={<img alt="icon" src={`${import.meta.env.BASE_URL}assets/icons/glass/ubicacion.png`} />}
              />
            </Grid>
          ))}

          {rol === 1 || rol === 3 || rol === 4 ? (
            <>
              {user?.idRol === 1 && user?.idAreaBeneficio || (user?.idRol === 4 && _es === '0') ?
                <Grid xs={12}>
                  <GraficaMetasArea
                    puesto={ps}
                    area={user?.idAreaBeneficio ? user?.idAreaBeneficio : ''} />
                </Grid>
                : null
              }
              {(user?.idRol === 3 && metaData) || (user?.idRol === 4 && _es !== '0' && metaData)?
                <Grid xs={12} sm={6} md={4}>
                  <GraficaMetas data={metaData} />
                </Grid>
                : null}

              {sn === 0 ? (
                <Grid xs={12} sm={6} md={(rol === 4 && _es !== '0' ? 8 : 12) || (rol === 4 && _es === '0' ? 12 : 8)}>
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

                <Grid xs={12} sm={6} md={(rol === 4 && _es !== '0' ? 8 : 12) || (user?.idRol === 4 && _es !== '0' ? 12 : 8)}>
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
  );
}