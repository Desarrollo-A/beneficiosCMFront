import PropTypes from 'prop-types';
import { es } from 'date-fns/locale';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import ButtonBase from '@mui/material/ButtonBase';
import CardHeader from '@mui/material/CardHeader';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { endpoints } from 'src/utils/axios';

import { usePostGeneral } from 'src/api/general';
import { useGetCountRespuestas } from 'src/api/encuestas';
import { MotivationIllustration } from 'src/assets/illustrations';

import Iconify from 'src/components/iconify';
import Chart, { useChart } from 'src/components/chart';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import GraficaNone from './grafica-none';

// ----------------------------------------------------------------------

/* function handleDownloadExcel(chart, title) {

    const respuestas = chart.categories

    const resultados = chart.series[0].data[0].data;

    const data = [
        {
            sheet: "",
            columns: respuestas.map((label, index) => ({ label, value: index.toString() })),
            content: [resultados.reduce((obj, value, index) => ({ ...obj, [index.toString()]: value.toString() }), {})]
        }
    ];

    const settings = {
        fileName: title,
        extraLength: 3,
        writeMode: "writeFile",
        writeOptions: {},
        RTL: false,
    }
    Xlsx(data, settings)
} */

// ----------------------------------------------------------------------

export default function GraficaEncuestas({
    title,

    beneficios,
    especialistas,
    diaUnoMes,
    ultimoDiaMes,
    datePikerI,
    datePikerF,
    rol,
    puesto,
    id,
    ...other
}) {

    const [seriesData, setSeriesData] = useState('data');

    const [fechaI, setFechaI] = useState(diaUnoMes);

    const [fechaF, setFechaF] = useState(ultimoDiaMes);

    const fhI = new Date(fechaI);

    const fhF = new Date(fechaF);

    const [areas, setAreas] = useState(rol === 3 ? puesto : 158);

    const [_es, set_es] = useState(rol === 3 ? id : '0');

    const [paramRes, setParamRes] = useState([]);

    const [paramResCount, setParamResCount] = useState('');

    const [respDt, setRespDt] = useState([]);

    const [respPreg, setRespPreg] = useState([]);

    const { preguntaData } = usePostGeneral(areas, endpoints.dashboard.getPregunta, "preguntaData");

    const [pregunta, setPregunta] = useState(0);

    useEffect(() => {
        if (preguntaData[0]?.idPregunta !== undefined) {
            setPregunta(preguntaData[0]?.idPregunta)
        }
    }, [preguntaData]);

    const handleFilterStartDate = useCallback(
        (newValue) => {
            const date = new Date(newValue);
            const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            setFechaI(formattedDate);
        },
        []
    );

    const handleFilterEndDate = useCallback(
        (newValue) => {
            const date = new Date(newValue);
            const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            setFechaF(formattedDate);
        },
        []
    );

    const handleChangeSct = useCallback(
        (e) => {

            setPregunta(e.target.value);
        },
        []
    );

    const { respData } = useGetCountRespuestas(paramRes, endpoints.dashboard.getRespuestas, "respData");

    useEffect(() => {
        if (preguntaData.length > 0) {
            setParamRes([
                { idPregunta: pregunta },
                { idEncuesta: preguntaData[0]?.idEncuesta },
                { idArea: areas },
                { idRol: rol }
            ]);
        }
    }, [preguntaData, rol, pregunta, areas]);

    useEffect(() => {
        if (preguntaData.length > 0) {
            setParamResCount([
                { idPregunta: pregunta },
                { idEncuesta: preguntaData[0]?.idEncuesta },
                { idEspecialista: _es },
                { idRol: rol },
                { fhI: fechaI },
                { fhF: fechaF },
                { idArea: areas }
            ]);
        }
    }, [preguntaData, rol, pregunta, areas, fechaI, fechaF, _es, id]);

    const handleChangeArea = useCallback(
        (event) => {
            setAreas(event.target.value);
        },
        []
    );

    const handleChangeEsp = useCallback(
        (event) => {
            set_es(event.target.value);
        },
        []
    );

    const { respCountData } = useGetCountRespuestas(paramResCount, endpoints.dashboard.getCountRespuestas, "respCountData");

    const respArray = respDt.flatMap((i) => (
        JSON.parse(`[${i.respuestas.split(', ').flatMap(value => `"${value}"`).join(', ')}]`
        )));

    const resultArray = respArray.map((respuesta) => {
        const matchingObj = respPreg.find((obj) => obj.respuesta === respuesta);
        return matchingObj ? matchingObj.cantidad : 0;
    });

    useEffect(() => {
        setRespPreg(respCountData);
        setRespDt(respData);
    }, [respCountData, respData]);

    const categories = respArray;


    const series = [{
        type: 'data',
        data: [
            {
                name: 'Total',
                data: resultArray,
            }
        ],
    },
    ];

    const popover = usePopover();

    const chartOptions = useChart({
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent'],
        },
        xaxis: {
            categories,
        },
        tooltip: {
            y: {
                formatter: (value) => `${value}`,
            },
        },
    });

    const handleChangeSeries = useCallback(
        (newValue) => {
            popover.onClose();
            setSeriesData(newValue);
        },
        [popover,]
    );

    /* const handleExcel = async e => {
        e.preventDefault();
        handleDownloadExcel(
            chart,
            title
        );
    } */

    return (
        <>
            <Card {...other}>

                <CardHeader title={title} />

                <Grid container spacing={2} sx={{ p: 6.5 }}>

                    {rol !== 3 ? (
                        <>
                            <Grid md={6} xs={12}>
                                <FormControl sx={{
                                    width: "100%",
                                    pr: { xs: 1, md: 1 },
                                }}>
                                    <InputLabel id="demo-simple-select-label">Beneficio</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={!areas ? '' : areas}
                                        label="Beneficio"
                                        onChange={(e) => handleChangeArea(e)}
                                    >
                                        {beneficios.map((i, index) => (
                                            <MenuItem key={index} value={i.idPuesto}>
                                                {i.nombre}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid md={6} xs={12}>
                                <FormControl sx={{
                                    width: "100%",
                                    pr: { xs: 1, md: 1 },
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

                    <Grid md={6} xs={12}>
                        <FormControl sx={{
                            width: "100%",
                            pr: { xs: 1, md: 1 },
                        }}>
                            <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Fecha inicio"
                                    value={datePikerI()}
                                    maxDate={fhF.setDate(fhF.getDate() + 1)}
                                    onChange={handleFilterStartDate}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                        </FormControl>
                    </Grid>

                    <Grid md={6} xs={12}>
                        <FormControl sx={{
                            width: "100%",
                            pr: { xs: 1, md: 1 },
                        }}>
                            <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Fecha fin"
                                    minDate={fhI}
                                    value={datePikerF()}
                                    onChange={handleFilterEndDate}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </LocalizationProvider>
                        </FormControl>
                    </Grid>

                    <Grid md={12} xs={12}>
                        <FormControl sx={{
                            width: "100%",
                            pr: { xs: 1, md: 1 },
                        }}>
                            <InputLabel id="demo-simple-select-label">Pregunta</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                label="Pregunta"
                                value={pregunta}
                                onChange={(e) => handleChangeSct(e)}
                            >
                                {preguntaData.map((i) => (
                                    <MenuItem key={i.idPregunta} value={i.idPregunta}>
                                        {i.pregunta}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                </Grid>

                {/* <Tooltip title="Exportar XLS" placement="top" arrow>
                    <MenuItem
                        sx={{ width: 50, ml: 2, mt: 2 }}
                        onClick={handleExcel}
                    >
                        <Iconify
                            icon="teenyicons:xls-outline"
                            width={24} />
                    </MenuItem>
                </Tooltip> */}

                <CardHeader
                    action={
                        <ButtonBase
                            style={{ display: 'none' }}
                            onClick={popover.onOpen}
                            sx={{
                                pl: 1,
                                py: 0.5,
                                pr: 0.5,
                                borderRadius: 1,
                                typography: 'subtitle2',
                                bgcolor: 'background.neutral',
                            }}
                        >
                            {seriesData}

                            <Iconify
                                width={16}
                                icon={popover.open ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
                                sx={{ ml: 0.5 }}
                            />
                        </ButtonBase>
                    }
                />

                {respCountData.length !== 0 ? (
                    <>
                        {series.map((item) => (
                            <Box key={item.type} sx={{ mt: 3, mx: 3 }}>
                                {item.type === seriesData && (
                                    <Chart
                                        dir="ltr"
                                        type="bar"
                                        series={item.data}
                                        options={chartOptions}
                                        width="100%"
                                        height={364}
                                    />
                                )}
                            </Box>
                        ))}
                    </>
                ) : (
                    <GraficaNone
                        title='No hay encuestas contestadas'
                        img={<MotivationIllustration />}
                    />
                )}
            </Card>

            <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 140 }}>
                {series.map((option) => (
                    <MenuItem
                        key={option.type}
                        selected={option.type === seriesData}
                        onClick={() => handleChangeSeries(option.type)}
                    >
                        {option.type}
                    </MenuItem>
                ))}
            </CustomPopover>
        </>
    );
}

GraficaEncuestas.propTypes = {
    title: PropTypes.string,
    beneficios: PropTypes.any,
    especialistas: PropTypes.any,
    diaUnoMes: PropTypes.any,
    ultimoDiaMes: PropTypes.any,
    datePikerI: PropTypes.any,
    datePikerF: PropTypes.any,
    rol: PropTypes.any,
    puesto: PropTypes.any,
    id: PropTypes.any,
};
