import PropTypes from 'prop-types';
import { useState,useEffect } from 'react';

import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';

import { useAuthContext } from 'src/auth/hooks';
import { updateStatusCatalogoss } from 'src/api/catalogos/catalogos';

import { useSnackbar } from 'src/components/snackbar';


export default function EditarEstatus({ open, onClose, idCatalogo, estatusVal }) {
  const { enqueueSnackbar } = useSnackbar();
  const [estatus, setEstatus] = useState(estatusVal);
  const [btnLoad, setBtnLoad] = useState(false);
  const { user: datosUser } = useAuthContext();

  useEffect(() => {
    setEstatus(estatusVal);
  }, [estatusVal]);

  const handleChange = (event) => {
    setEstatus(event.target.value);
  };

  const handleEstatus = async () => {
    setBtnLoad(true); 
    try {
      await updateStatusCatalogoss(idCatalogo, estatus, datosUser?.idUsuario);
      enqueueSnackbar('Estatus actualizado correctamente', { variant: 'success' });
      onClose();
    } catch (error) {
      console.error('Error al actualizar el estatus', error);
      enqueueSnackbar('Error al actualizar el estatus', { variant: 'error' });
    } finally {
      setBtnLoad(false); 
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <Stack spacing={2}>
        <DialogTitle>¿Estás seguro de cambiar el estatus del catálogo?</DialogTitle>

        <FormControl sx={{ p: 3 }}>
          <InputLabel id="estatus-select-label">Estatus</InputLabel>
          <Select
            labelId="estatus-select-label"
            id="estatus-select"
            value={estatus}
            onChange={handleChange}
          >
            <MenuItem value="Activo">Activo</MenuItem>
            <MenuItem value="Inactivo">Inactivo</MenuItem>
          </Select>
        </FormControl>
      </Stack>  

      <DialogActions>
        <Button variant="contained" color="error" onClick={onClose}>
          Cancelar
        </Button>
        <LoadingButton
          variant="contained"
          color="success"
          loading={btnLoad}
          onClick={handleEstatus}
        >  Actualizar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

EditarEstatus.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  idCatalogo: PropTypes.any.isRequired, 
  estatusVal: PropTypes.string.isRequired, 
};

