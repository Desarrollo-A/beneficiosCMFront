import { mutate } from 'swr';
import { useState } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { useUpdate } from 'src/api/reportes';

import { useSnackbar } from 'src/components/snackbar';
// ----------------------------------------------------------------------

export default function EncuestaHabilitar({ open, onClose, idEncuesta, puestos }) {

  const confirm = useBoolean();

  const { enqueueSnackbar } = useSnackbar();

  const [btnLoad, setBtnLoad] = useState(false);

  const updateEstatus = useUpdate(endpoints.encuestas.updateEstatus);

  const handleEstatus = async () => {

      try {

        const data = {
          'idEncuesta': idEncuesta,
          'estatus': 1,
          'area': puestos
        };

        onClose();

        const update = await updateEstatus(data);

        if (update.estatus === true) {
          enqueueSnackbar(update.msj, { variant: 'success' });

          mutate(endpoints.encuestas.getEncuestasCreadas);
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

  };

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 420 },
      }}
    >

      {/* <DialogTitle>Trimestre</DialogTitle> */}

      <Stack spacing={1} >

        <DialogTitle>¿Estás seguro que deseas habilitar la encuesta seleccionada?</DialogTitle>

      </Stack>

      <DialogActions>
        <Button variant="contained" color="error" onClick={onClose}>
          Cerrar
        </Button>
        <Button variant="contained" color="success" loading={btnLoad} onClick={() => {
          setBtnLoad(true);
          handleEstatus();
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
