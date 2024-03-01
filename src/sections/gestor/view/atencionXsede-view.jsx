import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import TabList from '@mui/lab/TabList';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TabPanel from '@mui/lab/TabPanel';
import { alpha } from '@mui/material/styles';
import TabContext from '@mui/lab/TabContext';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

// import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { useAuthContext } from 'src/auth/hooks';
import { useGetGeneral, usePostGeneral } from 'src/api/general';

import Label from 'src/components/label';
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

import SedesSnAsignar from '../atencionxsede-componets/sedes-sn-asignar';
import RowsAtencionXsede from '../atencionxsede-componets/rows-atencionXsede';
import ToolbarAtencionXsede from '../atencionxsede-componets/toolbar-atencionXsede';
import FiltersAtencionXsede from '../atencionxsede-componets/filters-atencionXsede';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'id', label: 'ID'},
  { id: 'sede', label: 'Sede' },
  { id: 'oficina', label: 'Oficina' },
  { id: 'beneficio', label: 'Beneficio' },
  { id: 'area', label: 'Área' },
  { id: 'especialista', label: 'Especialista'},
  { id: 'modalidad', label: 'Modalidad' },
  { id: 'estatus', label: 'Estatus' },
  { id: '' },
];

const defaultFilters = {
  nombre: '',
  sede: [],
  oficina: [],
  puesto: [],
  modalidad: [],
  estatus: 'all',
};

// ----------------------------------------------------------------------

export default function AtencionXsedeView() {
  const table = useTable();

  const { user } = useAuthContext();

  const rol = user?.idRol;

  const { atXsedeData } = useGetGeneral(endpoints.gestor.getAtencionXsede, "atXsedeData");

  const { atXsdEspData } = usePostGeneral(user?.idPuesto, endpoints.gestor.getAtencionXsedeEsp, "atXsdEspData");

  const { sedesData } = useGetGeneral(endpoints.gestor.getSedes, "sedesData");

  const { oficinasData } = useGetGeneral(endpoints.gestor.getOficinas, "oficinasData");

  const { puestosData } = useGetGeneral(endpoints.reportes.especialistas, "puestosData");

  const { modalidadesData } = useGetGeneral(endpoints.gestor.getModalidades, "modalidadesData");

  const { sedesEmptyData } = useGetGeneral(endpoints.gestor.getSinAsigSede, "sedesEmptyData");

  const settings = useSettingsContext();

  const router = useRouter();

  // const confirm = useBoolean();

  const [sedes, setSedes] = useState([]);

  const [oficinas, setOficinas] = useState([]);

  const [puestos, setPuestos] = useState([]);

  const [modalidades, setModalidades] = useState([]);

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const _sd = sedes.flatMap((i) => (i.sede));

  const _of = oficinas.flatMap((i) => (i.oficina));

  const _pu = puestos.flatMap((i) => (i.nombre));

  const _mod = modalidades.flatMap((i) => (i.modalidad));

  const _puEs = atXsdEspData[0]?.puesto;

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  // const denseHeight = table.dense ? 52 : 72;

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

  // const handleDeleteRows = useCallback(() => {
  //   const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
  //   setTableData(deleteRows);

  //   table.onUpdatePageDeleteRows({
  //     totalRows: tableData.length,
  //     totalRowsInPage: dataInPage.length,
  //     totalRowsFiltered: dataFiltered.length,
  //   });
  // }, [dataFiltered.length, dataInPage.length, table, tableData]);

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
    if(rol === "4" || rol === 4){
      setTableData(atXsedeData);
    }else if(rol === "1" || rol === 1 || rol === "3" || rol === 3){
      setTableData(atXsdEspData);
    }
  }, [atXsedeData, atXsdEspData, rol]);

  useEffect(() => {
    setSedes(sedesData);
    setOficinas(oficinasData);
    setPuestos(puestosData);
    setModalidades(modalidadesData);
  }, [
    sedesData,
    oficinasData,
    puestosData,
    modalidadesData,
  ]);

  const [value, setValue] = useState('1');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Atención por sede"
        links={[
          { name: 'Gestor' },
          { name: 'Atención por sede' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Card>

        <TabContext value={value}>
          <Box sx={{
            px: 2.5,
            boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
          }}>
            <TabList onChange={handleChange} >
              <Tab label="Registros" value="1" />

              {sedesEmptyData !== false && 
               user?.idRol === "4" || user?.idRol === 4 || user?.idRol === "1" || user?.idRol === 1 
                ? (

                <Tab value="2" iconPosition="end" icon={
                  <Label
                    variant='soft'
                    color='warning'
                  ><Iconify icon="line-md:alert-twotone" /></Label>
                }
                  label="Asignación de sedes" />

              ) : null}

            </TabList>
          </Box>
          <TabPanel value="1">

            <ToolbarAtencionXsede
              filters={filters}
              onFilters={handleFilters}
              //
              roleOptions={_sd}
              OptionsOff={_of}
              OptionsPue={_pu}
              OptionsMod={_mod}
              rol={rol}
              _puEs={_puEs}
            />

            {canReset && (
              <FiltersAtencionXsede
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
                <Table sx={{ minWidth: 960 }}>
                  <TableHeadCustom
                    headLabel={TABLE_HEAD}
                    onSort={table.onSort}
                  />

                  <TableBody>
                    {dataFiltered
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((row) => (
                        <RowsAtencionXsede
                          key={row.id}
                          row={row}
                          rol={rol}
                          idOficina={row.idOficina}
                          tipoCita={row.tipoCita}
                          idEspecialista={row.idEspecialista}
                          idArea={row.idArea}
                          modalidadesData={modalidadesData}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                          onEditRow={() => handleEditRow(row.id)}
                        />
                      ))}

                    <TableEmptyRows
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

          </TabPanel>

          {user?.idRol === "4" || user?.idRol === 4 || user?.idRol === "1" || user?.idRol === 1 ? (
          <TabPanel value="2">

            <Stack spacing={2}>
                <SedesSnAsignar
                  modalidadesData={modalidadesData}
                  puestosData={puestos}
                  sedesData={sedes}
                />
            </Stack>

          </TabPanel>
          ) : (
            null
          )}
        </TabContext>

      </Card>
    </Container>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { nombre, estatus, sede, oficina, puesto, modalidad } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (nombre) {
    inputData = inputData.filter(
      (i) => i.nombre.toLowerCase().indexOf(nombre.toLowerCase()) !== -1
    );
  }

  if (estatus !== 'all') {
    inputData = inputData.filter((i) => i.estatus === estatus);
  }

  if (sede.length) {
    inputData = inputData.filter((i) => sede.includes(i.sede));
  }

  if (oficina.length) {
    inputData = inputData.filter((i) => oficina.includes(i.oficina));
  }

  if (puesto.length) {
    inputData = inputData.filter((i) => puesto.includes(i.puesto));
  }

  if (modalidad.length) {
    inputData = inputData.filter((i) => modalidad.includes(i.modalidad));
  }

  return inputData;
}
