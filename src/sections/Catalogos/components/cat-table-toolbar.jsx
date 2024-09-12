import PropTypes from 'prop-types';
import {useState, useCallback} from 'react';

import {Stack, Select,MenuItem, TextField,InputLabel,FormControl, InputAdornment } from '@mui/material';

import Iconify from 'src/components/iconify';


export default function ToolbarCatalogos({
    filters,
    onFilters,
    handleChangeEstatus,
    table
  }) {
    const handleFilterName = useCallback(
      (event) => {
        onFilters('name', event.target.value);
      },
      [onFilters]
    );
  
    const [estatus, setEstatus] = useState('all');
  
    const handleChange = useCallback(
      (event) => {
        setEstatus(event.target.value);
        handleChangeEstatus(event.target.value);
        table.onResetPage();
      },
      [handleChangeEstatus, table]
    );

    return (
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{ xs: 'column', md: 'row' }}
        sx={{ p: 2.5, pr: { xs: 2.5, md: 1 } }}
      >
        <FormControl sx={{ flexShrink: 2, width: { xs: 2, md: 300 } }}>
          <InputLabel id="estatus-select-label">Estatus</InputLabel>
          <Select
            labelId="estatus-select-label"
            id="estatus-select"
            value={estatus}
            label="Estatus"
            onChange={handleChange}
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="Activo">Activo</MenuItem>
            <MenuItem value="Inactivo">Inactivo</MenuItem>
          </Select>
        </FormControl>
  
        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.name}
            onChange={handleFilterName}
            placeholder="Busca el nombre de tu catálogo..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="line-md:search-twotone" sx={{ color: 'text.disabled' }} />

                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Stack>
    );
  }
  
ToolbarCatalogos.propTypes = {
    filters: PropTypes.object,
    onFilters: PropTypes.func,
    handleChangeEstatus: PropTypes.func,
    table: PropTypes.any
  };
