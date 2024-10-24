import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { es } from 'date-fns/locale';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Unstable_Grid2';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { endpoints } from 'src/utils/axios';

import { usePostGeneral } from 'src/api/general';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function EncuestasTableToolbar({
  filters,
  onFilters,
  encOptions,
  beneOptions,
  sedeOptions,
  deptoOptions,
  areasOptions
}) {

  const [tipoEnc, setTipoEnc] = useState(filters.tipoEncuesta[0]);

  const { pgData } = usePostGeneral(tipoEnc, endpoints.reportes.getPreguntas, "pgData");

  const pgOptions = pgData.flatMap((i) => (i.pregunta));

  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterTypeEnc = useCallback(
    (event) => {
      onFilters(
        'tipoEncuesta',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
      setTipoEnc(event.target.value);
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

  const handleFilterDepto = useCallback(
    (event) => {
      onFilters(
        'depto',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [onFilters]
  );

  const handleFilterBeneficio = useCallback(
    (event) => {
      onFilters(
        'beneficio',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [onFilters]
  );

  const handleFilterArea = useCallback(
    (event) => {
      onFilters(
        'area',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [onFilters]
  );

  const handleFilterPregunta = useCallback(
    (event) => {
      onFilters(
        'pregunta',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [onFilters]
  );

  const handleFilterStartDate = useCallback(
    (event) => {
      onFilters(
        'fhInicial',
        event
      );

    },
    [onFilters]
  );

  const handleFilterEndDate = useCallback(
    (event) => {
      onFilters(
        'fhFinal',
        event
      );

    },
    [onFilters]
  );

  return (
    <>
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
            width: '100%',
            pr: { xs: 1, md: 1 },
          }}
        >
          <InputLabel>Tipo de encuesta</InputLabel>

          <Select
            multiple={false}
            value={filters.tipoEncuesta}
            onChange={handleFilterTypeEnc}
            input={<OutlinedInput label="Tipo de encuesta" />}
            renderValue={(selected) => selected.map((value) => value).join(', ')}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {!isEmpty(encOptions) ? (
              encOptions.map((option, index) => (
                <MenuItem key={index} value={option}>
                  <Checkbox
                    disableRipple
                    size="small"
                    checked={filters.tipoEncuesta.includes(option)}
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

        <FormControl
          sx={{
            width: '100%',
            pr: { xs: 1, md: 1 },
          }}
        >
          <InputLabel>Sede</InputLabel>

          <Select
            multiple={false}
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
            {!isEmpty(sedeOptions) ? (
              sedeOptions.map((option, index) => (
                <MenuItem key={index} value={option}>
                  <Checkbox
                    disableRipple
                    size="small"
                    checked={filters.sede.includes(option)}
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

        <FormControl
          sx={{
            width: '100%',
            pr: { xs: 1, md: 1 },
          }}
        >
          <InputLabel>Departamento</InputLabel>

          <Select
            multiple={false}
            value={filters.depto}
            onChange={handleFilterDepto}
            input={<OutlinedInput label="Departamento" />}
            renderValue={(selected) => selected.map((value) => value).join(', ')}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {!isEmpty(deptoOptions) ? (
              deptoOptions.map((option, index) => (
                <MenuItem key={index} value={option}>
                  <Checkbox
                    disableRipple
                    size="small"
                    checked={filters.depto.includes(option)}
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

        <FormControl
          sx={{
            width: '100%',
            pr: { xs: 1, md: 1 },
          }}
        >
          <InputLabel>Área</InputLabel>

          <Select
            multiple={false}
            value={filters.area}
            onChange={handleFilterArea}
            input={<OutlinedInput label="Área" />}
            renderValue={(selected) => selected.map((value) => value).join(', ')}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {!isEmpty(areasOptions) ? (
              areasOptions.map((option, index) => (
                <MenuItem key={index} value={option}>
                  <Checkbox
                    disableRipple
                    size="small"
                    checked={filters.area.includes(option)}
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

        <FormControl
          sx={{
            width: '100%',
            pr: { xs: 1, md: 1 },
          }}
        >
          <InputLabel>Beneficio</InputLabel>

          <Select
            multiple={false}
            value={filters.beneficio}
            onChange={handleFilterBeneficio}
            input={<OutlinedInput label="Beneficio" />}
            renderValue={(selected) => selected.map((value) => value).join(', ')}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {!isEmpty(encOptions) ? (
              beneOptions.map((option, index) => (
                <MenuItem key={index} value={option}>
                  <Checkbox
                    disableRipple
                    size="small"
                    checked={filters.beneficio.includes(option)}
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

        <FormControl
          sx={{
            width: '100%',
            pr: { xs: 1, md: 1 },
          }}
        >
          <InputLabel>Pregunta</InputLabel>

          <Select
            multiple={false}
            value={filters.pregunta}
            onChange={handleFilterPregunta}
            input={<OutlinedInput label="Pregunta" />}
            renderValue={(selected) => selected.map((value) => value).join(', ')}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {!isEmpty(pgOptions) ? (
              pgOptions.map((option, index) => (
                <MenuItem key={index} value={option}>
                  <Checkbox
                    disableRipple
                    size="small"
                    checked={filters.pregunta.includes(option)}
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

        <FormControl
          sx={{
            width: '100%',
            pr: { xs: 1, md: 1 },
          }}
        >
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

        </FormControl>

      </Stack>

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
            width: '100%',
            pr: { xs: 1, md: 1 },
          }}
        >
          <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Fecha inicio"
              value={filters.fhInicial}
              onChange={handleFilterStartDate}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        </FormControl>

        <FormControl
          sx={{
            width: '100%',
            pr: { xs: 1, md: 1 },
          }}
        >
          <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Fecha final"
              value={filters.fhFinal}
              onChange={handleFilterEndDate}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        </FormControl>
      </Stack>
    </>
  );
}

EncuestasTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  encOptions: PropTypes.any,
  beneOptions: PropTypes.any,
  sedeOptions: PropTypes.array,
  deptoOptions: PropTypes.array,
  areasOptions: PropTypes.array,
};
