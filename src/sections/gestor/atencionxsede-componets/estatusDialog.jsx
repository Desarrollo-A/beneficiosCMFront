import { mutate } from 'swr';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { useUpdate } from 'src/api/reportes';

import { useSnackbar } from 'src/components/snackbar';
// ----------------------------------------------------------------------

export default function ModalEstatus({ open, onClose, id, estatus }) {

  const confirm = useBoolean();

  const { enqueueSnackbar } = useSnackbar();

  const updateEstatus = useUpdate(endpoints.gestor.updateEstatus);
  
  const handleEstatus = async (i) => {

    try {
      const data = {
        'idDetallePnt': id,
        'estatus': estatus === 1 ? 0 : 1,
      };

      if (Number.isInteger(data.estatus)) {

        onClose();

        const update = await updateEstatus(data);

        if (update.result === true) {
          enqueueSnackbar(update.msg, { variant: 'success' });

          mutate(endpoints.gestor.getAtencionXsede);
          mutate(endpoints.gestor.getAtencionXsedeEsp);

        } else {
          enqueueSnackbar(update.msg, { variant: 'error' });
        }

      } else {
        enqueueSnackbar(`No seleccionaste alguna opción`, { variant: 'danger' });
      }

    } catch (error) {
      enqueueSnackbar(`Error en actualizar los datos`, { variant: 'danger' });
    }
  }

  return (
    <>
      <Stack spacing={1} >
        {estatus === 1 ?
            <DialogTitle>¿Estás seguro que quieres deshabilitar la atención por sede?</DialogTitle>
            : <DialogTitle>¿Estás seguro que quieres habilitar la atención por sede?</DialogTitle>
        }
      </Stack>

      <DialogActions>
        <Button variant="contained" color="error" onClick={onClose}>
          Cerrar
        </Button>
        <Button variant="contained" color="success" onClick={() => {
          handleEstatus(estatus);
          confirm.onFalse();
        }}>
          Aceptar
        </Button>
      </DialogActions>
    </>
  );
}

ModalEstatus.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  id: PropTypes.any,
  estatus: PropTypes.number
};
