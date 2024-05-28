import JsPDF from 'jspdf';
import Xlsx from 'json-as-xlsx';
import PropTypes from 'prop-types';
import autoTable from 'jspdf-autotable';
import { useState, useEffect, useCallback } from 'react';

import { Box } from '@mui/system';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { usePostGeneral } from 'src/api/general';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import AreasTableRow from './areas-table-row';
import AreasTableToolbar from './areas-table-toolbar';
import AreasTableFiltersResult from './areas-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'id', label: 'ID', width: 400 },
  { id: 'nombre', label: 'Área' },
  { id: 'status', label: 'Estatus', width: 200 },
  { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  status: 'all',
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

function handleDownloadExcel(dataFiltered) {

  const data = [
    {
      sheet: "Demanda de beneficios",
      columns: [
        { label: "ID", value: "id" },
        { label: "Área", value: "label" },
        { label: "Demanda", value: "value" },
      ],
      content: dataFiltered,
    },
  ];

  const settings = {
    fileName: "Demanda de beneficios",
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

  data = dataFiltered.map(item => ([item.id, item.label, item.value]))

  autoTable(doc, {
    head: [headerBase],
    body: data,
  })
  doc.save('Demanda de beneficios.pdf')
}

// ----------------------------------------------------------------------

export default function AreasTable({ idDepa }) {
  const table = useTable({});

  const headerBase = ["ID", "Área", "Demanda"];

  const { areaData } = usePostGeneral(idDepa, endpoints.reportes.demandaAreas, "areaData");

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const dateError =
    filters.startDate && filters.endDate
      ? filters.startDate.getTime() > filters.endDate.getTime()
      : false;

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
    dateError,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 52 : 72;

  const canReset =
    !!filters.name || filters.status !== 'all' || (!!filters.startDate && !!filters.endDate);

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

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.order.details(id));
    },
    [router]
  );

  useEffect(() => {
    setTableData(areaData);
  }, [areaData]);

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
      dataFiltered
    );
  }

  return (

      <Container>
        <Box mb={2} />

        <AreasTableToolbar
          filters={filters}
          onFilters={handleFilters}
          //
          canReset={canReset}
          onResetFilters={handleResetFilters}
        />

        {canReset && (
          <AreasTableFiltersResult
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
          <TableSelectedAction
            dense={table.dense}
            numSelected={table.selected.length}
            rowCount={tableData.length}
            onSelectAllRows={(checked) =>
              table.onSelectAllRows(
                checked,
                tableData.map((row) => row.id)
              )
            }
            action={
              <Tooltip title="Delete">
                <IconButton color="primary" onClick={confirm.onTrue}>
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Tooltip>
            }
          />

          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={tableData.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    tableData.map((row) => row.id)
                  )
                }
              />

              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <AreasTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      onViewRow={() => handleViewRow(row.id)}
                      onFilters={handleFilters}
                      onResetFilters={handleResetFilters}
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
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />

      </Container>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters, dateError }) {
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
      (order) =>
        order.area.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  return inputData;
}

AreasTable.propTypes = {
  idDepa: PropTypes.any
};
