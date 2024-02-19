import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import { useRef, useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';

import { endpoints } from 'src/utils/axios';

import { useUpdateUser } from 'src/api/user';
import { useAuthContext } from 'src/auth/hooks';
import { useGetGeneral, usePostGeneral } from 'src/api/general';

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

import UserTableToolbar from './encuestas-tabla-barra';
import EncuestasTablaFilas from './encuestas-tabla-filas';
import UserTableFiltersResult from './encuestas-tabla-filtros';

const TABLE_HEAD = [
  { id: '', label: 'ID' },
  { id: '', label: 'FECHA CREACIÓN' },
  { id: '', label: 'ESTATUS' },
  { id: '', label: 'DÍAS HABILES' },
  { id: '', label: '' },
];

const defaultFilters = {
  name: '',
  area: [],
  estatus: 'all',
};

export default function EncuestasLista({ encuestas, estatusCt }) {
  const table = useTable();
  const updateUser = useUpdateUser();
  const { enqueueSnackbar } = useSnackbar();

  const { user } = useAuthContext();

  let puestos = 0;

  if (user?.idRol === "4" || user?.idRol === 4) {
    puestos = 158;
  } else {
    puestos = user?.idPuesto;
  }

  const [area, setArea] = useState(puestos);

  useEffect(() => {
    setArea(area);
  }, [area ]);

  const { getData } = usePostGeneral(area, endpoints.encuestas.getEncuestasCreadas, "getData");

  const { EstatusData } = usePostGeneral(area, endpoints.encuestas.getEstatusUno, "EstatusData");

  const targetRef = useRef();

  const { especialistasData } = useGetGeneral(endpoints.reportes.especialistas, "especialistasData");

  const [especialistas, setEspecialistas] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);
  const [userData, setUserData] = useState(getData || []);

  useEffect(() => {
    setUserData(getData || []);
  }, [getData]);

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

  const handleDisableUser = async (id) => {
    try {
      const update = await updateUser(
        new URLSearchParams({
          idUsuario: id,
          estatus: 0,
          modificadoPor: 1,
        })
      );
      if (update.result) {
        enqueueSnackbar(`¡Se ha actualizado el usuario exitosamente!`, { variant: 'success' });
      } else {
        enqueueSnackbar(`¡No se pudó actualizar los datos de usuario!`, { variant: 'success' });
      }
    } catch (error) {
      console.error('Error en handleDisableUser:', error);
      enqueueSnackbar(`¡No se pudó actualizar los datos de usuario!`, { variant: 'danger' });
    }
  };

  useEffect(() => {
    if (especialistasData.length) {
      setEspecialistas(especialistasData);
    }
  }, [especialistasData]);

  const handleChangeId = (newAr) => {
    setArea(newAr);
  }

  return (
    <Card>
      <CardHeader />
      <CardContent>
        <UserTableToolbar
          filters={filters}
          onFilters={handleFilters}
          roleOptions={especialistas}
          handleChangeId={handleChangeId}
          //
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
                  .map((usuario, index) => (
                    <EncuestasTablaFilas
                      key={index}
                      row={usuario}
                      selected={table.selected.includes(usuario.id)}
                      onSelectRow={() => table.onSelectRow(usuario.id)}
                      onDeleteRow={() => handleDisableUser(usuario.id)}
                      est={EstatusData}
                      puestos={puestos}
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

EncuestasLista.propTypes = {
  encuestas: PropTypes.array,
  estatusCt: PropTypes.array,
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
      return (
        user?.idEncuesta.toString().toLowerCase().includes(nameLower) ||
        user?.fechaCreacion.toLowerCase().includes(nameLower)
      );
    });
  }

  if (area.length) {
    inputData = inputData.filter((user) => area.includes(user?.area));
  }

  return inputData;
};
