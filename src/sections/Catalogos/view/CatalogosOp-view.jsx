import JsPDF from 'jspdf';
import Xlsx from 'json-as-xlsx';
import autoTable from 'jspdf-autotable';
import { useState, useEffect, useCallback } from 'react';

import { useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import {Card,Stack,Table, Button,Tooltip, MenuItem, Container, TableBody  } from '@mui/material';

import { useGetCatalogos } from 'src/api/catalogos/catalogos';

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

import CatalogoRow from '../components/user-cat-row';
import UserTableToolbar from '../components/cat-table-toolbar';
import EditarEstatus from '../components/modal-editar-catalogo';
import AgregarCatalogoModal from '../components/modal-add-catalogo';

const TABLE_HEAD = [
  { id: 'idCatalogo', label: 'ID', width: 88 },
  { id: 'nombre', label: 'Nombre de catálogo', width: 300 },
  { id: 'estatus', label: 'Estatus', width: 200 },
  { id: 'acciones', label: 'Acciones', width: 88 },
];
const defaultFilters = {
  name: '',
  estatus: 'all',
};

function handleDownloadExcel(dataFiltered) {
  const data = [
    {
      sheet: 'Catalogos',
      columns: [
        { label: 'ID', value: 'idCatalogo' },
        { label: 'Nombre', value: 'nombre' },
        { label: 'Estatus', value: 'estatus' },
      ],
      content: dataFiltered,
    },
  ];
  const settings = {
    fileName: 'Catalogos',
    extraLength: 3,
    writeMode: 'writeFile',
    writeOptions: {},
    RTL: false,
  };
  Xlsx(data, settings);
}

function handleDownloadPDF(dataFiltered) {
  const doc = new JsPDF();
  const data = dataFiltered.map((item) => [item.idCatalogo, item.nombre, item.estatus]);

  autoTable(doc, {
    head: [['ID', 'Nombre', 'Estatus']],
    body: data,
  });
  doc.save('Catálogos.pdf');
}

export default function CatalogosOpView() {
  const table = useTable();
  const settings = useSettingsContext();
  const [openEstatusDialog, setOpenEstatusDialog] = useState(false);
  const [openAgregarDialog, setOpenAgregarDialog] = useState(false);
  const [currentCatalogo, setCurrentCatalogo] = useState(null);
  const [currentEstatus, setCurrentEstatus] = useState('');

  const { data: catalogosData, mutate } = useGetCatalogos();
  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    if (catalogosData) {
      setTableData(catalogosData);
    }
  }, [catalogosData]);

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
      const deleteRow = tableData.filter((row) => row.idCatalogo !== id);
      setTableData(deleteRow);
      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData]
  );

  const handleEditRow = useCallback((idCatalogo, estatus) => {
    setCurrentCatalogo(idCatalogo);
    setCurrentEstatus(estatus);
    setOpenEstatusDialog(true);
  }, []);

  const handleAddCatalogo = useCallback(
    (newCatalogo) => {
      setTableData((prevData) => [
        ...prevData,
        { ...newCatalogo, idCatalogo: prevData.length + 1 },
      ]);
      mutate();
    },
    [mutate]
  );

  const handlePdf = async (e) => {
    e.preventDefault();
    handleDownloadPDF(dataFiltered);
  };

  const handleExcel = async (e) => {
    e.preventDefault();
    handleDownloadExcel(dataFiltered);
  };

  const theme = useTheme();
  const [animate] = useState(false);
  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Catálogos"
          links={[{ name: 'Catalogos' }, { name: 'Editar' }]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: { xs: 3, md: 5 } }}
        >
          <Button
            className={`ButtonCatalogos ${animate ? 'animate' : ''}`}
            id="animateElement"
            onClick={() => setOpenAgregarDialog(true)}
            sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#140a10' : '#edf1ff' }}
          >
            <span>Agregar </span>
            <Iconify icon="line-md:plus-circle-filled" />
          </Button>
        </Stack>

        <Card>
          <UserTableToolbar
            filters={filters}
            onFilters={handleFilters}
            handleChangeEstatus={(estatus) => handleFilters('estatus', estatus)}
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
                    <CatalogoRow
                      key={row.idCatalogo}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      onEditRow={() => handleEditRow(row.id, row.estatus)}
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
        </Card>
      </Container>
      <EditarEstatus
        open={openEstatusDialog}
        onClose={() => setOpenEstatusDialog(false)}
        idCatalogo={currentCatalogo}
        estatusVal={currentEstatus}
      />
      <AgregarCatalogoModal
        open={openAgregarDialog}
        onClose={() => setOpenAgregarDialog(false)}
        onAddCatalogo={handleAddCatalogo}
      />
    </>
  );
}
function applyFilter({ inputData, comparator, filters }) {
  const { name, estatus } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (item) =>
        item.nombre.toLowerCase().includes(name.toLowerCase()) ||
        item.estatus.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (estatus && estatus !== 'all') {
    inputData = inputData.filter((item) => item.estatus === estatus);
  }

  return inputData;
}
