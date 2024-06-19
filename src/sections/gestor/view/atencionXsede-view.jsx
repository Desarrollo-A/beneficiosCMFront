import JsPDF from 'jspdf';
import * as Yup from 'yup';
import Xlsx from 'json-as-xlsx';
import { isEmpty } from 'lodash';
import isEqual from 'lodash/isEqual';
import autoTable from 'jspdf-autotable';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import TabList from '@mui/lab/TabList';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TabPanel from '@mui/lab/TabPanel';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import TabContext from '@mui/lab/TabContext';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Grid from '@mui/material/Unstable_Grid2';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import { alpha, useTheme } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormHelperText from '@mui/material/FormHelperText';
import LinearProgress from '@mui/material/LinearProgress';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { endpoints } from 'src/utils/axios';

import { getOficinas } from 'src/api/gestor';
import { useGetAreas } from 'src/api/reportes';
import { useAuthContext } from 'src/auth/hooks';
import { useGetGeneral, usePostGeneral } from 'src/api/general';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import FormProvider, { RHFSelect, RHFAutocomplete } from 'src/components/hook-form';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import AddInsertSede from '../atencionxsede-componets/add-insert-sede';
import SedesSnAsignar from '../atencionxsede-componets/sedes-sn-asignar';
import BankingContacts from '../atencionxsede-componets/banking-contacts';
import RowsAtencionXsede from '../atencionxsede-componets/rows-atencionXsede';
import ToolbarAtencionXsede from '../atencionxsede-componets/toolbar-atencionXsede';
import FiltersAtencionXsede from '../atencionxsede-componets/filters-atencionXsede';
import { margin } from '@mui/system';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'id', label: 'ID' },
  { id: 'sede', label: 'Sede' },
  { id: 'oficina', label: 'Oficina' },
  { id: 'beneficio', label: 'Beneficio' },
  { id: 'area', label: 'Área' },
  { id: 'especialista', label: 'Especialista' },
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

function handleDownloadExcel(dataFiltered) {
  const data = [
    {
      sheet: 'Historial Reportes',
      columns: [
        { label: 'ID', value: 'id' },
        { label: 'Sede', value: 'sede' },
        { label: 'Oficina', value: 'oficina' },
        { label: 'Beneficio', value: 'puesto' },
        { label: 'Área', value: 'nombreArea' },
        { label: 'Especialista', value: 'nombre' },
        { label: 'Modalidad', value: 'modalidad' },
        { label: 'Estatus', value: 'estatus' },
      ],
      content: dataFiltered,
    },
  ];

  const settings = {
    fileName: 'Historial Reportes',
    extraLength: 3,
    writeMode: 'writeFile',
    writeOptions: {},
    RTL: false,
  };
  Xlsx(data, settings);
}

const doc = new JsPDF();

function handleDownloadPDF(dataFiltered, headerBase) {
  let data = [];

  data = dataFiltered.map((item) => [
    item.id,
    item.sede,
    item.oficina,
    item.puesto,
    item.nombreArea,
    item.nombre,
    item.modalidad,
    item.estatus,
  ]);

  autoTable(doc, {
    head: [headerBase],
    body: data,
  });
  doc.save('Reporte de pacientes.pdf');
}

// ----------------------------------------------------------------------

export default function AtencionXsedeView() {
  const theme = useTheme();
  const table = useTable();
  const dialog = useBoolean();
  const { user } = useAuthContext();

  const rol = user?.idRol;

  const { atXsedeData } = useGetGeneral(endpoints.gestor.getAtencionXsede, 'atXsedeData');

  const { atXsdEspData } = usePostGeneral(
    user?.idPuesto,
    endpoints.gestor.getAtencionXsedeEsp,
    'atXsdEspData'
  );

  const { sedesData } = useGetGeneral(endpoints.gestor.getSedes, 'sedesData');

  const { oficinasData } = useGetGeneral(endpoints.gestor.getOficinas, 'oficinasData');

  const { puestosData } = useGetGeneral(endpoints.reportes.especialistas, 'puestosData');

  const { modalidadesData } = useGetGeneral(endpoints.gestor.getModalidades, 'modalidadesData');

  const { sedesEmptyData } = useGetGeneral(endpoints.gestor.getSinAsigSede, 'sedesEmptyData');

  const settings = useSettingsContext();

  const router = useRouter();

  // const confirm = useBoolean();

  const [sedes, setSedes] = useState([]);

  const [oficinas, setOficinas] = useState([]);

  const [puestos, setPuestos] = useState([]);

  const [modalidades, setModalidades] = useState([]);

  const [tableData, setTableData] = useState([]);

  const [errorHabitoSeleccionado, setErrorHabitoSeleccionado] = useState(false);
  const [errorSedeSeleccionada, setErrorSedeSeleccionada] = useState(false);
  const [errorOficinaSeleccionada, setErrorOficinaSeleccionada] = useState(false);
  const [habitoSeleccionado, setHabitoSeleccionado] = useState(0);
  const [sedeSeleccionada, setSedeSeleccionada] = useState(0);

  // //////////////////////////////////////////////////////////
  const [select, setSelect] = useState(0);
  // const [, setMod] = useState('');
  const [esp, setEsp] = useState([]);
  const [mod, setMod] = useState([]);
  const [selectArea, setSelectArea] = useState({ idArea: null });
  const [listadoOficinas, setListadoOficinas] = useState([]);
  const [oficinaData, setOficinasData] = useState([]);

  const [bol, setBol] = useState(false);

  const { areas } = useGetAreas();

  // const { oficinaData } = usePostGeneral(
  //   sedeSeleccionada,
  //   endpoints.gestor.getOficinasVal,
  //   'oficinaData'
  // ); // a este le envió el dato de sede....

  const [es] = useState({
    // setEs
    idSd: sedeSeleccionada,
    idPs: habitoSeleccionado,
  });

  const { especiaData } = usePostGeneral(es, endpoints.gestor.getEspecialistasVal, 'especiaData'); // A este le envió el dato de especialista

  const handleChangeSede = async (val) => {
    setOficinasData([]);
    console.log('ASIGNASCIÓN', val);
    setSedeSeleccionada(val);

    const result = await getOficinas(val);
    console.log('AAA', result);
    if (Array.isArray(result?.data) && result.data.length > 0) {
      const opciones = [
        ...result.data.map((i) => ({
          key: i.idOficina,
          value: i.idOficina,
          label: i.lugar,
        })),
        { key: 0, value: 0, label: 'VIRTUAL' },
      ];

      setOficinasData(opciones);
    } else {
      setOficinasData([{ key: 0, value: 0, label: 'VIRTUAL' }]);
    }
  };

  const handleChangeOfi = (value) => {
    console.log('hola');
    // setSelect(value?.value);
    // if (value?.value === 0) {
    //   setBol(false);
    //   handleMod({
    //     modalidad: 2,
    //     sede: sedeSeleccionada,
    //     usuario: user?.idUsuario,
    //     oficina: value?.value,
    //   });
    // } else {
    //   setBol(true);
    // }
  };

  const handleChangeMod = (e) => {
    // setMod(e.target.value);
    handleMod({
      modalidad: e.target.value,
      sede: sedeSeleccionada,
      usuario: user?.idUsuario,
      oficina: select,
    });
  };

  const handleChangeArea = (value) => {
    handleArea({ idArea: value?.key?.idArea });
  };

  const handleKeyDown = async () => {
    handleArea({ idArea: null });
  };

  const handleChangeEsp = (e) => {
    handleEsp({ especialista: e.target.value });
  };

  const handleEsp = (newPg) => {
    setEsp(newPg);
  };

  const handleMod = (newPg) => {
    setMod(newPg);
  };

  const handleArea = (newPg) => {
    setSelectArea(newPg);
  };

  const opciones = [
    ...oficinaData.map((i) => ({
      key: i.idOficina,
      value: i.idOficina,
      label: i.lugar,
    })),
    { key: 0, value: 0, label: 'VIRTUAL' },
  ];

  const NewInvoiceSchema = Yup.object().shape({
    items: Yup.mixed().nullable().required('Is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewInvoiceSchema),
  });

  const {
    reset,

    handleSubmit,
    /* formState: { isSubmitting }, */
  } = methods;

  const [formKey, setFormKey] = useState(0);

  const resetForm = () => {
    reset();
    setFormKey((prevKey) => prevKey + 1);
  };

  const handleCreateAndSend = handleSubmit(async (data) => {
    // const combinedArray = {
    //   ...mod,
    //   ...esp,
    //   ...selectArea,
    // };
    // if (
    //   !isEmpty(combinedArray) &&
    //   !isEmpty(mod) &&
    //   !isEmpty(esp) &&
    //   Number.isInteger(selectArea.idArea)
    // ) {
    //   try {
    //     await new Promise((resolve) => setTimeout(resolve, 500));
    //     loadingSend.onFalse();
    //     const insert = await insertData(combinedArray);
    //     if (insert.result) {
    //       enqueueSnackbar(insert.msg, { variant: 'success' });
    //       resetForm();
    //       mutate(endpoints.gestor.getAtencionXsede);
    //       mutate(endpoints.gestor.getAtencionXsedeEsp);
    //       setBtnLoad(false);
    //     } else {
    //       enqueueSnackbar(insert.msg, { variant: 'error' });
    //       setBtnLoad(false);
    //     }
    //   } catch (error) {
    //     console.error(error);
    //     loadingSend.onFalse();
    //     setBtnLoad(false);
    //   }
    // } else {
    //   enqueueSnackbar('Faltan datos', { variant: 'error' });
    //   setBtnLoad(false);
    // }
  });

  // ////////////////////////////////////////////////////////////

  const [filters, setFilters] = useState(defaultFilters);

  const _sd = sedes.flatMap((i) => i.sede);

  const _of = oficinas.flatMap((i) => i.oficina);

  const _ofMore = [..._of, 'VIRTUAL'];

  const _pu = puestos.flatMap((i) => i.nombre);

  const _mod = modalidades.flatMap((i) => i.modalidad);

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
    if (rol === '4' || rol === 4) {
      setTableData(atXsedeData);
    } else if (rol === 3) {
      setTableData(atXsdEspData);
    }
  }, [atXsedeData, atXsdEspData, rol]);

  useEffect(() => {
    setSedes(sedesData);
    setOficinas(oficinasData);
    setPuestos(puestosData);
    setModalidades(modalidadesData);
  }, [sedesData, oficinasData, puestosData, modalidadesData]);

  const [value, setValue] = useState('1');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const headerBase = [
    'ID',
    'Sede',
    'oficina',
    'Beneficio',
    'Área',
    'Especialista',
    'Modalidad',
    'Estatus',
  ];

  const handlePdf = async (e) => {
    e.preventDefault();
    handleDownloadPDF(dataFiltered, headerBase);
  };

  const handleExcel = async (e) => {
    e.preventDefault();
    handleDownloadExcel(dataFiltered);
  };

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Stack
          alignItems="center"
          justifyContent="space-between"
          sx={{
            mb: { xs: 1, md: 1 },
            flexDirection: { sm: 'row', md: 'col' },
          }}
        >
          <CustomBreadcrumbs
            heading="Atención por sede"
            links={[{ name: 'Gestor' }, { name: 'Atención por sede' }]}
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />

          {user?.idRol === '4' || user?.idRol === 4 || user?.idRol === '1' || user?.idRol === 1 ? (
            <Button color="inherit" variant="outlined" onClick={dialog.onTrue}>
              Asignar sede
            </Button>
          ) : null}
        </Stack>

        <Card>
          <TabContext value={value}>
            <Box
              sx={{
                px: 2.5,
                boxShadow: () => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
              }}
            >
              <TabList onChange={handleChange}>
                <Tab label="Registros" value="1" />
              </TabList>
            </Box>
            <TabPanel value="1">
              <ToolbarAtencionXsede
                filters={filters}
                onFilters={handleFilters}
                //
                roleOptions={_sd}
                OptionsOff={_ofMore}
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
                  <MenuItem sx={{ width: 50, p: 1 }} onClick={handleExcel}>
                    <Iconify icon="teenyicons:xls-outline" />
                  </MenuItem>
                </Tooltip>

                <Tooltip title="Exportar a PDF" placement="top" arrow>
                  <MenuItem sx={{ width: 50, p: 1 }} onClick={handlePdf}>
                    <Iconify icon="teenyicons:pdf-outline" />
                  </MenuItem>
                </Tooltip>
              </Stack>

              <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                <Scrollbar>
                  <Table sx={{ minWidth: 960 }}>
                    <TableHeadCustom headLabel={TABLE_HEAD} onSort={table.onSort} />

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
          </TabContext>
        </Card>
      </Container>

      {/* MODAL DE ASIGNAR SEDE */}
      <Dialog
        fullWidth
        maxWidth="md"
        open={dialog.value}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest - 1000,
        }}
      >
        <DialogTitle>Selecciona el beneficio para la asignación de sede</DialogTitle>

        <DialogContent sx={{ color: 'text.secondary' }}>
          <Stack direction="column" spacing={3} sx={{ mt: 1 }} justifyContent="space-between">
            <FormControl error={!!errorHabitoSeleccionado} fullWidth>
              <InputLabel id="beneficio-input" name="beneficio">
                Beneficio
              </InputLabel>
              <Select
                labelId="Beneficio"
                id="select-beneficio"
                label="Beneficio"
                value={habitoSeleccionado || ''}
                defaultValue=""
                onChange={(e) => setHabitoSeleccionado(e.target.value)}
                disabled={1 === 2}
              >
                {puestosData?.map((e) => (
                  <MenuItem key={e.nombre} value={e.nombre}>
                    {e.nombre.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
              {/* {beneficios?.length === 0 && <LinearProgress />}
              {errorSedeAsignar && (
                <FormHelperText error={errorSedeAsignar}>
                  Seleccione un habito para asignarle una sede
                </FormHelperText>
              )} */}
            </FormControl>

            <FormControl error={!!errorSedeSeleccionada} fullWidth>
              <InputLabel id="sede-input" name="sede">
                Sede
              </InputLabel>
              <Select
                labelId="sede"
                id="select-sede"
                label="Sede"
                value={sedeSeleccionada || ''}
                defaultValue=""
                onChange={(e) => handleChangeSede(e.target.value)}
                disabled={1 === 2}
              >
                {sedesData?.map((e) => (
                  <MenuItem key={e.idSede} value={e.idSede}>
                    {e.sede.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
              {/* {beneficios?.length === 0 && <LinearProgress />}
              {errorSedeAsignar && (
                <FormHelperText error={errorSedeAsignar}>
                  Seleccione un habito para asignarle una sede
                </FormHelperText>
              )} */}
            </FormControl>

            <Autocomplete
              name="Oficina"
              label="Oficina"
              onChange={(_event, val, reason) => {
                handleChangeOfi(val);
              }}
              clear={false}
              options={oficinaData}
              renderInput={(params) => <TextField {...params} label="Oficina" />}
              sx={{ marginBottom: 0 }}
            />
            {oficinaData?.length === 0 && sedeSeleccionada !== 0 && <LinearProgress />}
            {errorOficinaSeleccionada && (
              <FormHelperText error={errorOficinaSeleccionada}>
                Selecciona una oficina para asignarle una sede
              </FormHelperText>
            )}

            {/*
            <RHFSelect
              name="especialista"
              size="small"
              label="Especialista"
              defaultValue=""
              onChange={(e) => handleChangeEsp(e)}
            >
              <Divider sx={{ borderStyle: 'dashed' }} />

              {!isEmpty(especiaData) ? (
                especiaData.map((i) => (
                  <MenuItem key={i.idUsuario} value={i.idUsuario}>
                    {i.nombre}
                  </MenuItem>
                ))
              ) : (
                <Grid style={{ paddingTop: '3%' }}>
                  <LinearProgress />
                  <Box mb={3} />
                </Grid>
              )}
            </RHFSelect>

            <Stack spacing={3} sx={{ width: 900 }}>
              <RHFAutocomplete
                name="area"
                label="Área"
                size="small"
                value=""
                onChange={(_event, val, reason) => {
                  handleChangeArea(val);
                }}
                onKeyDown={(e) => {
                  handleKeyDown();
                }}
                options={areas?.map((i) => ({
                  key: i,
                  value: i.idArea,
                  label: i.nombre,
                }))}
              />
            </Stack>
            {bol !== false ? (
              <RHFSelect
                name="modalidad"
                size="small"
                label="Modalidad"
                defaultValue=""
                onChange={(e) => handleChangeMod(e)}
              >
                <Divider sx={{ borderStyle: 'dashed' }} />

                {!isEmpty(modalidadesData) ? (
                  modalidadesData.map((i) => (
                    <MenuItem key={i.idOpcion} value={i.idOpcion}>
                      {i.modalidad}
                    </MenuItem>
                  ))
                ) : (
                  <Grid style={{ paddingTop: '3%' }}>
                    <LinearProgress />
                    <Box mb={3} />
                  </Grid>
                )}
              </RHFSelect>
            ) : null} */}
            {/*  
            <AddInsertSede
              idSede={sedeSeleccionada}
              oficinaData={oficinaData}
              especiaData={especiaData}
              modalidadesData={modalidadesData}
              handleMod={handleMod}
              handleEsp={handleEsp}
              handleArea={handleArea}
            />
            */}

            <SedesSnAsignar
              modalidadesData={modalidadesData}
              puestosData={puestos}
              sedesData={sedes}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={dialog.onFalse}>
            Disagree
          </Button>
          <Button variant="contained" onClick={dialog.onFalse} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </>
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
