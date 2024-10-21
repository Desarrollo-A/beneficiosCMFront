import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function SolicitudBoletosTableToolbar({
  filters,
  onFilters,
  eveOptions,
}) {

  const [eve, setEve] = useState([filters.evento]);

  console.log(eve);

  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterEvento = useCallback(
    (event) => {
      onFilters(
        'evento',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
      setEve(event.target.value);
    },
    [onFilters]
  );

  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      direction={{
        xs: 'column',
        md: 'row',
      }}
      sx={{
        p: 2.5,
        pr: { xs: 2.5, md: 1 },
      }}
    >

      <FormControl
        sx={{
          width: '40%',
          pr: { xs: 1, md: 1 },
        }}
      >
        <InputLabel>Evento</InputLabel>

        <Select
          multiple
          value={filters.evento}
          onChange={handleFilterEvento}
          input={<OutlinedInput label="Evento" />}
          renderValue={(selected) => selected.map((value) => value).join(', ')}
          MenuProps={{
            PaperProps: {
              sx: { maxHeight: 240 },
            },
          }}
        >
          {!isEmpty(eveOptions) ? (
            eveOptions.map((option, index) => (
              <MenuItem key={index} value={option}>
                <Checkbox
                  disableRipple
                  size="small"
                  checked={filters.evento.includes(option)}
                />
                {option}
              </MenuItem>
            ))
          ) : (
            <Grid style={{ paddingTop: '3%' }}>
              <LinearProgress />
              <Box mb={3} />
            </Grid>
          )}
        </Select>
      </FormControl>

      <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
        <TextField
          fullWidth
          value={filters.name}
          onChange={handleFilterName}
          placeholder="Buscar..."
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

SolicitudBoletosTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  eveOptions: PropTypes.any,
};
