import { mutate } from 'swr';
import { useState } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { useUpdate } from 'src/api/reportes';
import { usePostGeneral } from 'src/api/general';

import { useSnackbar } from 'src/components/snackbar';
// ----------------------------------------------------------------------

export default function ModalEspecialista({ open, onClose, id, estatusVal, puesto }) {

  const confirm = useBoolean();

  const { espeData } = usePostGeneral(puesto, endpoints.gestor.getEsp, "espeData");

  const { enqueueSnackbar } = useSnackbar();

  const [estatus, setEstatus] = useState('');

  const [btnLoad, setBtnLoad] = useState(false);

  let val = true;

  if (espeData.length === 1 && espeData[0]?.nombre === estatusVal) {
    val = false;
  } else if (espeData.length !== 1 && espeData[0]?.nombre !== estatusVal) {
    val = true;
  }

  const handleChange = (event) => {
    setEstatus(event.target.value);
  }

  const updateEstatus = useUpdate(endpoints.gestor.updateEspecialista);

  const handleEstatus = async (i) => {

    try {

      const data = {
        'idDetallePnt': id,
        'espe': i,
      };

      if (data?.espe !== '') {

        onClose();

        const update = await updateEstatus(data);

        if (update.estatus === true) {
          enqueueSnackbar(update.msj, { variant: 'success' });

          mutate(endpoints.gestor.getAtencionXsede);
          mutate(endpoints.gestor.getAtencionXsedeEsp);

          setBtnLoad(false);

        } else {
          enqueueSnackbar(update.msj, { variant: 'error' });

          setBtnLoad(false);
        }

      } else {
        enqueueSnackbar(`No seleccionaste alguna opción`, { variant: 'danger' });

        setBtnLoad(false);
      }

    } catch (error) {
      console.error("Error en handleEstatus:", error);
      enqueueSnackbar(`Error en actualizar los datos`, { variant: 'danger' });

      setBtnLoad(false);
    }

  }

  return (
    <>
      {espeData.length > 0 ? (

        <>
          {val === true ? (

            <>
              <Stack spacing={1} >

                <DialogTitle>¿Estás seguro que deseas cambiar al especialista?</DialogTitle>

                <FormControl spacing={3} sx={{ p: 3 }}>

                  <InputLabel spacing={3} sx={{ p: 3 }} id="demo-simple-select-label">Especialista</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="Especialista"
                    value={estatus}
                    onChange={(e) => handleChange(e)}
                  >
                    {espeData.map((i) => (
                      i.nombre === estatusVal ? null : (
                        <MenuItem key={i.idUsuario} value={i.idUsuario}>
                          {i.nombre}
                        </MenuItem>
                      )
                    ))}
                  </Select>

                </FormControl>

              </Stack>

              <DialogActions>
                <Button variant="contained" color="error" onClick={onClose}>
                  Cerrar
                </Button>
                <LoadingButton variant="contained" color="success" loading={btnLoad} onClick={() => {
                  setBtnLoad(true);
                  handleEstatus(estatus);
                  confirm.onFalse();
                }}>
                  Guardar
                </LoadingButton>
              </DialogActions>
            </>
          ) : (
            <>
              <DialogTitle>No hay más especialistas para cambiar</DialogTitle>
              <DialogActions>
                <Button variant="contained" color="error" onClick={onClose}>
                  Cerrar
                </Button>
              </DialogActions>
            </>
          )}
        </>

      ) : (
        <Stack spacing={1} >
          <Grid container sx={{ p: 5 }} justifyContent="center" alignItems="center">
            <CircularProgress />
          </Grid>
        </Stack>
      )}

    </>

  );
}

ModalEspecialista.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  id: PropTypes.any,
  estatusVal: PropTypes.string,
  puesto: PropTypes.any,
};
