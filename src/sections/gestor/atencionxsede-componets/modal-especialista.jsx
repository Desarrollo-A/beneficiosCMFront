import { mutate } from 'swr';
import { useState } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';

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

  let val = true;

  if(espeData.length === 1  && espeData[0]?.nombre === estatusVal){
    val = false;
  }else if(espeData.length !== 1  && espeData[0]?.nombre !== estatusVal){
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

        } else {
          enqueueSnackbar(update.msj, { variant: 'error' });
        }

      } else {
        enqueueSnackbar(`¡No se selecciono alguna opción!`, { variant: 'danger' });
      }

    } catch (error) {
      console.error("Error en handleEstatus:", error);
      enqueueSnackbar(`¡No se pudieron actualizar los datos de usuario!`, { variant: 'danger' });
    }

  }

  return (

    <>

      { val === true ? (

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
            <Button variant="contained" color="success" onClick={() => {
              handleEstatus(estatus);
              confirm.onFalse();
            }}>
              Guardar
            </Button>
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

  );
}

ModalEspecialista.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  id: PropTypes.number,
  estatusVal: PropTypes.string,
  puesto: PropTypes.any,
};
