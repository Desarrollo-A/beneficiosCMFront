// import { mutate } from 'swr';
import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
// import Select from '@mui/material/Select';
// import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
// import InputLabel from '@mui/material/InputLabel';
// import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
// import Button from '@mui/material/Button';

import { endpoints } from 'src/utils/axios';

import { useGetGeneral } from 'src/api/general';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function ToolbarOficinas({
  filters,
  onFilters,
  //
  handleChangeId,
  rol
}) {

  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const { especialistasData } = useGetGeneral(endpoints.reportes.especialistas, "especialistasData");

  const [, setEspecialistas] = useState([]); // especialistas

  useEffect(() => {
    if (especialistasData.length) {
      setEspecialistas(especialistasData);
    }
  }, [especialistasData]);

  // const [, setArea] = useState(158); // area

  // const handleChange = useCallback(
  //   (event) => {
  //     setArea(event.target.value);
  //     handleChangeId(event.target.value);
  //     mutate(endpoints.reportes.pacientes);
  //   },
  //   [handleChangeId]
  // );

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

ToolbarOficinas.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  handleChangeId: PropTypes.func,
  rol: PropTypes.any,
};
