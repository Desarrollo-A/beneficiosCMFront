import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
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
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import ToolbarManuales from './toolbar-manuales';
import FiltersManuales from './filters-manuales';
import TableRowManuales from './table-row-manuales';
import ModalAgregarManuales from './modal-agregar-manuales';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'id', label: 'ID' },
  { id: 'titulo', label: 'Titulo' },
  { id: 'descripcion', label: 'Descripcion' },
  { id: 'icono', label: 'Icono' },
  { id: 'video', label: 'Video' },
  { id: 'idRol', label: 'ID rol' },
  { id: 'estatus', label: 'Estatus', width: 100 },
  { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};



export default function GestorAyudaView() {

  const table = useTable();

  const router = useRouter();

  const { user } = useAuthContext();

  const rol = user?.idRol

  const { manualesData } = useGetGeneral(endpoints.ayuda.getAllManuales, "manualesData");

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

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
    setTableData(manualesData);
  }, [manualesData]);

  const modal = useBoolean();

  return (
    <>

        <ModalAgregarManuales
          open={modal.value}
          onClose={modal.onFalse}
        />

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
            Agregar Manual
            <Iconify icon="lucide:plus" />
          </Button>
        </Box>

          <ToolbarManuales
            filters={filters}
            onFilters={handleFilters}
            //
            rol={rol}
          />

          {canReset && (
            <FiltersManuales
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

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
                      <TableRowManuales
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
        i.titulo.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        i.descripcion.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  return inputData;
}
