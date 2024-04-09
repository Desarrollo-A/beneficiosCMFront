import JsPDF from 'jspdf';
import Xlsx from 'json-as-xlsx';
import isEqual from 'lodash/isEqual';
import autoTable from 'jspdf-autotable';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
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
import { usePostGeneral } from 'src/api/general';

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

import ToolbarOficinas from '../horarios-especificos-componets/toolbar-oficinas';
import FiltersOficinas from '../horarios-especificos-componets/filters-oficinas';
import TableRowOficinas from '../horarios-especificos-componets/table-row-oficinas';
import ModalAgregarOficinas from '../horarios-especificos-componets/modal-agregar-oficinas';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'idHorario', label: 'ID' },
  { id: 'beneficio', label: 'Beneficio' },
  { id: 'especialista', label: 'Especialista' },
  { id: 'horario', label: 'Horario', with: 220 },
  { id: 'horarioSabado', label: 'Horario sabatino', with: 100 },
  { id: 'estatus', label: 'Estatus', width: 100 },
  { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

// ----------------------------------------------------------------------

function handleDownloadExcel(tableData) {

  const data = [
    {
      sheet: "Horarios especificos",
      columns: [
        { label: "ID", value: "idHorario" },
        { label: "Beneficio", value: "beneficio" },
        { label: "Especialista", value: "especialista" },
        { label: "Horario", value: "horario" },
        { label: "Horario sabatino", value: "horarioSabado" },
        { label: "Estatus", value: "estatus" },
      ],
      content: tableData,
    },
  ];

  const settings = {
    fileName: "Horarios especificos",
    extraLength: 3,
    writeMode: "writeFile",
    writeOptions: {},
    RTL: false,
  }
  Xlsx(data, settings)
}

const doc = new JsPDF();

function handleDownloadPDF(tableData, headerBase) {

  let data = [];

  data = tableData.map(item => ([item.idHorario, item.beneficio, item.especialista, item.horario, item.horarioSabado, item.estatus]));

  autoTable(doc, {
    head: [headerBase],
    body: data,
  })
  doc.save('Horarios especificos.pdf')
}

// ----------------------------------------------------------------------

export default function HorariosEspeView() {

  const headerBase = ["ID", "Beneficio", "Especialista", "Horario", "Horario sabatino", "Estatus"];

  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const { user } = useAuthContext();

  const rol = user?.idRol

  const [userDt] = useState({ // setUserDt
    idRol: user?.idRol,
    idPuesto: user?.idPuesto,
  });

  const { horariosData } = usePostGeneral(userDt, endpoints.gestor.getHorariosEspecificos, "horariosData");

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const [especialistas] = useState([]); // setEspecialistas

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
      tableData
    );
  }

  useEffect(() => {
    setTableData(horariosData);
  }, [horariosData]);

  const modal = useBoolean();

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Horarios especificos"
          links={[
            { name: 'Gestor' },
            { name: 'Horarios especificos' },
          ]}
          sx={{
            mb: { xs: 3, md: 0 },
          }}
        />

        <ModalAgregarOficinas
          open={modal.value}
          onClose={modal.onFalse}
        />

        { rol === 4 ?(
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            spacing={2}
            color='primary'
            sx={{ mb: 3 }}
            onClick={() => {
              modal.onTrue();
            }}
          >
            Agregar horario
            <Iconify icon="lucide:plus" />
          </Button>
        </Box>
        ):(
          null
        )}

        <Card>

          <ToolbarOficinas
            filters={filters}
            onFilters={handleFilters}
            //
            roleOptions={_rp}
            rol={rol}
          />

          {canReset && (
            <FiltersOficinas
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
                      <TableRowOficinas
                        key={index}
                        row={row}
                        rol={rol}
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
  const { name } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (i) =>
        i.oficina.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        i.sede.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        i.ubicación.toLowerCase().indexOf(name.toLowerCase()) !== -1 || 
        i.idOficina.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  return inputData;
}
