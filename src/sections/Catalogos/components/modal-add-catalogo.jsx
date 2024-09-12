import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Dialog,
  Select,
  Button,
  MenuItem,
  TextField,
  InputLabel,
  FormControl,
  DialogTitle,
  DialogActions,
  DialogContent
} from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { addCatalogoss } from 'src/api/catalogos/catalogos';

import { useSnackbar } from 'src/components/snackbar';
// eslint-disable-next-line react/prop-types
export default function AgregarCatalogoModal({ open, onClose, onCatalogoAdded }) {
  const [nombreCatalogo, setNombre] = useState('');
  const [estatus, setEstatus] = useState('1');
  const { user: datosUser } = useAuthContext();
  const [btnLoad, setBtnLoad] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const estatus_select = [
    { value: '1', label: 'Activo' },
    { value: '0', label: 'Inactivo' }
  ];

  const guardarCatalogo = async () => {
    if (!nombreCatalogo.trim()) {
      enqueueSnackbar('Ingrese el nombre del catálogo.', { variant: 'warning' });
      return;
    }

    setBtnLoad(true); 
    try {
      await addCatalogoss(nombreCatalogo, estatus, datosUser?.idUsuario);
      setNombre(''); 
      setEstatus('1'); 

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
      <DialogTitle>Agregar catálogo</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Nombre del catálogo"
          type="text"
          fullWidth
          value={nombreCatalogo}
          onChange={(e) => setNombre(e.target.value)}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Estatus</InputLabel>
          <Select
            value={estatus}
            onChange={(e) => setEstatus(e.target.value)}
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
      <Button variant="contained" color="error" onClick={onClose}>
          Cancelar
         </Button>
        <LoadingButton
          variant="contained"
          color="success"
          loading={btnLoad}
          onClick={guardarCatalogo}
        >Agregar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}