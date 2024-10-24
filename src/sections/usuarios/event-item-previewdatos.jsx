import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { LoadingButton } from '@mui/lab';
import { Box,Grid,Dialog,Button,TextField,Typography,DialogTitle,DialogContent, DialogActions } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { verificacionCorreo } from 'src/api/perfil/eventos'; 

import { useSnackbar } from 'src/components/snackbar';

import VerificarCorreoModal from './event-item-verificar';

export default function ConfirmarAsistencia({ open, onClose, onSubmit, isSubmitting }) {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const methods = useForm({
    defaultValues: {
      correo: user?.correo || '',
    },
  });

  const [isVerificationOpen, setVerificationOpen] = useState(false); 
  const [isLoading, setIsLoading] = useState(false); 
  const [userEmail, setUserEmail] = useState(''); // Almacenar el correo del usuario
  const handleVerifyClick = async () => {
    const correo = methods.getValues('correo'); 
    setUserEmail(correo);
    localStorage.setItem('userEmail', correo);

    try {
      setIsLoading(true);  
      await verificacionCorreo(correo); 
      setVerificationOpen(true);
      onClose();
      enqueueSnackbar('Se ha enviado un código a tu correo.', { variant: 'success' });

      
    } catch (error) {
      enqueueSnackbar('Error al enviar la verificación del correo.', { variant: 'error' });
    } finally {
      setIsLoading(false); 
    }
  };
  return (
    <>
      <Dialog open={open} fullWidth maxWidth="sm" disableEscapeKeyDown backdrop="static">
        <FormProvider {...methods}>
          <form>
            <DialogTitle>Confirmación de asistencia</DialogTitle>
            <DialogContent sx={{ maxHeight: '400px', overflowY: 'auto' }}>
              <Box mb={2}>
                <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
                Asegúrate de que tu correo electrónico sea correcto.
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Nombre completo</Typography>
                  <Typography variant="body1">{user?.nombre.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())}</Typography> 
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Departamento</Typography>
                  <Typography variant="body1">{user?.departamento}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Sede</Typography>
                  <Typography variant="body1">{user?.sede}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Tipo de puesto</Typography>
                  <Typography variant="body1">{user?.puesto.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Fecha de ingreso</Typography>
                  <Typography variant="body1">{new Date(user?.fechaIngreso).toLocaleDateString('es-ES', {day: '2-digit',month: '2-digit',year: 'numeric',})}</Typography>  
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="correo"
                    label="Correo Electrónico"
                    variant="outlined"
                    fullWidth
                    {...methods.register('correo')}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button variant="contained" color="error" onClick={onClose}>
                Cancelar
              </Button>
              <LoadingButton
                variant="contained"
                color="success"
                loading={isLoading} 
                onClick={handleVerifyClick} 
              > Verificar correo
              </LoadingButton>
            </DialogActions>
          </form>
        </FormProvider>
      </Dialog>
      <VerificarCorreoModal
        open={isVerificationOpen}
        onClose={() => setVerificationOpen(false)}
        correo={userEmail}
         
        
      />
    </>
  );
}
ConfirmarAsistencia.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  isSubmitting: PropTypes.bool,
};
