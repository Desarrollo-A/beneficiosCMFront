import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import TablePagination from '@mui/material/TablePagination';

// ----------------------------------------------------------------------

export default function TablePaginationCustom({
  dense,
  onChangeDense,
  rowsPerPageOptions = [5, 10, 25],
  sx,
  labels = {
    rowsPerPage: 'Filas por página',
    displayRows: 'de',
  },
  ...other
}) {
  return (
    <Box sx={{ position: 'relative', ...sx }}>
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        {...other}
        sx={{
          borderTopColor: 'transparent',
        }}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from} - ${to} de ${count}`}
      />
    </Box>
  );
}

TablePaginationCustom.propTypes = {
  dense: PropTypes.bool,
  onChangeDense: PropTypes.func,
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
  sx: PropTypes.object,
  labels: PropTypes.shape({
    rowsPerPage: PropTypes.string,
    displayRows: PropTypes.string,
  }),
};
