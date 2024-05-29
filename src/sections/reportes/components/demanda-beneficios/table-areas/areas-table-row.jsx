import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';

import Label from 'src/components/label';
// ----------------------------------------------------------------------

export default function AreasTableRow({ row, selected }) {
  const { id, label, value } = row;

  const renderPrimary = (
    <TableRow hover selected={selected}>

      <TableCell>
        <Box>
          {id}
        </Box>
      </TableCell>

      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>

        <ListItemText
          primary={label}
          primaryTypographyProps={{ typography: 'body2' }}
          secondaryTypographyProps={{
            component: 'span',
            color: 'text.disabled',
          }}
        />
      </TableCell>

      <TableCell>
        <Label>
          {value}
        </Label>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      {renderPrimary}
    </>
  );
}

AreasTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
};
