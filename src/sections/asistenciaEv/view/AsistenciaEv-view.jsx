import JsPDF from 'jspdf';
import Xlsx from 'json-as-xlsx';
import autoTable from 'jspdf-autotable';
import { useState, useEffect, useCallback } from 'react';

import TableContainer from '@mui/material/TableContainer';
import { Card, Stack, Table, Tooltip, MenuItem, Container, TableBody } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useAuthContext } from 'src/auth/hooks';
import { useGetAsistenciaEv, useGetAsistenciaEvUser } from 'src/api/asistenciaEv/asistenciaEv';

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

import AsistenciaEvRow from '../components/asistencias-row';
import EventScannerDialog from '../components/event-scanner-dialog';
import ToolbarAsistenciaEv from '../components/asistencia-table-toolbar';

const TABLE_HEAD = [
  { id: 'idEvento', label: 'ID Evento' },
  { id: 'estatusAsistentes', label:'Estatus de asistentes' },
  { id: 'titulo', label: 'Nombre del evento' },
  { id: 'fechaEvento', label: 'Fecha del Evento' },
  { id: 'horaEvento', label: 'Hora del Evento' },
  { id: 'limiteRecepcion', label: 'Límite de Recepción' },
  { id: 'num_empleado', label: 'Número de empleado' },
  { id: 'nombreCompleto', label: 'Nombre Colaborador' },
  { id: 'nsede', label: 'Sede' },
  { id: 'ndepto', label: 'Departamento' },
];

const defaultFilters = {
  name: '',
  titulo: 'all',
};

function handleDownloadExcel(dataFiltered) {
  const data = [
    {
      sheet: 'Eventos Colaboradores',
      columns: [
        { label: 'ID', value: 'idEvento' },
        { label: 'Estatus Asistentes', value: 'estatusAsistentes' },
        { label: 'Nombre del Evento', value: 'titulo' },
        { label: 'Fecha del Evento', value: 'fechaEvento' },
        { label: 'Hora del Evento', value: 'horaEvento' },
        { label: 'Límite de Recepción', value: 'limiteRecepcion' },
        { label: 'Número Empleado', value: 'num_empleado' },
        { label: 'Nombre Colaborador', value: 'nombreCompleto' },
        { label: 'Sede', value: 'nsede' },
        { label: 'Departamento', value: 'ndepto' },
      ],
      content: dataFiltered,
    },
  ];
  const settings = {
    fileName: 'Eventos',
    extraLength: 4,
    writeMode: 'writeFile',
    writeOptions: {},
    RTL: false,
  };
  Xlsx(data, settings);
}

function handleDownloadPDF(dataFiltered) {
  const doc = new JsPDF();
  const data = dataFiltered.map((item) => [
    item.idEvento,
    item.estatusAsistentes,
    item.titulo,
    item.fechaEvento,
    item.horaEvento,
    item.limiteRecepcion,
    item.num_empleado,
    item.nombreCompleto,
    item.nsede,
    item.ndepto,
  ]);

  autoTable(doc, {
    head: [
      [
        'ID',
        'Estatus de asistentes',
        'Nombre del Evento',
        'Nombre del evento',
        'Hora del evento',
        'Límite de recepción',
        'Número empleado',
        'Nombre del colaborador',
        'Sede',
        'Departamento',
      ],
    ],
    body: data,
  });
  doc.save('Eventos.pdf');
}

export default function AsistenciaEvView() {
  const table = useTable();
  const settings = useSettingsContext();
  const { user: datosUser } = useAuthContext();
  const eventDialog = useBoolean();

  const { data: AsistenciaEvData } = useGetAsistenciaEv();
  const { data: AsistenciaEvUserData } = useGetAsistenciaEvUser(datosUser?.idUsuario);

  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    if (datosUser?.permisos === 6) {
      setTableData(AsistenciaEvData || []);
    } else {
      setTableData(AsistenciaEvUserData || []);
    }
  }, [AsistenciaEvData, AsistenciaEvUserData, datosUser]);

  const titulos = [...new Set(tableData?.map((item) => item.titulo))];

  const handleFilters = useCallback((name, value) => {
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

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
  const notFound = !dataFiltered.length;

  const handlePdf = async (e) => {
    e.preventDefault();
    handleDownloadPDF(dataFiltered);
  };

  const handleExcel = async (e) => {
    e.preventDefault();
    handleDownloadExcel(dataFiltered);
  };

  const handleEventTicket = async () => {
    eventDialog.onTrue();
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading="Asistencia a eventos"
        links={[{ name: 'Eventos' }, { name: 'Colaboradores' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <Card>
        <ToolbarAsistenciaEv
          filters={filters}
          onFilters={handleFilters}
          handleChangeTitulo={(titulo) => handleFilters('titulo', titulo)}
          titulos={titulos}
        />
        <Stack
          spacing={1}
          alignItems={{ xs: 'flex-start', md: 'flex-start' }}
          direction={{ xs: 'column', md: 'row' }}
          sx={{ p: 1, pr: { xs: 1, md: 1 } }}
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
          <Tooltip title="Escanear entrada de evento" placement="top" arrow>
            <MenuItem sx={{ width: 50, p: 1 }} onClick={handleEventTicket}>
              <Iconify icon="uil:qrcode-scan" />
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
                {dataInPage.map((row) => (
                  <AsistenciaEvRow key={row.idEvento} row={row} />
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
        />
      </Card>
      <EventScannerDialog
        open={eventDialog.value}
        onClose={eventDialog.onFalse}
        mutate={() => console.log('s')}
      />
    </Container>
    // <NewEventDialog
    //     open={eventDialog.value}
    //     onClose={eventDialog.onFalse}
    //     mutate={eventsMutate}
    //   />
  );
}

function applyFilter({ inputData, comparator, filters }) {
  const { name, titulo } = filters;

  if (titulo !== 'all') {
    inputData = inputData.filter((item) => item.titulo === titulo);
  }

  if (name) {
    const lowerCaseName = name.toLowerCase();
    inputData = inputData.filter(
      (item) =>
        item.idEvento.toString().includes(lowerCaseName) ||
        item.estatusAsistentes.toLowerCase().includes(lowerCaseName) ||
        item.titulo.toLowerCase().includes(lowerCaseName) ||
        item.fechaEvento.toLowerCase().includes(lowerCaseName) ||
        item.horaEvento.toLowerCase().includes(lowerCaseName) ||
        item.limiteRecepcion.toLowerCase().includes(lowerCaseName) ||
        item.num_empleado.toString().includes(lowerCaseName) ||
        item.nombreCompleto.toLowerCase().includes(lowerCaseName) ||
        item.nsede.toLowerCase().includes(lowerCaseName) ||
        item.ndepto.toLowerCase().includes(lowerCaseName)
    );
  }

  const stabilizedThis = inputData.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  return stabilizedThis.map((el) => el[0]);
}