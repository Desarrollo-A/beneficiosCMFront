import JsPDF from 'jspdf';
import Xlsx from 'json-as-xlsx';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import autoTable from 'jspdf-autotable';
import { useRef, useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import { Button } from '@mui/material';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import TableBody from '@mui/material/TableBody';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

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

const doc = new JsPDF();

const BACK = 'http://localhost/beneficiosCMBack/'

const TABLE_HEAD = [
  { id: '', label: 'ID' },
  { id: '', label: 'USUARIO' },
  { id: '', label: 'TELÉFONO' },
  { id: '', label: 'AREA' },
  { id: '', label: 'OFICINA' },
  { id: '', label: 'SEDE'},
  { id: '', label: 'CORREO'},
  { id: '', width: 'ACCIONES' },
];

const HEADER = ["ID", "USUARIO", "TELÉFONO", "ÁREA", "OFICINA", "SEDE", "CORREO"];

const defaultFilters = {
  name: '',
  area: [],
  estatus: 'all',
};

const handleDownloadExcel = (dataFiltered) => { 
  const data = [
    {
      sheet: "USUARIOS",
      columns: [
        { label: "ID", value: "id" },
        { label: "USUARIO", value: "nombre" },
        { label: "TELÉFONO", value: "telefono" },
        { label: "ÁREA", value: "area" },
        { label: "OFICINA", value: "oficina" },
        { label: "SEDE", value: "sede" },
        { label: "CORREO", value: "correo" },
      ],
      content: dataFiltered,
    },
  ]

  const settings = {
    fileName: "Usuarios", 
    extraLength: 3, 
    writeMode: "writeFile", 
    writeOptions: {}, 
    RTL: false, 
  }
  Xlsx(data, settings)
}

const handleDownloadPDF = (dataFiltered) => { 
  autoTable(doc, {
    head: [HEADER],
    body: dataFiltered.map( item => ([item.id, item.nombre, item.telefono,
    item.area, item.oficina, item.sede, item.correo])) ,
    })
  doc.save('Usuarios.pdf')
}

export default function UserList({users, loadUsers}) {
  const table = useTable();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  // const settings = useSettingsContext();
  const targetRef = useRef();

  const [filters, setFilters] = useState(defaultFilters);
  const [areas, setAreas] = useState([]); // areas
  const [userData, setUserData] = useState(users || []);

  // Utiliza useEffect con dependencia en las props 'usuarios'
  useEffect(() => {
    setUserData(users || []);
  }, [users]);

  useEffect(() => {
    fetch(`${BACK}/Usuario/getAreas`)
      .then((res) => res.json())
      .then((data) => {
        setAreas(data.data);
      })
      .catch((error) => {
        alert(error);
      });
  }, []);
  
  const canReset = !isEqual(defaultFilters, filters);
  const _rp = areas.flatMap((es) => (es.area));
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

  const handleDeleteRow = async (id) => {
    console.log("Deleteando a", id);
  
    try {
      const response = await fetch(`${BACK}Usuario/updateUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'idUsuario': id,
          'estatus': 0,
        }),
      });
      const data = await response.json();
      if (data.result) {
        enqueueSnackbar(`¡Se ha actualizado el usuario exitosamente!`, { variant: 'success' });
        
      } else {
        enqueueSnackbar(`¡No se pudó actualizar los datos de usuario!`, { variant: 'warning' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar(`¡No se pudó actualizar los datos de usuario!`, { variant: 'danger' });
    }
  };

  const handleEditRow = useCallback((id) => {
    router.push(paths.dashboard.user.edit(id));
    console.log("Editando id", id);
    }, [ router ]
  );

  const handleExcel = async e =>{
    e.preventDefault();
    handleDownloadExcel(
      dataFiltered
    );
    setAreas([]);
  }

  const handlePdf = async e =>{
    e.preventDefault();
    handleDownloadPDF(
      dataFiltered
    );
  }

  return (
    
        <Card>
            <CardHeader />
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
                  sx={{ pb: 1, pt: 0 }}
                />
              )}

              { /* Iconos */ }
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
                <Button variant="text" onClick={handleExcel} sx={{padding: 1}}>
                  <Iconify icon="teenyicons:xls-outline" />
                </Button>
                <Button variant="text" onClick={handlePdf} sx={{padding: 1}}>
                  <Iconify icon="teenyicons:pdf-outline" />
                </Button>
              </Stack>
               
              <TableContainer sx={{ position: 'relative', overflow: 'unset' }} >
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
                            key={`route_${usuario.id}`}
                            row={usuario}
                            selected={table.selected.includes(usuario.id)}
                            onSelectRow={() => table.onSelectRow(usuario.id)}
                            onDeleteRow={() => handleDeleteRow(usuario.id)}
                            onEditRow={() => handleEditRow(usuario.id)}
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
  users: PropTypes.array,
  loadUsers: PropTypes.func
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
    inputData = inputData.filter((user) => {
      const nameLower = name.toLowerCase();
      return (
        user.id.toString().toLowerCase().includes(nameLower) ||
        user.nombre.toLowerCase().includes(nameLower) ||
        user.area.toString().toLowerCase().includes(nameLower) ||
        user.oficina.toLowerCase().includes(nameLower) ||
        user.sede.toString().toLowerCase().includes(nameLower) ||
        user.correo.toString().toLowerCase().includes(nameLower) ||
        (typeof user.telefono === 'string' && user.telefono.toLowerCase().includes(nameLower)) ||
        (typeof user.telefono === 'number' && user.telefono.toString().includes(nameLower))
      );
    });
  }

  if (area.length) {
    inputData = inputData.filter((user) => area.includes(user.area));
  }

  return inputData;
}