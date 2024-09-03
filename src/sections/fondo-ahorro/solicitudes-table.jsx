import JsPDF from 'jspdf';
import dayjs from 'dayjs';
import Xlsx from 'json-as-xlsx';
import PropTypes from 'prop-types';
import { es } from 'date-fns/locale';
import isEqual from 'lodash/isEqual';
import autoTable from 'jspdf-autotable';
import { useRef, useState, useCallback } from 'react';

import Card from '@mui/material/Card';
import { Button } from '@mui/material';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';
// import LinearProgress from '@mui/material/LinearProgress';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useAuthContext } from 'src/auth/hooks';
import { updateExternalUser } from 'src/api/user';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

// import UserTableRow from './user-table-row';
// import UserTableToolbar from './user-table-toolbar';
// import UserTableFiltersResult from './user-table-filters';

import { fTimestamp } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import SolicitudesTableRow from './solicitudes/solicitudes-table-row';
import SolicitudesTableToolbar from './solicitudes/solicitudes-table-toolbar';
import SolicitudesTableFilterResult from './solicitudes/solicitudes-table-filters';

const TABLE_HEAD = [
  { id: '', label: 'ID' },
  { id: '', label: 'N° CONTRATO' },
  { id: '', label: 'SOLICITANTE' },
  { id: '', label: 'FECHA DE INICIO' },
  { id: '', label: 'FECHA DE TERMINO' },
  { id: '', label: 'MONTO' },
  { id: '', label: 'ES REINVERSIÓN' },
  { id: '', label: 'ESTATUS' },
  { id: '', label: '' },
];

const HEADER = [
  'ID',
  'N° CONTRATO',
  'SOLICITANTE',
  'FECHA DE INICIO',
  'FECHA DE TERMINO',
  'MONTO',
  'ES REINVERSIÓN',
  'ESTATUS',
];

const currentDate = new Date();
const primerDiaMes = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
const ultimoDiaMes = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

const defaultFilters = {
  name: '',
  area: [],
  estatus: 'all',
  startDate: primerDiaMes,
  endDate: ultimoDiaMes,
};

const handleDownloadExcel = (dataFiltered) => {
  const data = [
    {
      sheet: 'Solicitudes',
      columns: [
        { label: 'ID', value: 'idFondo' },
        { label: 'CONTRATO', value: 'idContrato' },
        {
          label: 'NOMBRE COMPLETO',
          value: (row) => `${row.nombre_persona} ${row.pri_apellido} ${row.sec_apellido}`,
        },
        { label: 'FECHA INICIO', value: 'fechaInicio' },
        { label: 'FECHA DE FIN', value: 'fechaFin' },
        { label: 'MONTO', value: (row) => `${fCurrency(row.monto)}` },
        {
          label: 'ES REINVERSIÓN',
          value: (row) => (row.esReinversion === 1 ? 'SÍ' : 'NO'),
        },
        { label: 'ESTATUS', value: 'nombreEstatusFondo' },
      ],
      content: dataFiltered,
    },
  ];

  const settings = {
    fileName: `Solicitudes ${dayjs().format('DD-MM-YYYY HH_mm_ss')}.pdf`,
    extraLength: 3,
    writeMode: 'writeFile',
    writeOptions: {},
    RTL: false,
  };
  Xlsx(data, settings);
};

const handleDownloadPDF = (dataFiltered) => {
  const doc = new JsPDF();
  autoTable(doc, {
    head: [HEADER],
    body: dataFiltered.map((item) => [
      item.idFondo,
      item.idContrato,
      `${item.nombre_persona} ${item.pri_apellido} ${item.sec_apellido}`,
      item.fechaInicio,
      item.fechaFin,
      fCurrency(item.monto),
      item.esReinversion === 1 ? 'SÍ' : 'NO',
      item.nombreEstatusFondo,
    ]),
  });
  doc.save(`Solicitudes ${dayjs().format('DD-MM-YYYY HH_mm_ss')}.pdf`);
};

export default function SolicitudesTable({ solicitudes, solicitudesMutate }) {
  const table = useTable();
  const targetRef = useRef();
  const { enqueueSnackbar } = useSnackbar();
  const { user: datosUser } = useAuthContext();
  const [filters, setFilters] = useState(defaultFilters);
  const [fechaI, setFechaI] = useState(primerDiaMes);
  const [fechaF, setFechaF] = useState(ultimoDiaMes);

  const canReset = !isEqual(defaultFilters, filters);
  const denseHeight = table.dense ? 52 : 72;

  const dateError =
    filters.startDate && filters.endDate
      ? new Date(filters.startDate).getTime() > new Date(filters.endDate).getTime()
      : false;

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const dataFiltered = applyFilter({
    inputData: solicitudes,
    comparator: getComparator(table.order, table.orderBy),
    filters,
    dateError,
  });

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

  const handleFilterStartDate = useCallback(
    (newValue) => {
      handleFilters('startDate', newValue);

      const date = new Date(newValue);
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      setFechaI(formattedDate);
    },

    [handleFilters]
  );

  const handleFilterEndDate = useCallback(
    (newValue) => {
      handleFilters('endDate', newValue);

      const date = new Date(newValue);
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      setFechaF(formattedDate);
    },
    [handleFilters]
  );

  const handleDisableUser = async (id, estatus) => {
    try {
      const update = await updateExternalUser(id, {
        estatus: estatus === 1 ? 0 : 1,
        modificadoPor: datosUser.idUsuario,
      });
      if (update.result) {
        enqueueSnackbar(`¡Se ha actualizado el usuario exitosamente!`, { variant: 'success' });
        solicitudesMutate();
      } else {
        enqueueSnackbar(`¡No se pudó actualizar los datos de usuario!`, { variant: 'warning' });
      }
    } catch (error) {
      console.error('Error en handleDisableUser:', error);
      enqueueSnackbar(`¡No se pudó actualizar los datos de usuario!`, { variant: 'error' });
    }
  };

  const handleExcel = async (e) => {
    e.preventDefault();
    if (dataFiltered.length === 0) {
      enqueueSnackbar(`¡No hay datos para exportar!`, { variant: 'warning' });
      return;
    }
    handleDownloadExcel(dataFiltered);
  };

  const handlePdf = async (e) => {
    e.preventDefault();
    if (dataFiltered.length === 0) {
      enqueueSnackbar(`¡No hay datos para exportar!`, { variant: 'warning' });
      return;
    }
    handleDownloadPDF(dataFiltered);
  };

  return (
    <Card>
      <CardHeader />
      <CardContent>
        {/* BUSCADOR DE REGISTROS */}
        <Stack sx={{ flexDirection: 'row', alignItems: 'center' }}>
          <SolicitudesTableToolbar filters={filters} onFilters={handleFilters} />
          <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Fecha inicio"
              // maxDate={fhF.setDate(fhF.getDate() + 1)}
              maxDate={new Date(fechaF).setDate(new Date(fechaF).getDate() + 1)}
              value={filters.startDate}
              onChange={handleFilterStartDate}
              slotProps={{
                textField: {
                  fullWidth: false,
                },
              }}
              sx={{
                pt: { xs: 1, md: 1 },
                pb: { xs: 1, md: 1 },
                pr: { xs: 2.5, md: 1 },
              }}
            />
          </LocalizationProvider>

          <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Fecha fin"
              // minDate={fhI.setDate(fhI.getDate() + 1)}
              minDate={new Date(fechaI).setDate(new Date(fechaI).getDate() + 1)}
              value={filters.endDate}
              onChange={handleFilterEndDate}
              slotProps={{ textField: { fullWidth: false } }}
              sx={{
                pt: { xs: 1, md: 1 },
                pb: { xs: 1, md: 1 },
                pr: { xs: 2.5, md: 1 },
              }}
            />
          </LocalizationProvider>
        </Stack>

        {canReset && (
          <SolicitudesTableFilterResult
            filters={filters}
            onFilters={handleFilters}
            //
            onResetFilters={handleResetFilters}
            //
            results={dataFiltered.length}
            sx={{ pb: 1, pt: 0 }}
          />
        )}

        {/* Iconos */}
        <Stack
          spacing={1}
          alignItems={{ xs: 'flex-start', md: 'flex-start' }}
          direction={{
            xs: 'row',
            md: 'row',
          }}
          sx={{
            pt: { xs: 1, md: 1 },
            pb: { xs: 1, md: 1 },
            pr: { xs: 1, md: 1 },
          }}
        >
          <Tooltip title="Exportar a XLS" placement="top" arrow>
            <Button variant="text" onClick={handleExcel} sx={{ padding: 1 }}>
              <Iconify icon="teenyicons:xls-outline" />
            </Button>
          </Tooltip>

          <Tooltip title="Exportar a PDF" placement="top" arrow>
            <Button variant="text" onClick={handlePdf} sx={{ padding: 1 }}>
              <Iconify icon="teenyicons:pdf-outline" />
            </Button>
          </Tooltip>
        </Stack>

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }} ref={targetRef}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={solicitudes.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
              />

              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((item) => (
                    <SolicitudesTableRow
                      key={item.idFondo}
                      row={item}
                      selected={table.selected.includes(item.idFondo)}
                      onSelectRow={() => table.onSelectRow(item.idFondo)}
                      onDisableRow={() => handleDisableUser(item.contrato, item.estatus)}
                      usersMutate={solicitudesMutate}
                    />
                  ))}

                <TableEmptyRows
                  height={denseHeight}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, solicitudes.length)}
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
      </CardContent>
    </Card>
  );
}

SolicitudesTable.propTypes = {
  solicitudes: PropTypes.array,
  solicitudesMutate: PropTypes.func,
};

const applyFilter = ({ inputData, comparator, filters, dateError }) => {
  const { name, startDate, endDate, modalidad } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter((item) => {
      const nameLower = name.toLowerCase();
      const fullname = `${item.nombre_persona} ${item.pri_apellido} ${item.sec_apellido}`;
      const monto = fCurrency(item.monto);
      const esReinversion = item.estatusFondo === 1 ? 'SÍ' : 'NO';

      return (
        item.idFondo.toString().toLowerCase().includes(nameLower) ||
        item.idContrato.toString().toLowerCase().includes(nameLower) ||
        fullname.toString().toLowerCase().includes(nameLower) ||
        item.fechaInicio.toLowerCase().includes(nameLower) ||
        item.fechaFin.toLowerCase().includes(nameLower) ||
        monto.toString().toLowerCase().includes(nameLower) ||
        esReinversion.toString().toLowerCase().includes(nameLower) ||
        item.nombreEstatusFondo.toLowerCase().includes(nameLower)
      );
    });
  }

  /*
  const endDateC = new Date(endDate);
  const endDateF = new Date(endDateC);
  
  endDateC.setTime(endDateC.getTime() + 86400000);
  const endDateF = endDateC.toISOString();
  */

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter(
        (item) =>
          fTimestamp(item.fechaInicio) >= fTimestamp(startDate) &&
          fTimestamp(item.fechaInicio) <= fTimestamp(endDate)
      );
    }
  }

  if (modalidad?.length) {
    inputData = inputData.filter((i) => modalidad.includes(i?.modalidad));
  }

  return inputData;
};
