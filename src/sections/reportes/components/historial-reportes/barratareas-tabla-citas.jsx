import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { es } from 'date-fns/locale';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Unstable_Grid2';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
/* import InputAdornment from '@mui/material/InputAdornment'; */
import LinearProgress from '@mui/material/LinearProgress';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { endpoints } from 'src/utils/axios';

import { useAuthContext } from 'src/auth/hooks';
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
  handleChangeTypeUsers,
  table,
  rol,
  _eu,
  idUsuario,
  modOptions
}) {
  const popover = usePopover();

  const { user } = useAuthContext();

  const ultimoDiaMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

  function formatFirstDayOfMonth() {
    const currentDate = new Date(); // Obtener la fecha actual
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // Establecer el día en 1

    const year = firstDayOfMonth.getFullYear();
    const month = (firstDayOfMonth.getMonth() + 1).toString().padStart(2, '0'); // Sumar 1 porque los meses se indexan desde 0
    const day = firstDayOfMonth.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  const diaUnoMes = formatFirstDayOfMonth();

  const [area, setArea] = useState([rol === 4 ? filters.area : _eu]);

  const [fechaI, setFechaI] = useState(diaUnoMes);

  const [fechaF, setFechaF] = useState(ultimoDiaMes);

  const [selectEsp, setSelectEsp] = useState(rol === 3 ? [user?.nombre] : []);

  const [mod, setMod] = useState([filters.modalidad]);

  const report = [
    { value: 0, label: 'Reporte general' },
    { value: 1, label: 'Reporte por asistir' },
    { value: 2, label: 'Reporte canceladas' },
    { value: 3, label: 'Reporte penalizaciones' },
    { value: 4, label: 'Reporte finalizados' },
    { value: 5, label: 'Reporte justificiones' },
  ];

  const typeUsers = [
    { value: 2, label: 'Todos' },
    { value: 0, label: 'Colaborador' },
    { value: 1, label: 'Externo' },
  ];

  const [currentStatus, setCurrentStatus] = useState(report[0].value);

  const [currenTypeUsers, setCurrenTypeUsers] = useState(typeUsers[0].value);

  const [dt, setDt] = useState({
    esp: rol === 4 ? area : _eu,
    fhI: fechaI,
    fhF: fechaF,
    roles: rol,
    idUsr: idUsuario,
    idEsp: selectEsp,
    modalidad: mod,
    reporte: currentStatus,
    tipo: currenTypeUsers
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
        reporte: currentStatus,
        tipo: currenTypeUsers
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
    currentStatus,
    currenTypeUsers
  ]);

  const [condi, setCondi] = useState(true);

  const fhI = new Date(fechaI);

  const fhF = new Date(fechaF);

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

  /* const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  ); */

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

  const handleTypeUsers = useCallback((event) => {
    setCurrenTypeUsers(event.target.value);
    handleChangeTypeUsers(event.target.value);
    table.onResetPage();
  }, [handleChangeTypeUsers, table]);

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
              total={_pa}
              length={_pa.length}
              icon={<BookingIllustration />}
            />
          </Grid>

          <Grid xs={12} md={6}>
            <WidgetIngresos
              title="Total de ingresos"
              total={currenTypeUsers === 0 || currenTypeUsers === 2 ? _in : [0]}
              length={_in.length}
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

        <FormControl sx={{
          width: "100%",
          pr: { xs: 1, md: 1 },
        }}>
          <TextField
            fullWidth
            select
            label="Tipo de usuario"
            value={currenTypeUsers}
            onChange={handleTypeUsers}
          >

            {typeUsers.map((option, index) => (
              <MenuItem
                key={index}
                value={option.value}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </FormControl>

        <FormControl sx={{
          width: "100%",
          pr: { xs: 1, md: 1 },
        }}>
          <TextField
            fullWidth
            select
            label="Tipo de reporte"
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

        {rol === 4 ? (

          <>
            <FormControl sx={{
              width: "100%",
              pr: { xs: 1, md: 1 },
            }}>
              <InputLabel>Beneficio</InputLabel>

              <Select
                multiple
                value={filters.area}
                onChange={handleFilterRole}
                input={<OutlinedInput label="Beneficio" />}
                renderValue={(selected) => selected.map((value) => value).join(', ')}
                MenuProps={{
                  PaperProps: {
                    sx: { maxHeight: 240 },
                  },
                }}
              >
                {!isEmpty(roleOptions) ? (
                  roleOptions.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      <Checkbox disableRipple size="small" checked={filters.area.includes(option)} />
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

            <FormControl sx={{
              width: "100%",
              pr: { xs: 1, md: 1 },
            }}>
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
                {!isEmpty(espData) ? (
                  espData.map((option) => (
                    <MenuItem key={option} value={option.nombre}>
                      <Checkbox disableRipple size="small" checked={filters.especialista.includes(option.nombre)} />
                      {option.nombre}
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

          </>

        ) : (
          null
        )}

         <FormControl sx={{
            width: "100%",
            pr: { xs: 1, md: 1 },
          }}>
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
            {!isEmpty(modOptions) ? (
              modOptions.map((option, index) => (
                <MenuItem key={index} value={option}>
                  <Checkbox disableRipple size="small" checked={filters.modalidad.includes(option)} />
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

        {rol === 3 ? (
          <>
            <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Fecha inicio"
                maxDate={fhF.setDate(fhF.getDate() + 1)}
                value={filters.startDate}
                onChange={handleFilterStartDate}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>

            <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Fecha fin"
                minDate={fhI.setDate(fhI.getDate() + 1)}
                value={filters.endDate}
                onChange={handleFilterEndDate}
                slotProps={{ textField: { fullWidth: true } }}
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
                maxDate={fhF.setDate(fhF.getDate() + 1)}
                value={filters.startDate}
                onChange={handleFilterStartDate}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>

            <LocalizationProvider adapterLocale={es} dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Fecha fin"
                minDate={fhI.setDate(fhI.getDate() + 1)}
                value={filters.endDate}
                onChange={handleFilterEndDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </>
        ) : (
          null
        )}

        {/* <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
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

        </Stack> */}
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
  handleChangeTypeUsers: PropTypes.func,
  table: PropTypes.any,
  rol: PropTypes.any,
  _eu: PropTypes.any,
  idUsuario: PropTypes.any,
  modOptions: PropTypes.any
};
