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

import { endpoints } from 'src/utils/axios';
import { fTimestamp } from 'src/utils/format-time';

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

import FilasTabla from '../components/historial-reportes/filas-tabla-citas';
import FiltrosTabla from '../components/historial-reportes/filtros-tabla-citas';
import BarraTareasTabla from '../components/historial-reportes/barratareas-tabla-citas';

// ----------------------------------------------------------------------

const ultimoDiaMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

const currentDate = new Date();
const diaMesUno = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

const defaultFilters = {
  name: '',
  area: [],
  estatus: 'all',
  startDate: diaMesUno,
  endDate: ultimoDiaMes,
  especialista: [],
  modalidad: [],
};

// ----------------------------------------------------------------------
const doc = new JsPDF('l', 'pt');

function handleDownloadExcel(dataFiltered, rol) {

  let data = [];

  const baseArray = [
    {
      sheet: "Historial Reportes",
      columns: [
        { label: "ID", value: "idColab" },
        { label: "Usuario", value: "usuario" },
        { label: "Especialista", value: "especialista" },
        { label: "Número de empleado", value: "numEmpleado" },
        { label: "Paciente", value: "paciente" },
        { label: "Oficina", value: "oficina" },
        { label: "Departamento", value: "depto" },
        { label: "Área", value: "narea" },
        { label: "Puesto", value: "npuesto" },
        { label: "Sede", value: "sede" },
        { label: "Modalidad", value: "modalidad" },
        { label: "Sexo", value: "sexo" },
        { label: "Motivo consulta", value: "motivoCita" },
        { label: "Pago generado", value: "pagoGenerado" },
        { label: "Método de pago", value: "metodoPago" },
        { label: "Monto", value: "monto" },
        { label: "Tipo cita", value: "tipoCita" },
        { label: "Estatus", value: "estatus" },
        { label: "Horario cita", value: "horario" },
      ],
      content: dataFiltered,
    },
  ];

  if (rol === 3) {
    const arr = baseArray[0].columns;
    arr.splice(2, 1);

    data = [
      {
        sheet: "Historial Reportes",
        columns: arr,
        content: dataFiltered,
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

function handleDownloadPDF(dataFiltered, header, rol) {

  let data = [];

  if(rol === 3){
    data = dataFiltered.map(item => ([item.idColab, item.usuario, item.numEmpleado, item.paciente,
      item.oficina, item.depto, item.narea, item.npuesto, item.sede, item.modalidad, item.sexo, item.motivoCita, item.pagoGenerado, item.metodoPago !== null ? item.metodoPago : 'Pendiente de pago', item.monto, item.tipoCita, item.estatus, item.horario,]))
  }else{
    data = dataFiltered.map(item => ([item.idColab, item.usuario, item.especialista, item.numEmpleado, item.paciente,
    item.oficina, item.depto, item.narea, item.npuesto, item.sede, item.modalidad, item.sexo, item.motivoCita, item.pagoGenerado, item.metodoPago !== null ? item.metodoPago : 'Pendiente de pago', item.monto, item.tipoCita, item.estatus, item.horario,]))
  }
  
  autoTable(doc, {
    head: [header],
    body: data,
  })
  doc.save('Historial Reportes.pdf')
}
// ----------------------------------------------------------------------
export default function HistorialReportesView() {

  const { user } = useAuthContext();

  const rol = user?.idRol;

  const idUsuario = user?.idUsuario;

  const nombreUser = user?.nombre;

  let TABLE_HEAD = [];

  let header = [];

  const headerBase = ["ID", "Usuario", "Especialista", "Número de empleado", "Paciente", "Oficina", "Departamento", "Área", "Puesto", "Sede",
    "Modalidad", "Sexo", "Motivo consulta", "Pago Generado", "Método de pago", "Monto", "Tipo cita", "Estatus", "Horario cita"];

  const [dataValue, setReportData] = useState(0);

  const [typeusersData, setTypeusersData] = useState(2); 

  const [dtReport, setDtReport] = useState({
    reporte: dataValue,
    tipoUsuario: typeusersData
  });

  useEffect(() => {
    setDtReport({
      reporte: dataValue,
      tipoUsuario: typeusersData
    });
  }, [dataValue, typeusersData]);

  const { espeUserData } = usePostGeneral(user?.idUsuario, endpoints.reportes.getEspeUser, "espeUserData");

  const [esp, setEsp] = useState([]);

  useEffect(() => {
    setEsp(espeUserData);
  }, [espeUserData]);

  const { reportesData } = usePostGeneral(dtReport, endpoints.reportes.lista, "reportesData");

  const { especialistasData } = useGetGeneral(endpoints.reportes.especialistas, "especialistasData");

  const { modalidadesData } = useGetGeneral(endpoints.gestor.getModalidades, "modalidadesData");

  const [datosTabla, setDatosTabla] = useState([]);

  const [especialistas, setEspecialistas] = useState([]);

  const _rp = especialistas.flatMap((es) => (es.nombre));

  const _eu = esp.flatMap((es) => (es.puesto));

  const _mod = modalidadesData.flatMap((es) => (es.modalidad));

  defaultFilters.area = user?.idRol !== 4 ? _eu : [];

  defaultFilters.especialista = user?.idRol !== 4 ? nombreUser : [];

  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [filters, setFilters] = useState(defaultFilters);

  const dateError =
    filters.startDate && filters.endDate
      ? filters.startDate.getTime() > filters.endDate.getTime()
      : false;

  const TABLE_BASE = [
    { id: '', label: 'ID' },
    { id: '', label: 'Usuario' },
    { id: '', label: 'Especialista' },
    { id: '', label: 'Número de empleado' },
    { id: '', label: 'Paciente' },
    { id: '', label: 'Oficina' },
    { id: '', label: 'Departamento' },
    { id: '', label: 'Área' },
    { id: '', label: 'Puesto' },
    { id: '', label: 'Sede' },
    { id: '', label: 'Modalidad' },
    { id: '', label: 'Sexo' },
    { id: '', label: 'Motivo Consulta' },
    { id: '', label: 'Pago generado' },
    { id: '', label: 'Método de pago' },
    { id: '', label: 'Monto' },
    { id: '', label: 'Tipo cita' },
    { id: '', label: 'Estatus' },
    { id: '', label: 'Horario cita' },
    { id: '' },
    /* { id: '', width: 88 }, */
  ];

  if (rol === 3) {

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
    dateError,
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
      const deleteRow = datosTabla.filter((row) => row.id !== id);
      setDatosTabla(deleteRow);

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, datosTabla]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = datosTabla.filter((row) => !table.selected.includes(row.id));
    setDatosTabla(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRows: datosTabla.length,
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, table, datosTabla]);

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
      dataFiltered,
      rol
    );
  }

  const handlePdf = async e => {
    e.preventDefault();
    handleDownloadPDF(
      dataFiltered,
      header,
      rol
    );
  }

  const handleChangeReport = (newData) => {
    setReportData(newData);
  }

  const handleChangeTypeUsers = (newData) => {
    setTypeusersData(newData);
  }

  useEffect(() => {
    setDatosTabla(reportesData);
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
          heading="Reporte historial"
          links={[
            { name: 'Reportes' },
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
            modOptions={_mod}
            handleChangeReport={handleChangeReport}
            handleChangeTypeUsers={handleChangeTypeUsers}
            table={table}
            tot={dataFiltered.length}
            dataValue={dataValue}
            rol={rol}
            _eu={_eu}
            idUsuario={idUsuario}
            nombreUser={nombreUser}
          />

          {canReset && (
            <FiltrosTabla
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              rol={rol}
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
                  rowCount={datosTabla.length}
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
                      <FilasTabla
                        key={index}
                        row={row}
                        selected={table.selected.includes(row.idCita)}
                        onSelectRow={() => table.onSelectRow(row.idCita)}
                        onDeleteRow={() => handleDeleteRow(row.idCita)}
                        onEditRow={() => handleEditRow(row.idCita)}
                        rol={rol}
                        rel={handleChangeReport}
                        typeusersData={typeusersData}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, datosTabla.length)}
                  />

                  <TableNoData notFound={notFound}/>
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

function applyFilter({ inputData, comparator, filters, dateError, rol }) {
  const { name, area, startDate, endDate, especialista, modalidad } = filters;

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
        (cita.idColab && cita.idColab.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
        cita.horario.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        cita.estatus.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        (cita.depto && cita.depto.toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
        (cita.especialista && cita.especialista.toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
        (cita.paciente && cita.paciente.toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
        (cita.paciente && cita.paciente.toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
        (cita.sede && cita.sede.toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
        (cita.sexo && cita.sexo.toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
        (cita.motivoCita && cita.motivoCita.toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
        (cita.metodoPago && cita.metodoPago.toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
        (cita.oficina && cita.oficina.toLowerCase().indexOf(name.toLowerCase()) !== -1)
    );
  }

  if (area?.length) {
    inputData = inputData.filter((cita) => area.includes(cita.area));
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter(
        (order) =>
          fTimestamp(order.fechaInicio) >= fTimestamp(startDate) &&
          fTimestamp(order.fechaInicio) <= fTimestamp(endDate)
      );
    }
  }

    if (especialista?.length) {
      inputData = inputData.filter((i) => especialista.includes(i?.especialista));
    }

  if (modalidad?.length) {
    inputData = inputData.filter((i) => modalidad.includes(i?.modalidad));
  }

  return inputData;
}