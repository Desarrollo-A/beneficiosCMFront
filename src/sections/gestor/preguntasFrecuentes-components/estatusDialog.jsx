import { mutate } from 'swr';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { useAuthContext } from 'src/auth/hooks';
import { habilitarPregunta } from 'src/api/FaqCh/faqCh';

import { useSnackbar } from 'src/components/snackbar';

// ----------------------------------------------------------------------

export default function ModalEstatus({ open, onClose, idPregunta, estatus }) {

  const confirm = useBoolean();

  const { user } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();
  
  const handleEstatus = async (i) => {
    try {
      const newStatus = estatus === 1 ? 0 : 1

      if (Number.isInteger(estatus)) {
        onClose();

        const update = await habilitarPregunta(idPregunta, newStatus, user.idUsuario);

        if (update.result) {
          enqueueSnackbar(update.msg, { variant: 'success' });

          mutate(endpoints.gestor.getFaqsCh);

        } else {
          enqueueSnackbar(update.msg, { variant: 'error' });
        }

      } else {
        enqueueSnackbar(`No seleccionaste alguna opción`, { variant: 'danger' });
      }

    } catch (error) {
      enqueueSnackbar(`Error en actualizar el estatus`, { variant: 'danger' });
    }
  }

  return (
    <>
      <Stack spacing={1} >
        {estatus === 1 ?
            <DialogTitle>¿Estás seguro que quieres deshabilitar esta FAQ?</DialogTitle>
            : <DialogTitle>¿Estás seguro que quieres habilitar esta FAQ?</DialogTitle>
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
  idPregunta: PropTypes.any,
  estatus: PropTypes.number
};
