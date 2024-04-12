import JsPDF from 'jspdf';
import Xlsx from 'json-as-xlsx';
import PropTypes from 'prop-types';
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

import UserTableRow from './user-table-row';
import UserTableToolbar from './user-table-toolbar';
import UserTableFiltersResult from './user-table-filters';

const TABLE_HEAD = [
  { id: '', label: 'ID' },
  { id: '', label: 'NOMBRE COMPLETO' },
  { id: '', label: 'TELÉFONO' },
  { id: '', label: 'CORREO' },
  { id: '', label: 'SEXO' },
  { id: '', label: 'ESTATUS' },
  { id: '', label: '' },
];

const HEADER = ['ID', 'NOMBRE COMPLETO', 'TELÉFONO', 'CORREO', 'SEXO', 'ESTATUS'];

const defaultFilters = {
  name: '',
  area: [],
  estatus: 'all',
};

const handleDownloadExcel = (dataFiltered) => {
  const data = [
    {
      sheet: 'USUARIOS',
      columns: [
        { label: 'ID', value: 'id' },
        { label: 'NOMBRE COMPLETO', value: 'nombre' },
        { label: 'TELÉFONO', value: 'telefono' || 'No aplica' },
        { label: 'CORREO', value: 'correo' || 'No aplica' },
        { label: 'SEXO', value: 'sexo' },
        { label: 'ESTATUS', value: 'estatus' },
      ],
      content: dataFiltered,
    },
  ];

  const settings = {
    fileName: 'Usuarios',
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
      item.id,
      item.nombre,
      item.telefono || 'No aplica',
      item.correo || 'No aplica',
      item.sexo === 'F' || item.sexo === 'f' ? 'FEMENINO' : 'MASCULINO',
      item.estatus === 1 ? 'ACTIVO' : 'INACTIVO',
    ]),
  });
  doc.save('Usuarios.pdf');
};

export default function UserList({ userData, usersMutate }) {
  const table = useTable();
  const targetRef = useRef();
  const { enqueueSnackbar } = useSnackbar();

  const { user: datosUser } = useAuthContext();

  const [filters, setFilters] = useState(defaultFilters);

  const canReset = !isEqual(defaultFilters, filters);
  const denseHeight = table.dense ? 52 : 72;

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const dataFiltered = applyFilter({
    inputData: userData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
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

  const handleDisableUser = async (id, estatus) => {
    try {
      const update = await updateExternalUser(id, {
        estatus: estatus === 1 ? 0 : 1,
        modificadoPor: datosUser.idUsuario,
      });
      if (update.result) {
        enqueueSnackbar(`¡Se ha actualizado el usuario exitosamente!`, { variant: 'success' });
        usersMutate();
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
        <UserTableToolbar filters={filters} onFilters={handleFilters} />

        {canReset && (
          <UserTableFiltersResult
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
                rowCount={userData.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
              />

              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((usuario) => (
                    <UserTableRow
                      key={`${usuario.id}`}
                      row={usuario}
                      selected={table.selected.includes(usuario.id)}
                      onSelectRow={() => table.onSelectRow(usuario.id)}
                      onDisableRow={() => handleDisableUser(usuario.contrato, usuario.estatus)}
                      usersMutate={usersMutate}
                    />
                  ))}

                <TableEmptyRows
                  height={denseHeight}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, userData.length)}
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

UserList.propTypes = {
  userData: PropTypes.array,
  usersMutate: PropTypes.func,
};

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
    inputData = inputData.filter((user) => {
      const nameLower = name.toLowerCase();
      const estatus = user.estatus === 1 ? 'ACTIVO' : 'INACTIVO';
      const sexo = user.sexo === 'F' ? 'FEMENINO' : 'MASCULINO';
      const correo = user.correo || 'No aplica';
      const telefono = user.telefono || 'No aplica';
      return (
        user.id.toString().toLowerCase().includes(nameLower) ||
        user.nombre.toLowerCase().includes(nameLower) ||
        correo.toString().toLowerCase().includes(nameLower) ||
        estatus.toString().toLowerCase().includes(nameLower) ||
        sexo.toString().toLowerCase().includes(nameLower) ||
        (typeof telefono === 'string' && telefono.toLowerCase().includes(nameLower)) ||
        (typeof telefono === 'number' && telefono.toString().includes(nameLower))
      );
    });
  }

  if (area.length) {
    inputData = inputData.filter((user) => area.includes(user.area));
  }

  return inputData;
};
