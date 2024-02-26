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

import { useSnackbar } from 'src/components/snackbar';
// ----------------------------------------------------------------------

export default function EncuestaHabilitar({ open, onClose, idEncuesta, puestos }) {

  const confirm = useBoolean();

  const { enqueueSnackbar } = useSnackbar();

  const [pregunta, setPregunta] = useState('');

  const [btnLoad, setBtnLoad] = useState(false);

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
          'area': puestos
        };

        onClose();

        const update = await updateEstatus(data);

        if (update.estatus === true) {
          enqueueSnackbar(update.msj, { variant: 'success' });

          mutate(endpoints.encuestas.getEncuestasCreadas);
          mutate(endpoints.encuestas.getEncNotificacion);
          mutate(endpoints.encuestas.getEstatusUno);

          setBtnLoad(false);

        } else {
          enqueueSnackbar(update.msj, { variant: 'error' });

          setBtnLoad(false);
        }

      } catch (error) {
        console.error("Error en handleEstatus:", error);
        enqueueSnackbar(`¡No se pudieron actualizar los datos de usuario!`, { variant: 'danger' });

        setBtnLoad(false);
      }

    } else {
      enqueueSnackbar(`¡No se selecciono el número de días!`, { variant: 'danger' });

      setBtnLoad(false);
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
        <Button variant="contained" color="error" onClick={onClose}>
          Cerrar
        </Button>
        <Button variant="contained" color="success" loading={btnLoad} onClick={() => {
          setBtnLoad(true);
          handleEstatus(pregunta);
          confirm.onFalse();
        }}>
          Habilitar
        </Button>
      </DialogActions>

    </Dialog>

  );
}

EncuestaHabilitar.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  idEncuesta: PropTypes.number,
  puestos: PropTypes.any,
};
