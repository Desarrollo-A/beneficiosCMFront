
import { Base64 } from 'js-base64';
import { useState, useEffect } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { endpoints } from 'src/utils/axios';

import { useGetGeneral, usePostGeneral } from 'src/api/general';

import { useSettingsContext } from 'src/components/settings';

/* import WidgetSumas from '../widget-sumas';
import GraficaArea from '../grafica-area';
import GraficaPastel from '../grafica-pastel';
import GraficaBarras from '../grafica-barras'; */
import EncuestaBarra from '../barra-encuesta';
import EncuestaPorcentaje from '../porcentaje-encuesta';

// ----------------------------------------------------------------------

export default function DashView() {

  /* const { email } = useGetGeneral(endpoints.encuestas.sendMail, "email");

  console.log(email); */

  const user = JSON.parse(Base64.decode(sessionStorage.getItem('accessToken').split('.')[2]));

  const { preguntaData } = usePostGeneral(user.puesto, endpoints.dashboard.getPregunta, "preguntaData");

  const { encValidData } = usePostGeneral(user.puesto, endpoints.encuestas.getValidEncContestada, "encValidData");

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
    <>
      {encValidData === true ? (

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

            {sn === 0 ? (
              <Grid xs={12} md={6} lg={12}>
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
                  idArea={user.puesto}
                  handleChangeIdPg={handleChangeIdPg}
                />
              </Grid>

            ) : (

              <Grid xs={12} md={6} lg={12}>
                <EncuestaPorcentaje
                  idPregunta={pg}
                  data={_ecommerceSalesOverview}
                  user={user}
                  handleChangePg={handleChangePg}
                  selectPg={selectPg}
                  idEncuesta={idEncuesta}
                  idArea={user.puesto}
                  handleChangeIdPg={handleChangeIdPg}
                />
              </Grid>

            )}

            {/* <Grid xs={12} md={4}>
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
        */}

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

            {/* {prgSnData.map((i) => (
          <Grid xs={12} md={6} lg={6}>

            <EncuestaPorcentaje
              title={i.pregunta}
              chart={{
                series: [
                  { label: 'Si', value: 3 },
                  { label: 'No', value: 7 },
                ],
              }}
            />
          </Grid>
        ))} */}

            {/*   {prgSnData.map((i) => (
          <Grid xs={12} md={6} lg={6}>
            <EcommerceSaleByGender
              title={i.pregunta}
              total={20}
              chart={{
                series: [
                  { label: 'Si', value: 66 },
                  { label: 'No', value: 33 },
                ],
              }}
            />
          </Grid>
        ))} */}

            {/* {prgData.map((i) => (
          <Grid xs={12} md={6} lg={12}>
            <EncuestaBarra
              title={i.pregunta}
              chart={{
                categories: JSON.parse(`[${i.respuestas.split(', ').map(value => `"${value}"`).join(', ')}]`),
                series: [
                  {
                    type: 'data',
                    data: [
                      {
                        name: 'Total',
                        data: [76, 42, 29, 0, 27],
                      }
                    ],
                  },
                ],
              }}
            />
          </Grid>
        ))} */}

          </Grid>
        </Container>

      ) : (

        <Typography variant="subtitle2">
          Sin registros
        </Typography>

      )}

    </>
  );
}