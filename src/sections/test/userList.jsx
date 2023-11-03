import isEqual from 'lodash/isEqual';
import { useState, useCallback } from 'react';

import Card from '@mui/material/Card';
// import { Button } from '@mui/material';
// import Stack from '@mui/material/Stack';
// import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import CardHeader from '@mui/material/CardHeader';
// import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';


// import Iconify from 'src/components/iconify';
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
import UserTableToolbar from './barratareas-tabla-citas';

const DEFAULT_FILTERS = {
  name: '',
  area: [],
  estatus: 'all',
};

export default function UserList() {
  const table = useTable();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [espe, setEspe] = useState([]); //Especialista

  const canReset = !isEqual(DEFAULT_FILTERS, filters);
  const _rp = espe.flatMap((es) => (es.nombre));

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