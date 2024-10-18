import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, TextField, Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { LoadingButton } from '@mui/lab';
import { useSnackbar } from 'src/components/snackbar';
import { useAuthContext } from 'src/auth/hooks';



import { hideShowEvent, actualizarAsistenciaEvento ,verificacionCodigoCorreo } from 'src/api/perfil/eventos'; 


export default function VerificarCorreoModal({ open, onClose, correo,idEvento }) {
  const { user } = useAuthContext();
  const [codigo, setCodigo] = useState('');
  const [btnLoad, setBtnLoad] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleVerificar = async () => {
    try {
      setBtnLoad(true);
      // Verificación del código de correo
      const response = await verificacionCodigoCorreo(correo, codigo);
      if (response.status === 'success') {
        enqueueSnackbar('Token verificado -Registrando asistencia', { variant: 'success' });
        const res = await actualizarAsistenciaEvento(
          user?.idContrato,
          1,
          1,  
          user?.idUsuario
        );
        onClose();  
        if (res && res.result) {
          // enqueueSnackbar('Asistencia confirmada.', { variant: 'success' });
         // onClose();  
        } else {
          // enqueueSnackbar('Error al confirmar la asistencia.', { variant: 'error' });
        }
      } else {
      //   enqueueSnackbar(`Error: ${response.message}`, { variant: 'error' });
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
      <DialogTitle>Enviamos un código de verificación</DialogTitle>
      <Box mb={2}>
       <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
        Revisa la bandeja de tu correo electrónico
      </Typography>
      </Box>
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
        >Verificar y confirmar asistencia
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
