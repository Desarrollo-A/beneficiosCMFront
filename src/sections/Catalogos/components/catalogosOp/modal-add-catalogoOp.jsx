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
export default function AgregarCatalogoOpModal({ open, onClose, onCatalogoAdded,idCatalogo}) {
  const [idOpcion, setIdOpcion] = useState('');
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
      enqueueSnackbar('Ingresa un nombre de catálogo.', { variant: 'warning' });
      return;
    }
    
    setBtnLoad(true);
    try {
      await addCatalogosOp(idOpcion,idCatalogo, nombreCatalogOp, estatusOp, datosUser.idUsuario);
      setIdOpcion('');
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
      <DialogTitle>Agregar Catálogo</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="ID Opción"
          type="number"
          fullWidth
          value={idOpcion}
          onChange={(e) => setIdOpcion(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Nombre del Catálogo"
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
        <Button onClick={onClose} color="primary">
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


