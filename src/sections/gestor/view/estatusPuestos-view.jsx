import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import TabList from '@mui/lab/TabList';
import Table from '@mui/material/Table';
import TabPanel from '@mui/lab/TabPanel';
import { alpha } from '@mui/material/styles';
import TabContext from '@mui/lab/TabContext';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
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

import AreasTable from '../estatusPuestos-components/table-areas/areas-table';
import PuestosTable from '../estatusPuestos-components/table-puestos/puestos-table';
import TableDepartamentos from '../estatusPuestos-components/table-departamentos/departamentos-table-row';
import DepartamentosTableToolbar from '../estatusPuestos-components/table-departamentos/order-table-toolbar';
import DepartamentosTableFiltersResult from '../estatusPuestos-components/table-departamentos/departamentos-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'id', label: 'ID', width: 400 },
  { id: 'nombre', label: 'Departamento' },
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

export default function EstatusPuestosView() {
  const table = useTable({});

  const [valueDt, setValueDt] = useState('1');

  const handleChange = (event, newValue) => {
    setValueDt(newValue);
  };

  const { depaData } = useGetGeneral(endpoints.gestor.getDepartamentos, "depaData");

  const { arData } = useGetGeneral(endpoints.gestor.getAllAreas, "arData");

  const settings = useSettingsContext();

  const router = useRouter();

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

/*   const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRows: tableData.length,
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, table, tableData]); */

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
    setTableData(depaData);
  }, [depaData]);


  const opsDepa = [
    ...depaData.map((i) => ({
      key: i.id,
      value: i.id,
      label: i.departamento,
    }))
  ];

  const opsArea = [
    ...arData.map((i) => ({
      key: i.id,
      value: i.id,
      label: i.area,
    }))
  ];

  const [_dp, set_dp] = useState(0);

  const [_dpName, set_dpName] = useState('');

  const handleChangeDepa = useCallback(
    (e, newValue) => {
      set_dp(newValue.value);
      set_dpName(newValue.label);
    },
    []
  );

  const [_ar, set_ar] = useState(0);

  const [_arName, set_arName] = useState('');

  const handleChangeAr = useCallback(
    (e, newValue) => {
      set_ar(newValue.value);
      set_arName(newValue.label);
    },
    []
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Gozo de beneficios"
        links={[
          {
            name: 'Gestor',
          },
          { name: 'Gozo de beneficios' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Card>
        <TabContext value={valueDt}>
          <Box sx={{
            px: 2.5,
            boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
          }}>
            <TabList onChange={handleChange} >
              <Tab label="Departamentos" value="1" />

              <Tab label="Áreas" value="2" />

              <Tab label="Puestos" value="3" />

            </TabList>
          </Box>
          <TabPanel value="1">

            <DepartamentosTableToolbar
              filters={filters}
              onFilters={handleFilters}
              //
              canReset={canReset}
              onResetFilters={handleResetFilters}
            />

            {canReset && (
              <DepartamentosTableFiltersResult
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
                        <TableDepartamentos
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
          </TabPanel>

          <TabPanel value="2">
            <Autocomplete
              id="combo-box-demo"
              options={opsDepa}
              value={_dpName}
              mb={12}
              renderInput={(params) => <TextField {...params} label="Departamento" />}
              onChange={handleChangeDepa}
            />

            <AreasTable idDepa={_dp} />

          </TabPanel>

          <TabPanel value="3">
            <Autocomplete
              id="combo-box-demo"
              options={opsArea}
              value={_arName}
              mb={12}
              renderInput={(params) => <TextField {...params} label="Área" />}
              onChange={handleChangeAr}
            />

            <PuestosTable idArea={_ar} />

          </TabPanel>
        </TabContext>

      </Card>
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
        order.departamento.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  return inputData;
}
