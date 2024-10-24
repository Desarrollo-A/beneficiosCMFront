import Xlsx from 'json-as-xlsx';
import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { useAuthContext } from 'src/auth/hooks';
import { useGetGeneral } from 'src/api/general';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
    useTable,
    emptyRows,
    TableNoData,
    getComparator,
    TableEmptyRows,
    TableHeadCustom,
    TablePaginationCustom,
} from 'src/components/table';

import EncuestasTableRow from '../components/reporte-encuestas/encuestas-table-row';
import EncuestasTableToolbar from '../components/reporte-encuestas/encuestas-table-toolbar';
import EncuestasTableFiltersResult from '../components/reporte-encuestas/encuestas-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
    { id: 'pregunta', label: 'Pregunta' },
    { id: 'respuesta', label: 'Respuesta', width: 300 },
    { id: 'paciente', label: 'Paciente', width: 200 },
    { id: 'correo', label: 'Correo', width: 200 },
    { id: 'sede', label: 'Sede', width: 200 },
    { id: 'area', label: 'Área', width: 200 },
    { id: 'departamento', label: 'Departamento', width: 200 },
    { id: 'beneficio', label: 'Beneficio', width: 200 },
    { id: 'fecha', label: 'Fecha', width: 200 },
    { id: '', width: 88 },
];

const ultimoDiaMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

const currentDate = new Date();
const diaMesUno = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

const defaultFilters = {
    name: '',
    tipoEncuesta: ['Satisfacción'],
    sede: [],
    depto: [],
    area: [],
    beneficio: [],
    pregunta: [],
    fhInicial: diaMesUno,
    fhFinal: ultimoDiaMes
};

// ----------------------------------------------------------------------
function handleDownloadExcel(dataFiltered) {
    // Agrupar datos por paciente, correo, sede, area, depto, y fecha
    const groupedData = dataFiltered.reduce((acc, item) => {
        const key = `${item.paciente}-${item.correo}-${item.sede}-${item.area}-${item.depto}-${item.fecha}`;
        
        if (!acc[key]) {
            acc[key] = {
                paciente: item.paciente,
                correo: item.correo,
                sede: item.sede,
                area: item.area,
                depto: item.depto,
                beneficio: item.beneficio,
                fecha: item.fecha,
                respuestas: {},
            };
        }
        
        // Agregar respuesta a la pregunta correspondiente
        if (!acc[key].respuestas[item.pregunta]) {
            acc[key].respuestas[item.pregunta] = item.respuesta;
        }
        
        return acc;
    }, {});

    // Crear columnas de preguntas y respuestas
    const columns = [
        ...Object.keys(dataFiltered.reduce((acc, item) => {
            acc[item.pregunta] = true;
            return acc;
        }, {})).map(pregunta => ({ label: pregunta, value: pregunta })),
        { label: "Paciente", value: "paciente" },
        { label: "Correo", value: "correo" },
        { label: "Sede", value: "sede" },
        { label: "Área", value: "area" },
        { label: "Departamento", value: "depto" },
        { label: "Beneficio", value: "beneficio" },
        { label: "Fecha", value: "fecha" },
    ];

    // Generar contenido para Excel
    const content = Object.values(groupedData).map(item => {
        const row = {
            paciente: item.paciente,
            correo: item.correo,
            sede: item.sede,
            area: item.area,
            depto: item.depto,
            beneficio: item.beneficio,
            fecha: item.fecha,
        };

        // Colocar las respuestas en las columnas correctas
        Object.keys(item.respuestas).forEach(pregunta => {
            row[pregunta] = item.respuestas[pregunta];
        });

        return row;
    });

    const data = [
        {
            sheet: "Reporte encuestas",
            columns,
            content,
        },
    ];

    const settings = {
        fileName: "Reporte encuestas",
        extraLength: 3,
        writeMode: "writeFile",
        writeOptions: {},
        RTL: false,
    };

    Xlsx(data, settings);
}

// ----------------------------------------------------------------------

export default function ReporteEncuestasView() {

    const table = useTable();

    const settings = useSettingsContext();

    const router = useRouter();

    const confirm = useBoolean();

    const { user } = useAuthContext();

    const rol = user?.idRol;

    const idUs = user?.idUsuario;

    const [typeusersData, setTypeusersData] = useState(2);

    const { beneficiosData } = useGetGeneral(endpoints.reportes.especialistas, "beneficiosData");

    const { encData } = useGetGeneral(endpoints.reportes.getEncuestasContestadas, "encData");

    const { sdData } = useGetGeneral(endpoints.reportes.getSedes, "sdData");

    const { deptoData } = useGetGeneral(endpoints.reportes.getDepartamentos, "deptoData");

    const { areaData } = useGetGeneral(endpoints.reportes.getAreas, "areaData");

    const [tableData, setTableData] = useState([]);

    const [filters, setFilters] = useState(defaultFilters);

    const _bn = beneficiosData.flatMap((es) => (es.nombre));

    const _enc = ['Satisfacción', 'Cancelación', 'Reagenda', 'Primera sesión'];

    const _sede = sdData.flatMap((es) => (es.sede));

    const _depto = deptoData.flatMap((es) => (es.ndepto));

    const _areas = areaData.flatMap((es) => (es.narea));

    const dataFiltered = applyFilter({
        inputData: tableData,
        comparator: getComparator(table.order, table.orderBy),
        filters,
    });

    const dataInPage = dataFiltered.slice(
        table.page * table.rowsPerPage,
        table.page * table.rowsPerPage + table.rowsPerPage
    );

    const denseHeight = table.dense ? 52 : 72;

    const canReset = !isEqual(defaultFilters, filters);

    const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

    const handleFilters = useCallback(
        (name, value) => {
            table.onResetPage();
            setFilters((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        },
        [table]
    );

    const handleDeleteRow = useCallback(
        (id) => {
            const deleteRow = tableData.filter((row) => row.id !== id);
            setTableData(deleteRow);

            table.onUpdatePageDeleteRow(dataInPage.length);
        },
        [dataInPage.length, table, tableData]
    );

    const handleDeleteRows = useCallback(() => {
        const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
        setTableData(deleteRows);

        table.onUpdatePageDeleteRows({
            totalRows: tableData.length,
            totalRowsInPage: dataInPage.length,
            totalRowsFiltered: dataFiltered.length,
        });
    }, [dataFiltered.length, dataInPage.length, table, tableData]);

    const handleEditRow = useCallback(
        (id) => {
            router.push(paths.dashboard.user.edit(id));
        },
        [router]
    );

    const handleResetFilters = useCallback(() => {
        setFilters(defaultFilters);
    }, []);

    useEffect(() => {
        setTableData(encData);
    }, [encData]);

    const handleExcel = async e => {
        e.preventDefault();
        handleDownloadExcel(
            dataFiltered
        );
    }

    const handleChangeTypeUsers = (newData) => {
        setTypeusersData(newData);
    }

    return (
        <>
            <Container maxWidth={settings.themeStretch ? false : 'lg'}>
                <CustomBreadcrumbs
                    heading="Encuestas contestadas"
                    links={[
                        { name: 'Reportes' },
                        { name: 'Encuestas' },
                    ]}
                    sx={{
                        mb: { xs: 3, md: 5 },
                    }}
                />

                <Card>

                    <EncuestasTableToolbar
                        filters={filters}
                        onFilters={handleFilters}
                        //
                        beneOptions={_bn}
                        encOptions={_enc}
                        sedeOptions={_sede}
                        deptoOptions={_depto}
                        areasOptions={_areas}
                        rol={rol}
                        table={table}
                        handleChangeTypeUsers={handleChangeTypeUsers}
                    />

                    {canReset && (
                        <EncuestasTableFiltersResult
                            filters={filters}
                            onFilters={handleFilters}
                            //
                            onResetFilters={handleResetFilters}
                            //
                            results={dataFiltered.length}
                            sx={{ p: 2.5, pt: 0 }}
                            rol={rol}
                        />
                    )}

                    <Stack
                        spacing={1}
                        alignItems={{ xs: 'flex-start', md: 'flex-start' }}
                        direction={{
                            xs: 'column',
                            md: 'row',
                        }}
                        sx={{
                            p: 1,
                            pr: { xs: 1, md: 1 },
                        }}
                    >
                        <Tooltip title="Exportar a XLS" placement="top" arrow>
                            <MenuItem
                                sx={{ width: 50, p: 1 }}
                                onClick={handleExcel}
                            >
                                <Iconify icon="teenyicons:xls-outline" />
                            </MenuItem>
                        </Tooltip>

                    </Stack>

                    <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>

                        <Scrollbar>
                            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                                <TableHeadCustom
                                    order={table.order}
                                    orderBy={table.orderBy}
                                    headLabel={TABLE_HEAD}
                                    rowCount={tableData.length}
                                    numSelected={table.selected.length}
                                    onSort={table.onSort}
                                />

                                <TableBody>
                                    {dataFiltered
                                        .slice(
                                            table.page * table.rowsPerPage,
                                            table.page * table.rowsPerPage + table.rowsPerPage
                                        )
                                        .map((row, index) => (
                                            <EncuestasTableRow
                                                key={index}
                                                row={row}
                                                idUs={idUs}
                                                rol={rol}
                                                selected={table.selected.includes(row.id)}
                                                onSelectRow={() => table.onSelectRow(row.id)}
                                                onDeleteRow={() => handleDeleteRow(row.id)}
                                                onEditRow={() => handleEditRow(row.id)}
                                                typeusersData={typeusersData}
                                            />
                                        ))}

                                    <TableEmptyRows
                                        height={denseHeight}
                                        emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                                    />

                                    <TableNoData notFound={notFound} />
                                </TableBody>
                            </Table>
                        </Scrollbar>
                    </TableContainer>

                    <TablePaginationCustom
                        count={dataFiltered.length}
                        page={table.page}
                        rowsPerPage={table.rowsPerPage}
                        onPageChange={table.onChangePage}
                        onRowsPerPageChange={table.onChangeRowsPerPage}
                    //
                    />
                </Card>
            </Container>

            <ConfirmDialog
                open={confirm.value}
                onClose={confirm.onFalse}
                title="Delete"
                content={
                    <>
                        Are you sure want to delete <strong> {table.selected.length} </strong> items?
                    </>
                }
                action={
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                            handleDeleteRows();
                            confirm.onFalse();
                        }}
                    >
                        Delete
                    </Button>
                }
            />
        </>
    );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
    const { name, tipoEncuesta, sede, depto, area, beneficio, pregunta, fhInicial, fhFinal } = filters; // status, role

    const stabilizedThis = inputData.map((el, index) => [el, index]);

    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });

    inputData = stabilizedThis.map((el) => el[0]);

    if (name) {
        inputData = inputData.filter(
            (user) =>
                (user.pregunta && user.pregunta.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
                (user.respuesta && user.respuesta.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
                (user.correo && user.correo.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
                (user.paciente && user.paciente.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1)
        );
    }

    if (tipoEncuesta?.length) {
        inputData = inputData.filter((i) => tipoEncuesta.includes(i?.tipoEncuesta));
    }

    if (sede?.length) {
        inputData = inputData.filter((i) => sede.includes(i?.sede));
    }

    if (depto?.length) {
        inputData = inputData.filter((i) => depto.includes(i?.depto));
    }

    if (area?.length) {
        inputData = inputData.filter((i) => area.includes(i?.area));
    }

    if (beneficio?.length) {
        inputData = inputData.filter((i) => beneficio.includes(i?.beneficio));
    }

    if (pregunta?.length) {
        inputData = inputData.filter((i) => pregunta.includes(i?.pregunta));
    }
    
    const fhInicialDate = new Date(fhInicial.getFullYear(), fhInicial.getMonth(), fhInicial.getDate());
    const fhFinalDate = new Date(fhFinal.getFullYear(), fhFinal.getMonth(), fhFinal.getDate());

    if (fhInicial && fhFinal) {
        inputData = inputData.filter((i) => {

            const [day, month, year] = i.fecha.split('/');
            const fechaRegistro = new Date(year, month - 1, day); 

            return fechaRegistro.getTime() >= fhInicialDate.getTime() &&
                fechaRegistro.getTime() <= fhFinalDate.getTime();
        });
    }

    return inputData;
}
