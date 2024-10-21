import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { endpoints } from 'src/utils/axios';

import { useGetGeneral } from 'src/api/general';

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

import TableSolicitudBoletos from '../solicitudBoletos-components/table-row';
import SolicitudBoletosTableToolbar from '../solicitudBoletos-components/table-toolbar';
import SolicitudBoletosTableFiltersResult from '../solicitudBoletos-components/table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'id', label: 'ID' },
  { id: 'nombre', label: 'Evento' },
  { id: 'numEmpleado', label: '#Empleado' },
  { id: 'beneficiario', label: 'Beneficiario', width: 200 },
  { id: 'departamento', label: 'Departamento' },
  { id: 'sede', label: 'Sede' },
  { id: 'horario', label: 'Horario de registro' },
  { id: 'telefono', label: '#Teléfono' },
  { id: 'solicitud', label: 'Estatus', width: 200 },
  { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  evento: [],
};

// ----------------------------------------------------------------------

export default function SolicitudBoletosView() {
  const table = useTable({});

  const { boletosData } = useGetGeneral(endpoints.boletos.getSolicitudBoletos, "boletosData");

  const settings = useSettingsContext();

  const router = useRouter();

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const _eve = boletosData.flatMap((e) => (e.nombre));

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
    setTableData(boletosData);
  }, [boletosData]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Solicitud de boletos"
        links={[
          {
            name: 'Gestor',
          },
          { name: 'Solicitud de boletos' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Card>

        <SolicitudBoletosTableToolbar
          filters={filters}
          onFilters={handleFilters}
          eveOptions={_eve}
          //
          canReset={canReset}
          onResetFilters={handleResetFilters}
        />

        {canReset && (
          <SolicitudBoletosTableFiltersResult
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
                    <TableSolicitudBoletos
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

      </Card>
    </Container>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters, dateError }) {
  const { name, evento } = filters;

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
      (user.nombre && user.nombre.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
      (user.num_empleado && user.num_empleado.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
      (user.ndepto && user.ndepto.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
      (user.ndepto && user.ndepto.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
      (user.fechaCreacion && user.fechaCreacion.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
      (user.telefono_personal && user.telefono_personal.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
      (user.nsede && user.nsede.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1) 
    );
  }

  if (evento?.length) {
    inputData = inputData.filter((i) => evento.includes(i?.nombre));
  }

  return inputData;
}
