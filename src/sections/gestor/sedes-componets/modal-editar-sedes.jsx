import { mutate } from 'swr';
import { useState } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { useUpdate } from 'src/api/reportes';
import { useAuthContext } from 'src/auth/hooks';
// import { useGetGeneral } from 'src/api/general';

import { useSnackbar } from 'src/components/snackbar';
// ----------------------------------------------------------------------

export default function ModalEditarSedes({ open, onClose, idSede, sede, abreviacion, estatus }) {

  const confirm = useBoolean();

  const { user } = useAuthContext();

  const updateEstatus = useUpdate(endpoints.gestor.updateSede);

  // const { sedesData } = useGetGeneral(endpoints.gestor.getSedes, "sedesData");

  const { enqueueSnackbar } = useSnackbar();

  const [est, setEst] = useState(estatus);

  const [sed, setSed] = useState(sede);

  const [abre, setAbre] = useState(abreviacion);

  const handleChange = (event) => {
    setEst(event.target.value);
  }

  const handleSed = (event) => {
    setSed(event.target.value);
  }

  const handleAbre = (event) => {
    setAbre(event.target.value);
  }

  const handleEstatus = async (data) => {

    try {

      onClose();

      const update = await updateEstatus(data);

      if (update.estatus === true) {
        enqueueSnackbar(update.msj, { variant: 'success' });

        mutate(endpoints.gestor.getSedes);

      } else {
        enqueueSnackbar(update.msj, { variant: 'error' });
      }

    } catch (error) {
      console.error("Error en handleEstatus:", error);
      enqueueSnackbar(`¡No se pudieron actualizar los datos!`, { variant: 'danger' });
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

        <DialogTitle>Edición de sede</DialogTitle>

        <FormControl spacing={3} sx={{ p: 3 }}>

          <TextField
            id="outlined-basic"
            label="sede"
            variant="outlined"
            value={sed}
            onChange={(e) => handleSed(e)}
            sx={{ mb: 3 }}
          />

          <TextField
            id="outlined-basic"
            label="abreviacion"
            variant="outlined"
            value={abre}
            onChange={(e) => handleAbre(e)}
            sx={{ mb: 3 }}
          />

          <FormControl >
            <InputLabel spacing={3} sx={{ p: 0 }} id="demo-simple-select-label">Estatus</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Estatus"
              value={est}
              onChange={(e) => handleChange(e)}
              sx={{ mb: 3 }}
            >
              <MenuItem value={1}>
                Activa
              </MenuItem>
              <MenuItem value={0}>
                Inactiva
              </MenuItem>
            </Select>
          </FormControl>

        </FormControl>

      </Stack>

      <DialogActions>
        <Button variant="contained" color="error" onClick={onClose}>
          Cerrar
        </Button>
        <Button variant="contained" color="success" onClick={() => {
          handleEstatus(
            {
              'idSed': idSede,
              'sede': sed,
              'abreviacion': abre,
              'estatus': est,
              'modificadoPor': user.idUsuario,
            });
          confirm.onFalse();
        }}>
          Guardar
        </Button>
      </DialogActions>

    </Dialog>

  );
}

ModalEditarSedes.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  idSede: PropTypes.number,
  sede: PropTypes.any,
  abreviacion: PropTypes.any,
  estatus: PropTypes.any,
};
