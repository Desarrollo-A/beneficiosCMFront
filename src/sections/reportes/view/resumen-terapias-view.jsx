import JsPDF from 'jspdf';
import Xlsx from 'json-as-xlsx';
import isEqual from 'lodash/isEqual';
import autoTable from 'jspdf-autotable';
import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { endpoints } from 'src/utils/axios';

import { useAuthContext } from 'src/auth/hooks';
import { useGetGeneral, usePostGeneral } from 'src/api/general';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
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

import RowResumenTerapias from '../resumen-terapias-components/row-esumen-terapias';
import ToolbarResumenTerapias from '../resumen-terapias-components/toolbar-esumen-terapias';
import FiltersResumenTerapias from '../resumen-terapias-components/filters-resumen-terapias';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
    { id: '', label: 'ID Colaborador' },
    { id: '', label: 'Especialista' },
    { id: '', label: 'Paciente' },
    { id: '', label: 'Oficina' },
    { id: '', label: 'Sede' },
    { id: '', label: 'Sexo' },
    { id: '', label: 'Motivo Consulta' },
    { id: '', label: 'Pago generado' },
    { id: '', label: 'Método de pago' },
    { id: '', label: 'Estatus' },
    { id: '', label: 'Horario cita' },
    { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
  especialista: [],
};

// ----------------------------------------------------------------------

function handleDownloadExcel(tableData, area) {

  const data = [
    {
      sheet: "Resumen Terapias",
      columns: [
        { label: "ID Colaborador", value: "idColab" },
        { label: "Paciente", value: "paciente" },
        { label: "Especialista", value: "especialista" },
        { label: "Horario cita", value: "horario" },
        { label: "Oficina", value: "oficina" },
        { label: "Sede", value: "sede" },
        { label: "Sexo", value: "sexo" },
        { label: "Motivo consulta", value: "motivoCita" },
        { label: "Pago generado", value: "pagoGenerado" },
        { label: "Método de pago", value: "metodoPago" },
        { label: "Estatus", value: "estatus" },
      ],
      content: tableData,
    },
  ];

  const settings = {
    fileName: "Resumen Terapias",
    extraLength: 3,
    writeMode: "writeFile",
    writeOptions: {},
    RTL: false,
  }
  Xlsx(data, settings)
}

const doc = new JsPDF('l', 'pt');

function handleDownloadPDF(tableData, headerBase) {

  let data = [];

  data = tableData.map(item => ([item.idColab, item.especialista, item.paciente, item.oficina, item.sede, item.sexo, item.motivoCita, item.pagoGenerado, item.metodoPago, item.estatus, item.horario  ]))

  autoTable(doc, {
    head: [headerBase],
    body: data,
  })
  doc.save('Resumen Terapias.pdf')
}

// ----------------------------------------------------------------------

export default function ResumenTerapiasView() {

  const headerBase = ["ID Colaborador", "Especialista", "Paciente", "Oficina", "Sede", "Sexo", "Motivo consulta", "Pago Generado", "Método de pago", "Estatus",
    "Horario cita"];

  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const { user } = useAuthContext();

  const rol = user.idRol

  let puestos = 0;

  if (rol === "4" || rol === 4) {
    puestos = 158;
  } else {
    puestos = user.idPuesto;
  }

  const [dataValue, setReportData] = useState('general');

  const [area, setArea] = useState(puestos);

  const { resumenData } = usePostGeneral(dataValue, endpoints.reportes.getResumenTerapias, "resumenData");

  const { especialistasData } = useGetGeneral(endpoints.reportes.getEspeQua, "especialistasData");

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const [especialistas, setEspecialistas] = useState([]);

  const _rp = especialistas.flatMap((es) => (es.nombre));

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
    setTableData(resumenData);
  }, [resumenData]);

  const handleChangeId = (newAr) => {
    setArea(newAr);

    setEspecialistas(especialistasData);
  }

  const handlePdf = async e => {
    e.preventDefault();
    handleDownloadPDF(
      tableData,
      headerBase
    );
  }

  const handleExcel = async e => {
    e.preventDefault();
    handleDownloadExcel(
      tableData,
      area
    );
  }

  const [esp, setEspe] = useState([]);

  const _esp = esp.flatMap((i) => (i.nombre));

  useEffect(() => {
    setEspe(especialistasData);
  }, [
    especialistasData,
  ]);

  const handleChangeReport = (newData) => {
    setReportData(newData);
  }

  return (
    
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Resumen Terapias"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Reportes', /* href: paths.dashboard.user.root */ },
            { name: 'Resumen Terapias' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>

          <ToolbarResumenTerapias
            filters={filters}
            onFilters={handleFilters}
            //
            roleOptions={_rp}
            handleChangeId={handleChangeId}
            rol={rol}
            OptionsEsp={_esp}
            handleChangeReport={handleChangeReport}
            table={table}
          />

          {canReset && (
            <FiltersResumenTerapias
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
                      <RowResumenTerapias
                        key={index}
                        row={row}
                        area={area}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
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
      
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { name, especialista } = filters;

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
        cita.idColab.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        cita.horario.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        cita.estatus.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        cita.area.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        cita.especialista.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        cita.paciente.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        cita.oficina.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1 
    );
  }

  if (especialista.length) {
    inputData = inputData.filter((i) => especialista.includes(i.especialista));
  }

  return inputData;
}
