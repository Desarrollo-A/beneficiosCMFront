import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';

import { Stack, Select, MenuItem, TextField, InputLabel, FormControl, InputAdornment } from '@mui/material';

import Iconify from 'src/components/iconify';

export default function ToolbarAsistenciaEv({
  filters,
  onFilters,
  handleChangeTitulo, 
  titulos, 
  table
}) {
  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const [selectedTitulo, setSelectedTitulo] = useState('all'); 

  const handleChange = useCallback(
    (event) => {
      const {value} = event.target;
      setSelectedTitulo(value); 
      handleChangeTitulo(value);
      table.onResetPage();
    },
    [handleChangeTitulo, table]
  );
  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      direction={{ xs: 'column', md: 'row' }}
      sx={{ p: 2.5, pr: { xs: 2.5, md: 1 } }}
    >
      <FormControl sx={{ flexShrink: 0, width: { xs: 2, md: 400 } }}>
        <InputLabel id="titulo-select-label">Eventos</InputLabel>
        <Select
          labelId="titulo-select-label"
          id="titulo-select"
          value={selectedTitulo} 
          label="Eventos"
          onChange={handleChange}
        >
          <MenuItem value="all">Todos</MenuItem>
          {titulos.map((eventTitulo) => ( 
            <MenuItem key={eventTitulo} value={eventTitulo}>
              {eventTitulo}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
        <TextField
          fullWidth
          value={filters.name}
          onChange={handleFilterName}
          placeholder="Busca lo que desees..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="line-md:search" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>
    </Stack>
  );
}

ToolbarAsistenciaEv.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  handleChangeTitulo: PropTypes.func, 
  titulos: PropTypes.array, 
  table: PropTypes.any
};