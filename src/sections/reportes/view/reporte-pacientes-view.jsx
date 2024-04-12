import JsPDF from 'jspdf';
import Xlsx from 'json-as-xlsx';
import isEqual from 'lodash/isEqual';
import autoTable from 'jspdf-autotable';
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
import { useGetGeneral, usePostGeneral } from 'src/api/general';

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

import UserTableRow from '../components/reporte-pacientes/user-table-row';
import UserTableToolbar from '../components/reporte-pacientes/user-table-toolbar';
import UserTableFiltersResult from '../components/reporte-pacientes/user-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'id', label: 'ID' },
  { id: 'nombre', label: 'Nombre', width: 300 },
  { id: 'depto', label: 'Departamento', width: 200 },
  { id: 'sede', label: 'Sede', width: 200 },
  { id: 'puesto', label: 'Puesto', width: 200 },
  { id: 'estatus', label: 'Estatus', width: 200 },
  { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

// ----------------------------------------------------------------------

function handleDownloadExcel(dataFiltered, area) {

  let estatus = "";

  if(area === 158){
    estatus = "estQB";
  }else if(area === 537){
    estatus = "estNut";
  }else if(area === 585){
    estatus = "estPsi";
  }else if(area === 686){
    estatus = "estGE";
  }

  const data = [
    {
      sheet: "Historial Reportes",
      columns: [
        { label: "ID", value: "idUsuario" },
        { label: "Nombre", value: "nombre" },
        { label: "Departamento", value: "depto" },
        { label: "Sede", value: "sede" },
        { label: "Puesto", value: "puesto" },
        { label: "Estatus", value: estatus },
      ],
      content: dataFiltered,
    },
  ];

  const settings = {
    fileName: "Historial Reportes",
    extraLength: 3,
    writeMode: "writeFile",
    writeOptions: {},
    RTL: false,
  }
  Xlsx(data, settings)
}

const doc = new JsPDF();

function handleDownloadPDF(dataFiltered, headerBase) {

  let data = [];

  data = dataFiltered.map(item => ([item.idUsuario, item.nombre, item.depto, item.sede, item.puesto, item.estNut || item.estPsi || item.estQB || item.estGE ]))

  autoTable(doc, {
    head: [headerBase],
    body: data,
  })
  doc.save('Reporte de pacientes.pdf')
}

// ----------------------------------------------------------------------

export default function ReportePacientesView() {

  const headerBase = ["ID", "Nombre", "Departamento", "Sede", "Puesto", "Estatus"];

  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const { user } = useAuthContext();

  const rol = user?.idRol;

  const idUs = user?.idUsuario;

  let puestos = 0;

  if (rol === "4" || rol === 4) {
    puestos = 158;
  } else {
    puestos = user?.idPuesto;
  }

  const [area, setArea] = useState(puestos);

  const [typeusersData, setTypeusersData] = useState(0);

  const [dt, setDt] = useState({
    idRol: user?.idRol,
    esp: area,
    idUs: user?.idUsuario,
    tipoUsuario: typeusersData
  });

  useEffect(() => {
    setDt({
      idRol: user?.idRol,
      esp: area,
      idUs: user?.idUsuario,
      tipoUsuario: typeusersData
    });
  }, [area, user, typeusersData ]);

  const { pacientesData } = usePostGeneral(dt, endpoints.reportes.pacientes, "pacientesData");

  const { especialistasData } = useGetGeneral(endpoints.reportes.especialistas, "especialistasData");

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

  // const handleFilterStatus = useCallback(
  //   (event, newValue) => {
  //     handleFilters('status', newValue);
  //   },
  //   [handleFilters]
  // );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  useEffect(() => {
    setTableData(pacientesData);
  }, [pacientesData]);

  const handleChangeId = (newAr) => {
    setArea(newAr);

    setEspecialistas(especialistasData);
  }

  const handlePdf = async e => {
    e.preventDefault();
    handleDownloadPDF(
      dataFiltered,
      headerBase
    );
  }

  const handleExcel = async e => {
    e.preventDefault();
    handleDownloadExcel(
      dataFiltered,
      area
    );
  }

  const handleChangeTypeUsers = (newData) => {
    setTypeusersData(newData);
  }

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Pacientes"
          links={[
            { name: 'Reportes' },
            { name: 'Pacientes' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>

          <UserTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            roleOptions={_rp}
            handleChangeId={handleChangeId}
            rol={rol}
            table={table}
            handleChangeTypeUsers={handleChangeTypeUsers}
          />

          {canReset && (
            <UserTableFiltersResult
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
                      <UserTableRow
                        key={index}
                        row={row}
                        area={area}
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
  const { name } = filters; // status, role

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
        user?.nombre.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        user?.sede.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        user?.correo.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  return inputData;
}
