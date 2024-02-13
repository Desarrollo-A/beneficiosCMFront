import sumBy from 'lodash/sumBy';
import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { endpoints } from 'src/utils/axios';

import { usePostGeneral } from 'src/api/general';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import InvoiceAnalytic from './invoice-analytic';

// ----------------------------------------------------------------------

export default function BarraTareasTabla({
  filters,
  onFilters,
  //
  roleOptions,
  handleChangeReport,
  table,
  dataValue
}) {
  const popover = usePopover();

  const theme = useTheme();

  const diaActual = new Date().toISOString().split('T')[0];

  function formatFirstDayOfMonth() {
    const currentDate = new Date(); // Obtener la fecha actual
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // Establecer el día en 1

    const year = firstDayOfMonth.getFullYear();
    const month = (firstDayOfMonth.getMonth() + 1).toString().padStart(2, '0'); // Sumar 1 porque los meses se indexan desde 0
    const day = firstDayOfMonth.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  const diaUnoMes = formatFirstDayOfMonth();

  const [area, setArea] = useState([0]);

  const [fechaI, setFechaI] = useState(diaUnoMes);

  const [fechaF, setFechaF] = useState(diaActual);

  const [dt, setDt] = useState({
    esp: { area },
    fhI: fechaI,
    fhF: fechaF,
  });

  const [condi, setCondi] = useState(true);

  useEffect(() => {
    setDt({
      esp: area,
      fhI: fechaI,
      fhF: fechaF,
    });

    if (dt?.esp[0] === 0) {
      setCondi(true);
    } else if (dt.esp.length === 0) {
      setCondi(true);
    } else if (dt.esp.length > 0) {
      setCondi(false);
    }

  }, [area, fechaI, fechaF, dt.esp]);

  const { cPaciData } = usePostGeneral(dt, endpoints.reportes.getCierrePacientes, "cPaciData");

  const { cIngreData } = usePostGeneral(dt, endpoints.reportes.getCierreIngresos, "cIngreData");

  const { espData } = usePostGeneral(dt, endpoints.reportes.getSelectEspe, "espData");

  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterRole = useCallback(
    (event) => {
      onFilters(
        'area',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
      setArea(event.target.value);
    },
    [onFilters]
  );

  const report = [
    { value: 'general', label: 'Reporte General' },
    { value: 'faltas', label: 'Reporte de Faltas' },
    { value: 'justificadas', label: 'Reporte de Justificiones' },
  ];

  const [currentStatus, setCurrentStatus] = useState(report[0].value);

  const handleChangeStatus = useCallback((event) => {
    setCurrentStatus(event.target.value);
    handleChangeReport(event.target.value);
    table.onResetPage();
  }, [handleChangeReport, table]);

  const handleFilterStartDate = useCallback(
    (newValue) => {
      onFilters('startDate', newValue);

      const date = new Date(newValue);
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      setFechaI(formattedDate);
    },

    [onFilters]
  );

  const handleFilterEndDate = useCallback(
    (newValue) => {
      onFilters('endDate', newValue);

      const date = new Date(newValue);
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      setFechaF(formattedDate);
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

  const _pa = cPaciData.flatMap((i) => (i.TotalPacientes));

  const _in = cIngreData.flatMap((i) => (i.TotalIngreso));

  const _esp = espData.flatMap((i) => (i.nombre));

  console.log(dataValue)

  return (
    <>

      {dataValue === 'general' ? (
        <Stack
          direction="row"
          divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
          sx={{ py: 2 }}
        >
          <InvoiceAnalytic
            title="Total de pacientes"
            total={_pa}
            percent={100}
            price={sumBy(0, 'totalAmount')}
            icon="fa-solid:users"
            color={theme.palette.info.main}
          />

          <InvoiceAnalytic
            title="Total de ingresos"
            percent={100}
            price={_in}
            icon="dashicons:money-alt"
            color={theme.palette.success.main}
          />
        </Stack>

      ) : (
        null
      )}

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
          <InputLabel>Área</InputLabel>

          <Select
            multiple
            value={filters.area}
            onChange={handleFilterRole}
            input={<OutlinedInput label="Área" />}
            renderValue={(selected) => selected.map((value) => value).join(', ')}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {roleOptions.map((option, index) => (
              <MenuItem key={index} value={option}>
                <Checkbox disableRipple size="small" checked={filters.area.includes(option)} />
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
          <InputLabel>Especialistas</InputLabel>

          <Select
            multiple
            disabled={condi}
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
            {_esp.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox disableRipple size="small" checked={filters.especialista.includes(option)} />
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <DatePicker
          label="Fecha inicio"
          value={filters.startDate}
          onChange={handleFilterStartDate}
          slotProps={{
            textField: {
              fullWidth: true,
            },
          }}
          sx={{
            maxWidth: { md: 200 },
          }}
        />

        <DatePicker
          label="Fecha fin"
          value={filters.endDate}
          onChange={handleFilterEndDate}
          slotProps={{ textField: { fullWidth: true } }}
          sx={{
            maxWidth: { md: 200 },
          }}
        />

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

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:printer-minimalistic-bold" />
          Imprimir
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:import-bold" />
          Import
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:export-bold" />
          Export
        </MenuItem>
      </CustomPopover>
    </>
  );
}

BarraTareasTabla.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  roleOptions: PropTypes.array,
  handleChangeReport: PropTypes.func,
  table: PropTypes.any,
  dataValue: PropTypes.any,
};
