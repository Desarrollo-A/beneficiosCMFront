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
import DialogActions from '@mui/material/DialogActions';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { useUpdate } from 'src/api/reportes';
import { useAuthContext } from 'src/auth/hooks';

import { useSnackbar } from 'src/components/snackbar';
// ----------------------------------------------------------------------

export default function EncuestaHabilitar({ open, onClose, idEncuesta }) {

  const { user } = useAuthContext();

  const confirm = useBoolean();

  const { enqueueSnackbar } = useSnackbar();

  const [pregunta, setPregunta] = useState('');

  const handleChange = (event) => {
    setPregunta(event.target.value);
  }

  const updateEstatus = useUpdate(endpoints.encuestas.updateEstatus);

  const handleEstatus = async (vig) => {

    if (vig !== '') {

      try {

        const data = {
          'idEncuesta': idEncuesta,
          'estatus': 1,
          'vigencia': vig,
          'area': user.puesto
        };

        onClose();

        const update = await updateEstatus(data);

        if (update.estatus === true) {
          enqueueSnackbar(update.msj, { variant: 'success' });

          mutate(endpoints.encuestas.getEncuestasCreadas);
          mutate(endpoints.encuestas.getEncNotificacion);
          mutate(endpoints.encuestas.getEstatusUno);

        } else {
          enqueueSnackbar(update.msj, { variant: 'error' });
        }

      } catch (error) {
        console.error("Error en handleEstatus:", error);
        enqueueSnackbar(`¡No se pudieron actualizar los datos de usuario!`, { variant: 'danger' });
      }

    } else {
      enqueueSnackbar(`¡No se selecciono el número de días!`, { variant: 'danger' });
    }

  };

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

      {/* <DialogTitle>Trimestre</DialogTitle> */}

      <Stack spacing={1} >
        <FormControl spacing={3} sx={{ p: 3 }}>
          <InputLabel spacing={3} sx={{ p: 3 }} id="demo-simple-select-label">Dias para constestar</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            label="Dias para constestar"
            value={pregunta}
            onChange={(e) => handleChange(e)}
          >
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={3}>3</MenuItem>
          </Select>

        </FormControl>

      </Stack>

      <DialogActions>
        <Button variant="contained" color="success" onClick={() => {
          handleEstatus(pregunta);
          confirm.onFalse();
        }}>
          Habilitar
        </Button>
        <Button variant="outlined" onClick={onClose}>
          Cerrar
        </Button>
      </DialogActions>

    </Dialog>

  );
}

EncuestaHabilitar.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  idEncuesta: PropTypes.number,
};
