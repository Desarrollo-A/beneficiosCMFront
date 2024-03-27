import { isEmpty } from 'lodash';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { useFieldArray, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import LinearProgress from '@mui/material/LinearProgress';

import { useGetAreas } from 'src/api/reportes';
import { useAuthContext } from 'src/auth/hooks';

import { RHFSelect, RHFAutocomplete } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function AddInsertSede({ idSede, especiaData, oficinaData, modalidadesData, handleEsp, handleMod, handleArea }) {

  const { user } = useAuthContext();

  const { control } = useFormContext();

  const [select, setSelect] = useState(0);

  const [, setMod] = useState('');

  const [bol, setBol] = useState(false);

  const { areas} = useGetAreas();

  useFieldArray({
    control,
    name: 'items',
  });

  const handleChangeOfi = (e) => {
    setSelect(e.target.value);

    if (e.target.value === 9) {
      setBol(false);
      handleMod({
        modalidad: 2,
        sede: idSede,
        usuario: user?.idUsuario,
        oficina: e.target.value,
      });
    } else {
      setBol(true);
    }
  }

  const handleChangeMod = (e) => {
    setMod(e.target.value);
    handleMod({
      modalidad: e.target.value,
      sede: idSede,
      usuario: user?.idUsuario,
      oficina: select,
    });
  }

  const handleChangeArea = (value) => {
    handleArea({idArea: value?.key?.idArea});
  }

  const handleKeyDown = async () => {
    handleArea({idArea: null});
  }

  const handleChangeEsp = (e) => {
    handleEsp({ especialista: e.target.value });
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
        <Stack alignItems="flex-end" spacing={1.5}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: 1 }}>
            <RHFSelect
              name="oficina"
              size="small"
              label="Oficina"
              defaultValue=""
              // InputLabelProps={{ shrink: false }}
              onChange={(e) => handleChangeOfi(e)}
            >
              <Divider sx={{ borderStyle: 'dashed' }} />

              {!isEmpty(oficinaData) ? (
              oficinaData.map((i) => (
                <MenuItem key={i.idOficina} value={i.idOficina}>
                  {i.lugar}
                </MenuItem>
              ))
              ) : (
                <Grid style={{ paddingTop: '3%' }}>
                  <LinearProgress />
                  <Box mb={3} />
                </Grid>
              )}
            </RHFSelect>

            <RHFSelect
              name="especialista"
              size="small"
              label="Especialista"
              defaultValue=""
              onChange={(e) => handleChangeEsp(e)}
            >
              <Divider sx={{ borderStyle: 'dashed' }} />

              {!isEmpty(especiaData) ? (
              especiaData.map((i) => (
                <MenuItem key={i.idUsuario} value={i.idUsuario}>
                  {i.nombre}
                </MenuItem>
              ))
              ) : (
                <Grid style={{ paddingTop: '3%' }}>
                  <LinearProgress />
                  <Box mb={3} />
                </Grid>
              )}
            </RHFSelect>

            <Stack spacing={3} sx={{ width: 900}}>
              <RHFAutocomplete
                name="area"
                label="Área"
                size="small"
                value=""
                onChange={(_event, value, reason) => {
                  handleChangeArea(value);
                }}
                onKeyDown={(e) => {
                  handleKeyDown();
                }}
                  options = { areas?.map((i) => ({
                  key: i,
                  value: i.idArea,
                  label: i.nombre,
                }))}
              />
            </Stack>
            {bol !== false ? (
              <RHFSelect
                name="modalidad"
                size="small"
                label="Modalidad"
                defaultValue=""
                onChange={(e) => handleChangeMod(e)}
              >
                <Divider sx={{ borderStyle: 'dashed' }} />

                {!isEmpty(modalidadesData) ? (
                modalidadesData.map((i) => (
                  <MenuItem key={i.idOpcion} value={i.idOpcion}>
                    {i.modalidad}
                  </MenuItem>
                ))
                ) : (
                  <Grid style={{ paddingTop: '3%' }}>
                    <LinearProgress />
                    <Box mb={3} />
                  </Grid>
                )}
              </RHFSelect>
            ) : null}
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}

AddInsertSede.propTypes = {
  idSede: PropTypes.any,
  oficinaData: PropTypes.any,
  especiaData: PropTypes.any,
  modalidadesData: PropTypes.any,
  handleEsp: PropTypes.any,
  handleMod: PropTypes.any,
  handleArea: PropTypes.any
};
