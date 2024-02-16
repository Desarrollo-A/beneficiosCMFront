import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function UserTableToolbar({
  filters,
  onFilters,
  //
  handleChangeId,
  rol,
  OptionsEsp,
  handleChangeReport,
  table,
}) {

  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterEspe = useCallback(
    (event) => {
      onFilters(
        'especialista',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [onFilters]
  );

  const report = [
    { value: 'general', label: 'Reporte General' },
    { value: 'penalizacion', label: 'Reporte de penalización' },
  ];

  const [currentStatus, setCurrentStatus] = useState(report[0].value);

  const handleChangeStatus = useCallback((event) => {
    setCurrentStatus(event.target.value);
    handleChangeReport(event.target.value);
    table.onResetPage();
  }, [handleChangeReport, table]); 

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
          flexShrink: 0,
          width: { xs: 1, md: 200 },
        }}
      >
        <TextField
          fullWidth
          select
          label="Tipo de Reporte"
          value={currentStatus}
          onChange={handleChangeStatus}
        >

          {report.map((option, index) => (
            <MenuItem
              key={index}
              value={option.value}
            >
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </FormControl>

      <FormControl
        sx={{
          flexShrink: 0,
          width: { xs: 1, md: 200 },
        }}
      >
        <InputLabel>Especialistas</InputLabel>

        <Select
          multiple
          value={filters.especialista}
          onChange={handleFilterEspe}
          input={<OutlinedInput label="Especialistas" />}
          renderValue={(selected) => selected.map((value) => value).join(', ')}
          MenuProps={{
            PaperProps: {
              sx: { maxHeight: 240 },
            },
          }}
        >
          {OptionsEsp.map((option) => (
            <MenuItem key={option} value={option}>
              <Checkbox disableRipple size="small" checked={filters.especialista.includes(option)} />
              {option}
            </MenuItem>
          ))}
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

UserTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  handleChangeId: PropTypes.func,
  rol: PropTypes.any,
  OptionsEsp: PropTypes.any,
  handleChangeReport: PropTypes.any,
  table: PropTypes.any,
};
