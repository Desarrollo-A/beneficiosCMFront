import PropTypes from 'prop-types';
import { es } from 'date-fns/locale';
import { useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Unstable_Grid2';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { endpoints } from 'src/utils/axios';

import { usePostSelect, usePostIngresos, usePostPacientes } from 'src/api/reportes';
import {
  BookingIllustration,
  CheckInIllustration,
} from 'src/assets/illustrations';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import WidgetIngresos from './widget-ingresos';
import WidgetPacientes from './widget-pacientes';

// ----------------------------------------------------------------------

export default function BarraTareasTabla({
  filters,
  onFilters,
  //
  roleOptions,
  handleChangeReport,
  table,
  dataValue,
  rol,
  _eu,
  idUsuario,
  modOptions
}) {
  const popover = usePopover();

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

  const [area, setArea] = useState([filters.area]);

  const [fechaI, setFechaI] = useState(diaUnoMes);

  const [fechaF, setFechaF] = useState(diaActual);

  const [selectEsp, setSelectEsp] = useState([]);

  const [mod, setMod] = useState([filters.modalidad]);

  const report = [
    { value: 0, label: 'Reporte general' },
    { value: 1, label: 'Reporte por asistir' },
    { value: 2, label: 'Reporte canceladas' },
    { value: 3, label: 'Reporte penalizaciones' },
    { value: 4, label: 'Reporte finalizados' },
    { value: 5, label: 'Reporte justificiones' },
    
  ];

  const [currentStatus, setCurrentStatus] = useState(report[0].value);

  const [dt, setDt] = useState({
    esp: rol === 4 ? area : _eu,
    fhI: fechaI,
    fhF: fechaF,
    roles: rol,
    idUsr: idUsuario,
    idEsp: selectEsp,
    modalidad: mod,
    reporte: currentStatus
  });

  useEffect(() => {
    if (area) {
      setDt({
        esp: rol === 4 ? area : _eu,
        fhI: fechaI,
        fhF: fechaF,
        roles: rol,
        idUsr: idUsuario,
        idEsp: selectEsp,
        modalidad: mod,
        reporte: currentStatus
      });
    }
  }, [
    area,
    rol,
    fechaI,
    fechaF,
    _eu,
    idUsuario,
    selectEsp,
    mod,
    currentStatus
  ]);

  const [condi, setCondi] = useState(true);

  useEffect(() => {

    if (rol !== 1) {
      if (area[0]?.length === 0) {
        setCondi(true);
      } else if (area.length === 0) {
        setCondi(true);
      } else if (area.length > 0) {
        setCondi(false);
      }
    } else {
      setCondi(false);
    }

  }, [area, fechaI, fechaF, dt, rol]);

  const { cPaciData } = usePostPacientes(dt, endpoints.reportes.getCierrePacientes, "cPaciData");

  const { cIngreData } = usePostIngresos(dt, endpoints.reportes.getCierreIngresos, "cIngreData");

  const { espData } = usePostSelect(dt, endpoints.reportes.getSelectEspe, "espData");

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
      setSelectEsp(event.target.value);
    },
    [onFilters]
  );

  const handleFilterModalidad = useCallback(
    (event) => {
      onFilters(
        'modalidad',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
      setMod(event.target.value);
    },
    [onFilters]
  );

  const _pa = cPaciData.flatMap((i) => (i.TotalPacientes));

  const _in = cIngreData.flatMap((i) => (i.TotalIngreso));

  const _esp = espData.flatMap((i) => (i.nombre));

  const SPACING = 3;

  return (
    <>

      <Stack
        spacing={2}
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 2.5 },
        }}
      >
        <Grid container spacing={SPACING} disableEqualOverflow>

          <Grid xs={12} md={6}>
            <WidgetPacientes
              title="Total de pacientes"
              total={dataValue === 0 || dataValue === 4 ? _pa : 0}
              icon={<BookingIllustration />}
            />
          </Grid>

          <Grid xs={12} md={6}>
            <WidgetIngresos
              title="Total de ingresos"
              total={_in}
              icon={<CheckInIllustration />}
            />
          </Grid>
        </Grid>

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

        {rol === "4" || rol === 4 ? (

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

        ) : (
          null
        )}

        {rol !== 3 ? (

          <FormControl
            sx={{
              flexShrink: 0,
              width: { xs: 1, md: 400 },
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

        ) : (
          null
        )}

        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 275 },
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
            {modOptions.map((option, index) => (
              <MenuItem key={index} value={option}>
                <Checkbox disableRipple size="small" checked={filters.modalidad.includes(option)} />
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {rol === 3 ? (
          <>
            <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
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
                  maxWidth: { md: 300 },
                }}
              />
            </LocalizationProvider>

            <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Fecha fin"
                value={filters.endDate}
                onChange={handleFilterEndDate}
                slotProps={{ textField: { fullWidth: true } }}
                sx={{
                  maxWidth: { md: 300 },
                }}
              />
            </LocalizationProvider>
          </>
        ) : (
          null
        )}

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
        {rol === 4 ? (
          <>
            <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
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
            </LocalizationProvider>

            <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Fecha fin"
                value={filters.endDate}
                onChange={handleFilterEndDate}
                slotProps={{ textField: { fullWidth: true } }}
                sx={{
                  maxWidth: { md: 200 },
                }}
              />
            </LocalizationProvider>
          </>
        ) : (
          null
        )}

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
  filters: PropTypes.any,
  onFilters: PropTypes.func,
  roleOptions: PropTypes.array,
  handleChangeReport: PropTypes.func,
  table: PropTypes.any,
  dataValue: PropTypes.any,
  rol: PropTypes.any,
  _eu: PropTypes.any,
  idUsuario: PropTypes.any,
  modOptions: PropTypes.any
};
