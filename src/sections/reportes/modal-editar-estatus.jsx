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
import { useGetGeneral } from 'src/api/general';

import { useSnackbar } from 'src/components/snackbar';
// ----------------------------------------------------------------------

export default function EditarEstatus({ open, onClose, id, est, estatusVal }) {

  const confirm = useBoolean();

  const { enqueueSnackbar } = useSnackbar();

  const [estatus, setEstatus] = useState('');

  const handleChange = (event) => {
    setEstatus(event.target.value);
  }

  const updateEstatus = useUpdate(endpoints.reportes.updateEstatusPaciente);

  const { estatusData } = useGetGeneral(endpoints.reportes.getEstatusPaciente, "estatusData");

  const handleEstatus = async (i) => {

      try {

        const data = {
          'idDetallePnt': id,
          'estatus': i,
          'area': est,
        };

        onClose();

        const update = await updateEstatus(data);

        if (update.estatus === true) {
          enqueueSnackbar(update.msj, { variant: 'success' });

          mutate(endpoints.encuestas.getEncNotificacion);
          mutate(endpoints.reportes.pacientes);

        } else {
          enqueueSnackbar(update.msj, { variant: 'error' });
        }

      } catch (error) {
        console.error("Error en handleEstatus:", error);
        enqueueSnackbar(`¡No se pudieron actualizar los datos de usuario!`, { variant: 'danger' });
      }

  }

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >

      <Stack spacing={1} >

        <DialogTitle>¿Estás seguro que deseas cambiar el estatus del paciente?</DialogTitle>

        <FormControl spacing={3} sx={{ p: 3 }}>
       
          <InputLabel spacing={3} sx={{ p: 3 }} id="demo-simple-select-label">Estatus</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            label="Estatus"
            value={estatus}
            onChange={(e) => handleChange(e)}
          >
            {estatusData.map((i) => (
              i.nombre === estatusVal ? null : (
                <MenuItem key={i.idOpcion} value={i.idOpcion}>
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

    </Dialog>

  );
}

EditarEstatus.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  id: PropTypes.number,
  est: PropTypes.number,
  estatusVal: PropTypes.string,
};
