import PropTypes from 'prop-types';
import { /* useState, */ useCallback } from 'react';

import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function UserTableToolbar({ filters, onFilters, roleOptions, handleChangeId, rol }) {
  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  /*
  const [area, setArea] = useState(585);

  const handleFilterRole = useCallback(
    (event) => {
      onFilters(
        'area',
         event.target.value
      );
      handleChangeId(event.target.value);
      setArea(event.target.value);
    },
    [onFilters, handleChangeId]
  );
  */

  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      direction={{
        xs: 'column',
        md: 'row',
      }}
      sx={{
        pt: { xs: 1, md: 1 },
        pb: { xs: 1, md: 1 },
        pr: { xs: 2.5, md: 1 },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
        <TextField
          fullWidth
          value={filters.name}
          onChange={handleFilterName}
          placeholder="Buscar"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>
    </Stack>
  );
}

UserTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  roleOptions: PropTypes.any,
  handleChangeId: PropTypes.any,
  rol: PropTypes.any,
};
