import JsPDF from 'jspdf';
import Xlsx from 'json-as-xlsx';
import isEqual from 'lodash/isEqual';
import autoTable from 'jspdf-autotable';
import { useRef, useState, useEffect, useCallback } from 'react';

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

import uuidv4 from "src/utils/uuidv4";
import { endpoints } from 'src/utils/axios';

import { useGetGeneral } from 'src/api/general';
import { useGetReportes } from 'src/api/reportes';

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

import FilasTabla from '../filas-tabla-citas';
import FiltrosTabla from '../filtros-tabla-citas';
import BarraTareasTabla from '../barratareas-tabla-citas';

// ----------------------------------------------------------------------

const defaultFilters = {
  name: '',
  area: [],
  estatus: 'all',
};

// ----------------------------------------------------------------------
const doc = new JsPDF();

function handleDownloadExcel(tableData, rol) {
  
  let data = [];

  const baseArray = [
    {
      sheet: "Historial Reportes",
      columns: [
        { label: "ID Cita", value: "idCita" },
        { label: "Especialista", value: "idEspecialista" },
        { label: "Paciente", value: "idPaciente" },
        { label: "Oficina", value: "oficina" },
        { label: "Departamento", value: "departamento" },
        { label: "Sede", value: "sede" },
        { label: "Sexo", value: "sexo" },
        { label: "Motivo Consulta", value: "motivo" },
        { label: "Estatus", value: "estatus" },
        { label: "Fecha Inicio", value: "fechaInicio" },
        { label: "Fecha Final", value: "fechaFinal" },
      ],
      content: tableData,
    },
  ];

  if (rol === 1) {
    const arr = baseArray[0].columns;
    arr.splice(1, 1);

    data = [
      {
        sheet: "Historial Reportes",
        columns: arr,
        content: tableData,
      },
    ];

  } else if (rol === 2) {
    const arr = baseArray[0].columns;
    arr.splice(2, 1);

    data = [
      {
        sheet: "Historial Reportes",
        columns: arr,
        content: tableData,
      },
    ];

  } else {
    data = baseArray;
  }

  const settings = {
    fileName: "Historial Reportes",
    extraLength: 3,
    writeMode: "writeFile",
    writeOptions: {},
    RTL: false,
  }
  Xlsx(data, settings)
}

function handleDownloadPDF(tableData, header, rol) {

  let data = [];

  if (rol === 1) {
    data = tableData.map(item => ([item.idCita, item.idPaciente,
    item.area, item.estatus, item.fechaInicio, item.fechaFinal]))
  }
  else if (rol === 2) {
    data = tableData.map(item => ([item.idCita, item.idEspecialista,
    item.area, item.estatus, item.fechaInicio, item.fechaFinal]))
  } else {
    data = tableData.map(item => ([item.idCita, item.idEspecialista, item.idPaciente,
    item.area, item.estatus, item.fechaInicio, item.fechaFinal]))
  }

  autoTable(doc, {
    head: [header],
    body: data,
  })
  doc.save('Historial Reportes.pdf')
}
// ----------------------------------------------------------------------
export default function HistorialReportesView() {

  // const datosUser = JSON.parse(Base64.decode(sessionStorage.getItem('accessToken').split('.')[2]));

  // console.log(datosUser.idRol)

  const rol = 3;

  let TABLE_HEAD = [];

  let header = [];

  const headerBase = ["ID Cita", "Especialista", "Paciente", "Oficina", "Departamento", "Sede", "Sexo", "Motivo Consulta", "Estatus",
    "Fecha Inicio", "Fecha Final"];

  const [dataValue, setReportData] = useState('Reporte General');

  const { reportesData } = useGetReportes(dataValue);

  const { especialistasData } = useGetGeneral(endpoints.reportes.especialistas, "especialistasData");

  const [datosTabla, setDatosTabla] = useState([]);

  const [especialistas, setEspecialistas] = useState([]);

  const [tableData, setTableData] = useState([]);

  const _rp = especialistas.flatMap((es) => (es.nombre));

  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [filters, setFilters] = useState(defaultFilters);

  const TABLE_BASE = [
    { id: '', label: 'ID Cita' },
    { id: '', label: 'Especialista' },
    { id: '', label: 'Paciente' },
    { id: '', label: 'Oficina' },
    { id: '', label: 'Departamento' },
    { id: '', label: 'Sede' },
    { id: '', label: 'Sexo' },
    { id: '', label: 'Motivo Consulta' },
    { id: '', label: 'Estatus' },
    { id: '', label: 'Fecha Inicio' },
    { id: '', label: 'Fecha Final' },
    { id: '', width: 88 },
  ];

  if (rol === 1) {

    TABLE_BASE.splice(1, 1);
    headerBase.splice(1, 1);

    TABLE_HEAD = TABLE_BASE;
    header = headerBase;

  } else if (rol === 2) {

    TABLE_BASE.splice(2, 1);
    headerBase.splice(2, 1);

    TABLE_HEAD = TABLE_BASE;
    header = headerBase;

  } else {
    TABLE_HEAD = TABLE_BASE;
    header = headerBase;
  }

  const dataFiltered = applyFilter({
    inputData: datosTabla,
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

  const targetRef = useRef();

  const handleExcel = async e => {
    e.preventDefault();
    handleDownloadExcel(
      tableData,
      rol
    );
  }
  
  const handlePdf = async e => {
    e.preventDefault();
    handleDownloadPDF(
      tableData,
      header,
      rol
    );
  }

  const handleChangeReport = (newData) => {
    setReportData(newData);
  }

  useEffect(() => {
    if (reportesData.length) {
      setDatosTabla(reportesData);
    }
  }, [reportesData]);

  useEffect(() => {
    if (especialistasData.length) {
      setEspecialistas(especialistasData);
    }
  }, [especialistasData]);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Historial Reportes"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Reportes'/* , href: paths.dashboard.user.root */ },
            { name: 'Historial' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>

          <BarraTareasTabla
            filters={filters}
            onFilters={handleFilters}
            //
            roleOptions={_rp}
            handleChangeReport={handleChangeReport}
            table={table}
          />

          {canReset && (
            <FiltrosTabla
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
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

            <Tooltip title="Exportar a PDF" placement="top" arrow>
            <MenuItem
              sx={{ width: 50, p: 1 }}
              onClick={handlePdf}
            >
              <Iconify icon="teenyicons:pdf-outline" />
            </MenuItem>
            </Tooltip>

          </Stack>

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }} >
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }} ref={targetRef}>
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
                    .map((row) => (
                      <FilasTabla
                        key={`route_${uuidv4()}`}
                        row={row}
                        selected={table.selected.includes(row.idCita)}
                        onSelectRow={() => table.onSelectRow(row.idCita)}
                        onDeleteRow={() => handleDeleteRow(row.idCita)}
                        onEditRow={() => handleEditRow(row.idCita)}
                        rol={rol}
                        rel={handleChangeReport}
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
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Eliminar"
        content={
          <>
            Estas seguro de eliminar <strong> {table.selected.length} </strong> items?
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
            Eliminar
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { name, area } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (cita) =>
        cita.idCita.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        cita.estatus.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        cita.area.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        cita.idEspecialista.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        cita.idPaciente.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (area.length) {
    inputData = inputData.filter((cita) => area.includes(cita.area));
  }

  return inputData;
}