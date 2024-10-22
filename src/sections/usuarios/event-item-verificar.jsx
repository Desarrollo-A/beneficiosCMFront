import PropTypes from 'prop-types';
import React, { useState,useEffect } from 'react';

import { LoadingButton } from '@mui/lab';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box,Button,Dialog,TextField,Typography, DialogTitle, DialogContent, DialogActions } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { hideShowEvent,verificacionCodigoCorreo, actualizarAsistenciaEvento } from 'src/api/perfil/eventos'; 

import { useSnackbar } from 'src/components/snackbar';


export default function VerificarCorreoModal({ open, onClose, correo,idEvento }) {
  const { user } = useAuthContext();
  const [codigo, setCodigo] = useState('');
  const [btnLoad, setBtnLoad] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const handleVerificar = async () => {
    try {
      setBtnLoad(true);
      const response = await verificacionCodigoCorreo(correo, codigo);
      if (response.status === 'success') {
        enqueueSnackbar('Token válido.', { variant: 'success' });
        const res = await actualizarAsistenciaEvento(
          user?.idContrato,
          1,
          1,  
          user?.idUsuario,
          correo,
        );
        onClose();
        enqueueSnackbar('Asistencia registrada. Se ha enviado tu pase a tu correo.', { variant: 'success' });
  
        if (res && res.result) {
          // enqueueSnackbar('Asistencia confirmada.', { variant: 'success' });
         // onClose();  
        } else {
          // enqueueSnackbar('Error al confirmar la asistencia.', { variant: 'error' });
        }
      } else {
         enqueueSnackbar(`Error: ${response.message}`, { variant: 'error' });
      }      
    } catch (error) {
      console.error('Error:', error);
      // enqueueSnackbar('Ocurrió un error, por favor intente nuevamente.', { variant: 'error' });
    } finally {
      setBtnLoad(false);
    }
  };
  const lightTheme = createTheme({
    palette: {
      mode: 'light',
    },
    components: {
      MuiPickersDay: {
        styleOverrides: {
          root: {
            color: 'black',
          },
        },
      },
    },
  });

  return (
    <Dialog open={open} fullWidth maxWidth="sm" disableEscapeKeyDown>
      <DialogTitle>Hemos enviado un código de verificación a tu correo electrónico.</DialogTitle>
    
        <DialogContent sx={{ maxHeight: '500px', overflowY: 'auto' }}>
          <Box mb={2}>
            <ThemeProvider theme={lightTheme}>
              <TextField
                id="codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                name="codigo"
                label="Introduce tu código de verificación"
                autoComplete="off"
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                  marginTop: '16px',
                  marginBottom: '8px',
                }} 
              />
            </ThemeProvider>
          </Box>
        </DialogContent>
      <DialogActions>
        <Button variant="contained" color="error" onClick={onClose}>
          Cancelar
        </Button>
        <LoadingButton
          variant="contained"
          loading={btnLoad}
          onClick={handleVerificar}
        >Verificar y confirmar asistencia.
        </LoadingButton>
      </DialogActions>
    </Dialog>
  ); 
}

VerificarCorreoModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  correo: PropTypes.string.isRequired,
  idEvento: PropTypes.number.isRequired,
};
