import { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  FormControl,
  DialogTitle,
  DialogActions,
  DialogContent
} from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { addCatalogosOp } from 'src/api/catalogos/catalogos';

import { useSnackbar } from 'src/components/snackbar';

// eslint-disable-next-line react/prop-types
export default function AgregarCatalogoOpModal({ open, onClose, numOpcion, idCatalogo, onCatalogoAdded}) {
  const [nombreCatalogOp, setNombreCatalogOp] = useState('');
  const [estatusOp, setEstatusOp] = useState('1');
  const { user: datosUser } = useAuthContext();
  const [btnLoad, setBtnLoad] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const estatus_select = [
    { value: '1', label: 'Activo' },
    { value: '0', label: 'Inactivo' }
  ];

  const guardarCatalogoOp = async () => {
    if (!nombreCatalogOp.trim()) {
      enqueueSnackbar('Ingrese el nombre de su opción de catálogo.', { variant: 'warning' });
      return;
    }
    
    setBtnLoad(true);
    try {
      await addCatalogosOp(numOpcion,idCatalogo, nombreCatalogOp, estatusOp, datosUser.idUsuario);
      setNombreCatalogOp('');
      setEstatusOp('1');

      if (onCatalogoAdded) onCatalogoAdded();
      enqueueSnackbar('Catálogo guardado correctamente', { variant: 'success' });

      onClose();
    } catch (error) {
      console.error('Error al agregar el catálogo', error);
      enqueueSnackbar('Error al guardar el catálogo', { variant: 'error' });
    } finally {
      setBtnLoad(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Agregar opción de catálogo</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Ingrese el nombre"
          type="text"
          fullWidth
          value={nombreCatalogOp}
          onChange={(e) => setNombreCatalogOp(e.target.value)}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Estatus</InputLabel>
          <Select
            value={estatusOp}
            onChange={(e) => setEstatusOp(e.target.value)}
          >
            {estatus_select.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="error">
          Cancelar
        </Button>
        <LoadingButton
          variant="contained"
          color="success"
          loading={btnLoad}
          onClick={guardarCatalogoOp}
        >
          Agregar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}


