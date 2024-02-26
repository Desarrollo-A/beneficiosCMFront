import { mutate } from 'swr';
import { useState } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
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

import { useInsert } from 'src/api/encuestas';
import { useAuthContext } from 'src/auth/hooks';

import { useSnackbar } from 'src/components/snackbar';
// ----------------------------------------------------------------------

export default function ModalAgregarSedes({ open, onClose }) {

  const confirm = useBoolean();

  const { user } = useAuthContext();

  const insertData = useInsert(endpoints.gestor.insertSedes);

  const { enqueueSnackbar } = useSnackbar();

  const [est, setEst] = useState(0);

  const [sed, setSed] = useState('');

  const [abre, setAbre] = useState('');

  const [btnLoad, setBtnLoad] = useState(false);

  const handleChange = (event) => {
    setEst(event.target.value);
  }

  const handleOfi = (event) => {
    setSed(event.target.value);
  }

  const handleUbi = (event) => {
    setAbre(event.target.value);
  }

  const handleEstatus = async (data) => {

    try {

      onClose();

      const insert = await insertData(data);

      if (insert.estatus === true) {
        enqueueSnackbar(insert.msj, { variant: 'success' });

        mutate(endpoints.gestor.getSedes);

        setBtnLoad(false);

      } else {
        enqueueSnackbar(insert.msj, { variant: 'error' });

        setBtnLoad(false);
      }

    } catch (error) {
      console.error("Error en handleEstatus:", error);
      enqueueSnackbar(`¡No se pudieron actualizar los datos!`, { variant: 'danger' });
      setBtnLoad(false);
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

        <DialogTitle>Agregar sede</DialogTitle>

        <FormControl spacing={3} sx={{ p: 3 }}>

          <TextField
            id="outlined-basic"
            label="Sede"
            variant="outlined"
            value={sed}
            onChange={(e) => handleOfi(e)}
            sx={{ mb: 3 }}
          />

          <TextField
            id="outlined-basic"
            label="Abreación"
            variant="outlined"
            value={abre}
            onChange={(e) => handleUbi(e)}
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
        <LoadingButton variant="contained" color="success" loading={btnLoad} onClick={() => {
          setBtnLoad(true);
          handleEstatus(
            {
              'sede': sed,
              'abreviacion': abre,
              'estatus': est,
              'creadoPor': user?.idUsuario,
            });
          confirm.onFalse();
        }}>
          Guardar
        </LoadingButton>
      </DialogActions>

    </Dialog>

  );
}

ModalAgregarSedes.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool
};
