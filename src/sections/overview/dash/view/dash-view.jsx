import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';
import { es } from 'date-fns/locale';
import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { alpha, useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { endpoints } from 'src/utils/axios';

import { bgGradient } from 'src/theme/css';
import { useGetCounts } from 'src/api/dash';
import { useAuthContext } from 'src/auth/hooks';
import { useGetCountRespuestas } from 'src/api/encuestas';
import { SeoIllustration } from 'src/assets/illustrations';
import { useGetGeneral, usePostGeneral } from 'src/api/general';
import { useGetMeta, useGetEspecialistasPorArea } from 'src/api/especialistas';

import { useSettingsContext } from 'src/components/settings';

import AppWelcome from '../app-welcome';
import WidgetConteo from '../widget-conteo';
import GraficaMetas from '../grafica-metas';
import EncuestaBarra from '../barra-encuesta';
import GraficaMetasArea from '../grafica-metas-area';
import EncuestaPorcentaje from '../porcentaje-encuesta';

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

  const rol = user?.idRol

  const [areas, setAreas] = useState(0);

  const [fechaI, setFechaI] = useState(diaUnoMes);

  const [fechaF, setFechaF] = useState(ultimoDiaMes);

  useEffect(() => {

    if (user?.idRol === 4) {
      setAreas(158);
    } else if (user?.idRol === 2 || user?.idRol === 3) {
      setAreas(user?.idPuesto);
    }

  }, [user]);

  const [valEsp, setValEsp] = useState({ 
    idData: areas, 
    idRol: user?.idRol, 
    slEs: _es, 
    idUser: user?.idUsuario,
    fhI: fechaI,
    fhF: fechaF 
  });

  useEffect(() => {
    setValEsp({ 
      idData: areas, 
      idRol: user?.idRol, 
      slEs: _es, 
      idUser: user?.idUsuario,
      fhI: fechaI,
      fhF: fechaF, 
    });
  }, [areas, user, _es, fechaI, fechaF]);

  const { preguntaData } = usePostGeneral(areas, endpoints.dashboard.getPregunta, "preguntaData");

  const { especialistasData } = useGetGeneral(endpoints.reportes.especialistas, "especialistasData");

  const { pacientesData } = useGetCounts(valEsp, endpoints.dashboard.getPacientes, "pacientesData");

  const { asistenciaData } = useGetCounts(valEsp, endpoints.dashboard.getCtAsistidas, "asistenciaData");

  const { canceladaData } = useGetCounts(valEsp, endpoints.dashboard.getCtCanceladas, "canceladaData");

  const { penalizadaData } = useGetCounts(valEsp, endpoints.dashboard.getCtPenalizadas, "penalizadaData");

  const { virtualData } = useGetCounts(valEsp, endpoints.dashboard.getCtVirtuales, "virtualData");

  const { presencialData } = useGetCounts(valEsp, endpoints.dashboard.getCtPresenciales, "presencialData");

  const { especialistas } = useGetEspecialistasPorArea({ areas });

  const { meta: metaData } = useGetMeta({ especialista: rol === 4 && _es !== '0' ? _es : user?.idUsuario });

  const [pgDt, setPgDt] = useState('');

  const [dflt, setDflt] = useState('');

  const [pg, setPg] = useState('1');

  const [sn, setSn] = useState('');

  const [idEncuesta, setIdEncuesta] = useState('');

  const [pregunta, setPregunta] = useState([]);

  const [paramRes, setParamRes] = useState([]);

  const [respPreg, setRespPreg] = useState([]);

  const [respDt, setRespDt] = useState([]);

  const handleChangePg = (newPg) => {
    setPregunta(newPg);
  }

  const handleChangeIdPg = (newIdPg) => {
    setPg(newIdPg);
  }

  const [selectPg, setSelectPg] = useState('');

  const { respCountData } = useGetCountRespuestas(dflt, endpoints.dashboard.getCountRespuestas, "respCountData");

  const { respData } = useGetCountRespuestas(paramRes, endpoints.dashboard.getRespuestas, "respData");

  const respArray = respDt.flatMap((i) => (
    JSON.parse(`[${i.respuestas.split(', ').flatMap(value => `"${value}"`).join(', ')}]`
  )));

  const resultArray = respArray.map((respuesta) => {
    const matchingObj = respPreg.find((obj) => obj.respuesta === respuesta);
    return matchingObj ? matchingObj.cantidad : 0;
  });

  const percent = respArray.map((respuesta) => {
    const matchingObj = respPreg.find((obj) => obj.respuesta === respuesta);
    return matchingObj ? matchingObj.porcentaje : 0;
  });

  useEffect(() => {
    setRespPreg(respCountData);
    setRespDt(respData);
  }, [respCountData, respData]);

  useEffect(() => {
    if (preguntaData.length > 0) {
      setIdEncuesta(preguntaData[0]?.idEncuesta)
    }
  }, [preguntaData]);

  useEffect(() => {
    if (especialistas.length !== 0) {
      set_es(especialistas[0]?.idUsuario)
    }
  }, [especialistas]);

  useEffect(() => {
    if (user?.idRol !== 2) {
      if (preguntaData && Array.isArray(pregunta) && pregunta.length === 0) {

        setDflt([{ idPregunta: preguntaData[0]?.idPregunta },
        { idEncuesta: preguntaData[0]?.idEncuesta },
        { idEspecialista: user?.idRol === 3 ? user?.idUsuario : _es },
        { idRol: user?.idRol },
        {fhI: fechaI},
        {fhF: fechaF },
        { respuestas: preguntaData[0]?.respuestas },
        { pregunta: preguntaData[0]?.pregunta }]);

        setParamRes([{ idPregunta: preguntaData[0]?.idPregunta },
        { idEncuesta: preguntaData[0]?.idEncuesta },
        { idArea: preguntaData[0]?.idArea },
        { idRol: user?.idRol }]);

        setSelectPg(preguntaData[0]?.pregunta);

        setPgDt(preguntaData[0]?.respuestas);

      } else if (preguntaData && Array.isArray(pregunta) && pregunta.length > 0) {

        setDflt(pregunta);

        setParamRes(pregunta);

        setSelectPg(pregunta[3]?.pregunta);

        setPgDt(respData[0]?.grupo);

      } else {
        alert("Error")
      }
    }
  }, [
    preguntaData,
    pregunta, 
    respData, 
    user, 
    _es,
    fechaI,
    fechaF
  ]);

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
  }, [preguntaData, pregunta, pgDt]);

  const _dt = {
    percent: (index) => percent[index],
  }

  const _ecommerceSalesOverview = ['No', 'Si'].map(
    (label, index) => ({
      label,
      value: _dt.percent(index) ?? 0,
    })
  );

  const handleChangeArea = useCallback(
    (event) => {
      setAreas(event.target.value);
      set_es('0');
      setPg('');
      setRespPreg([]);
    },
    []
  );

  const handleChangeEsp = useCallback(
    (event) => {
      set_es(event.target.value);
      setPg('');
      setRespPreg([]);
    },
    []
  );

  const [value, setValue] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setValue(new Date()), 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const theme = useTheme();

  const handleFilterStartDate = useCallback(
    (newValue) => {
      const date = new Date(newValue);
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      setFechaI(formattedDate);
      setPg('');
      setRespPreg([]);
    },
    []
  );

  const handleFilterEndDate = useCallback(
    (newValue) => {
      const date = new Date(newValue);
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      setFechaF(formattedDate);
      setPg('');
      setRespPreg([]);
    },
    []
  );

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
                  {especialistas.map((i, index) => (
                    <MenuItem key={index} value={i.idUsuario}>
                      {i.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </>
        ) : (
          null
        )}

        <Grid md={6}>
          <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Fecha inicio"
              value={datePikerI()}
              onChange={handleFilterStartDate}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid md={6}>
          <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Fecha fin"
              value={datePikerF()}
              onChange={handleFilterEndDate}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        </Grid>

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
                  puesto={areas}
                  area={user?.idAreaBeneficio ? user?.idAreaBeneficio : ''} />
              </Grid>
              : null
            }
            {(user?.idRol === 3 && metaData) || (user?.idRol === 4 && _es !== '0' && metaData) ?
              <Grid xs={12} sm={6} md={4}>
                <GraficaMetas data={metaData} />
              </Grid>
              : null}

            {_es !== '0' ? (
              <>
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
                      _es={_es}
                      rol={rol}
                      fechaI={fechaI}
                      fechaF={fechaF}
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
                      _es={_es}
                      fechaI={fechaI}
                      fechaF={fechaF}
                      handleChangeIdPg={handleChangeIdPg}
                    />
                  </Grid>

                )}
              </>
            ) : null}

          </>
        ) : null}

      </Grid>

    </Container>
  );
}