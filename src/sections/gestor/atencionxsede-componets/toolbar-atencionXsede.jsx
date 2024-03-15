import PropTypes from 'prop-types';
import { useCallback } from 'react';

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
// import { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function ToolbarAtencionXsede({
  filters,
  onFilters,
  //
  roleOptions,
  OptionsOff,
  OptionsPue,
  OptionsMod,
  rol,
  _puEs
}) {
  // const popover = usePopover();

  const handleFilterName = useCallback(
    (event) => {
      onFilters('nombre', event.target.value);
    },
    [onFilters]
  );

  const handleFilterSede = useCallback(
    (event) => {
      onFilters(
        'sede',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [onFilters]
  );

  const handleFilterOficina = useCallback(
    (event) => {
      onFilters(
        'oficina',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [onFilters]
  );

  const handleFilterPuesto = useCallback(
    (event) => {
      onFilters(
        'puesto',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [onFilters]
  );

  const handleFilterModalidad = useCallback(
    (event) => {
      onFilters(
        'modalidad',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
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
            flexShrink: 0,
            width: { xs: 1, md: 200 },
          }}
        >
          <InputLabel>Sede</InputLabel>

          <Select
            multiple
            value={filters.sede}
            onChange={handleFilterSede}
            input={<OutlinedInput label="Sede" />}
            renderValue={(selected) => selected.map((value) => value).join(', ')}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {roleOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox disableRipple size="small" checked={filters.sede.includes(option)} />
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>


        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 200 },
          }}
        >
          <InputLabel>Oficina</InputLabel>

          <Select
            multiple
            value={filters.oficina}
            onChange={handleFilterOficina}
            input={<OutlinedInput label="Oficina" />}
            renderValue={(selected) => selected.map((value) => value).join(', ')}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {OptionsOff.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox disableRipple size="small" checked={filters.oficina.includes(option)} />
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {rol === "4" || rol === 4 ? (

        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 200 },
          }}
        >
          <InputLabel>Beneficio</InputLabel>

          <Select
            multiple
            value={filters.puesto}
            onChange={handleFilterPuesto}
            input={<OutlinedInput label="Beneficio" />}
            renderValue={(selected) => selected.map((value) => value).join(', ')}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {OptionsPue.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox disableRipple size="small" checked={filters.puesto.includes(option)} />
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        ) : (
          <>
          </>
        )}

        {rol === "3" || rol === 3 || rol === "1" || rol === 1? (

        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 200 },
          }}
          disabled
        >
          <InputLabel>Beneficio</InputLabel>

          <Select
            multiple
            value={[_puEs]}
            onChange={handleFilterPuesto}
            input={<OutlinedInput label="Beneficio" />}
            renderValue={(selected) => selected.map((value) => value).join(', ')}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
              <MenuItem value={_puEs}>
                <Checkbox disableRipple size="small" checked={_puEs} />
                {_puEs}
              </MenuItem>
          </Select>
        </FormControl>

        ) : (
          <>
          </>
        )}

        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 200 },
          }}
        >
          <InputLabel>Modalidad</InputLabel>

          <Select
            multiple
            value={filters.modalidad}
            onChange={handleFilterModalidad}
            input={<OutlinedInput label="Modalidad" />}
            renderValue={(selected) => selected.map((value) => value).join(', ')}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {OptionsMod.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox disableRipple size="small" checked={filters.modalidad.includes(option)} />
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.nombre}
            onChange={handleFilterName}
            placeholder="Especialista..."
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

ToolbarAtencionXsede.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  roleOptions: PropTypes.array,
  OptionsOff: PropTypes.array,
  OptionsPue: PropTypes.array,
  OptionsMod: PropTypes.array,
  rol: PropTypes.any,
  _puEs: PropTypes.any,
};
