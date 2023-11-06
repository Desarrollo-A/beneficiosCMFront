import JsPDF from 'jspdf';
import Xlsx from 'json-as-xlsx';
import isEqual from 'lodash/isEqual';
import autoTable from 'jspdf-autotable';
import { useState, useCallback } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
// import { Button } from '@mui/material';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
// import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import CardHeader from '@mui/material/CardHeader';
// import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import Iconify from 'src/components/iconify';
// import { useSnackbar } from 'src/components/snackbar';
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

// import { useSettingsContext } from 'src/components/settings';
import UserTableRow from './filas-tabla-citas';
import UserTableToolbar from './barratareas-tabla-citas';
import UserTableFiltersResult from './filtros-tabla-citas';

const doc = new JsPDF();

const TABLE_HEAD = [
  { id: '', label: 'ID Cita' },
  { id: '', label: 'ID Especialista' },
  { id: '', label: 'ID Paciente' },
  { id: '', label: 'Area' },
  { id: '', label: 'Estatus' },
  { id: '', label: 'Fecha Inicio'},
  { id: '', label: 'Fecha Final'},
  { id: '', width: 88 },
];

const HEADER = ["ID Cita", "ID Especialista", "ID Paciente", "Area", "Estatus", "Fecha Inicio", "Fecha Final"];

const DEFAULT_FILTERS = {
  name: '',
  area: [],
  estatus: 'all',
};

export default function UserList() {
  const table = useTable();
  const router = useRouter();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [espe, setEspe] = useState([]); // Especialista
  const [tableData, setTableData] = useState([]);

  const canReset = !isEqual(DEFAULT_FILTERS, filters);
  const _rp = espe.flatMap((es) => (es.nombre));

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

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

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.user.edit(id));
    },
    [router]
  );

  const handleExcel = async e =>{
    e.preventDefault();
        handleDownloadExcel(
            tableData
        );
  } 

  const handlePdf = async e =>{
    e.preventDefault();
        handleDownloadPDF(
          tableData
        );
  }

  return (
    <div>
        <Card>
            <CardHeader title="Upload Single File" />
            <CardContent>
              <UserTableToolbar
                filters={filters}
                onFilters={handleFilters}
                //
                roleOptions={_rp}
              />

              {canReset && (
                <UserTableFiltersResult
                  filters={filters}
                  onFilters={handleFilters}
                  //
                  onResetFilters={handleResetFilters}
                  //
                  results={dataFiltered.length}
                  sx={{ p: 2.5, pt: 0 }}
                />
              )}

              { /* Iconos */ }
              <Stack
                 spacing={1}
                 alignItems={{ xs: 'flex-end', md: 'center' }}
                 direction={{
                   xs: 'column',
                   md: 'row',
                 }}
                 sx={{
                   p: 1,
                   pr: { xs: 1, md: 1 },
                 }}
              >
              
                  <MenuItem
                    sx={{ width: 50, p: 1 }}
                    onClick={handleExcel}
                  >
                    <Iconify icon="teenyicons:xls-outline" />
                  </MenuItem>
               
                  <MenuItem
                    sx={{ width: 50, p: 1 }}
                    onClick={handlePdf}
                  >
                    <Iconify icon="teenyicons:pdf-outline" />
                  </MenuItem>
               
              </Stack>
               
              <TableContainer sx={{ position: 'relative', overflow: 'unset' }} >
                <Scrollbar>
                  <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }} ref={targetRef}>
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
                        .map((cita) => (
                          <UserTableRow
                            key={`route_${cita.idCita}_${cita.estatus}`}
                            row={cita}
                            selected={table.selected.includes(cita.idCita)}
                            onSelectRow={() => table.onSelectRow(cita.idCita)}
                            onDeleteRow={() => handleDeleteRow(cita.idCita)}
                            onEditRow={() => handleEditRow(cita.idCita)}
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
              />
            </CardContent>
        </Card>
    </div>
  );
}

const handleDownloadExcel = tableData => { 
  console.log(tableData.idCita)
  const data = [
    {
      sheet: "Historial Citas",
      columns: [
        { label: "ID Cita", value: "idCita" },
        { label: "ID Especialista", value: "idEspecialista" },
        { label: "ID Paciente", value: "idPaciente" },
        { label: "Area", value: "area" },
        { label: "Estatus", value: "estatus" },
        { label: "Fecha Inicio", value: "fechaInicio" },
        { label: "Fecha Final", value: "fechaFinal" },
      ],
      content:tableData,
    },
  ]

  const settings = {
    fileName: "Historial Citas", 
    extraLength: 3, 
    writeMode: "writeFile", 
    writeOptions: {}, 
    RTL: false, 
  }
  Xlsx(data, settings)
}

const handleDownloadPDF = (tableData) => { 
  autoTable(doc, {
    head: [HEADER],
    body: tableData.map( item => ([item.idCita, item.idEspecialista, item.idPaciente,
    item.area, item.estatus, item.fechaInicio, item.fechaFinal])) ,
    })
  doc.save('Historial Citas.pdf')
}

const applyFilter = ({ inputData, comparator, filters }) => {
  const { name, area } = filters;

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
        cita.idCita.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        cita.estatus.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        cita.area.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        cita.idEspecialista.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        cita.idPaciente.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (area.length) {
    inputData = inputData.filter((cita) => area.includes(cita.area));
  }

   return inputData;
}