import { mutate } from 'swr';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
import { useRef, useState, useEffect } from 'react';

import { Box } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import { Stack, Typography } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { endpoints } from 'src/utils/axios';

import { HOST } from 'src/config-global';
import { aceptarJustificacion } from 'src/api/reportes';

import Iconify from 'src/components/iconify';
// ----------------------------------------------------------------------
export default function ModalJustificacion({ open, onClose, observacion, archivo, idCita, rol, estatusCita, justificado }) {
  const theme = useTheme();
  const widthInput = useRef(0)
  const widthBox = useRef(0)
  const [isAceptar, setAceptar] = useState(false)
  const [isRechazo, setRechazo] = useState(false)
  
  const fileExt = archivo ? /[^.]+$/.exec(archivo)[0] : '';

  const aceptar = async(value) => {
    
    switch(value){
      case 1:
        setAceptar(true)
        break

      case 2:
        setRechazo(true)
        break

      default:
        setAceptar(true)
        break
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const save = await aceptarJustificacion(idCita, value)
      
      if (save.result) {
        enqueueSnackbar(save.msg, { variant: 'success' });
        mutate(endpoints.reportes.lista);
        onClose();
      } 
      else {
        enqueueSnackbar(save.msg, { variant: 'error' });
      }

      setAceptar(false)
      setRechazo(false)
    } 
    catch (error) {
      setAceptar(false)
      setRechazo(false)
      
      enqueueSnackbar('Error al enviar los datos', { variant: 'error' });
    }
  }

  useEffect(() => {
    switch(fileExt){
      case 'pdf':
        widthBox.current = 630
        widthInput.current = 600
        break;

      case 'xlsx':
        widthBox.current = 355
        widthInput.current = 320
        break;

      default:
        widthBox.current = 350
        widthInput. current = 320
          break;
    }
  }, [fileExt])
 
  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}

      PaperProps={{
        sx: { maxWidth: fileExt === 'pdf' ? 720 : 450 },
      }}
      backdrop="static" // Add this line to prevent closing on click outside
    >
      <DialogTitle>Justificación de cita</DialogTitle>

      <DialogContent>
        <Grid xs={12} md={6} sx={{ p: 3 }}>
          Comentario:
          <Box
            sx={{
              backgroundColor: theme.palette.mode === 'dark' ? '#25303d' : '#f7f7f7',
              borderRadius: 1,
              padding: 2,
              flexDirection: 'row',
              width: widthBox,
            }}
          >
            <Typography sx={{ width: widthInput, wordWrap: 'break-word' }}>
              {observacion}
            </Typography>
          </Box>
          <Box mb={2} />
          <Stack spacing={4}>
            <Stack spacing={2}>
              {archivo ? (
                <Stack sx={{ mt: 2 }}>
                  {fileExt === 'pdf' ? (
                    <iframe
                      title="frame"
                      src={`${HOST}/documentos/archivo/${archivo}`}
                      width="100%"
                      height="550px"
                    />
                  ) : (
                    <Button
                      variant="contained"
                      color="info"
                      sx={{ width: '100%', height: '60px' }}
                      href={`${HOST}/documentos/archivo/${archivo}`}
                    >
                      <Iconify icon="humbleicons:download" />
                      Descargar archivo
                    </Button>
                  )}
                </Stack>
              ) : (
                ''
              )}
              {rol === 4 && estatusCita === 3 && justificado === 0 ? (
                <Stack direction="row" spacing={2} sx={{ mb: 2, mt: 2 }}>
                  <LoadingButton
                    variant="contained"
                    color="error"
                    sx={{ width: '100%', height: '60px' }}
                    onClick={() => aceptar(2)} // valor 2 - rechazar
                    disabled={isAceptar}
                    loading={isRechazo}
                  >
                    Rechazar
                  </LoadingButton>

                  <LoadingButton
                    variant="contained"
                    color="success"
                    sx={{ width: '100%', height: '60px' }}
                    onClick={() => aceptar(1)} // valor 1 - aceptar
                    disabled={isRechazo}
                    loading={isAceptar}
                  >
                    Aceptar
                  </LoadingButton>
                </Stack>
              ) : (
                ''
              )}
            </Stack>
          </Stack>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" color="error" onClick={onClose} disabled={isRechazo || isAceptar}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ModalJustificacion.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  observacion: PropTypes.any,
  archivo: PropTypes.any,
  idCita: PropTypes.number,
  rol: PropTypes.number,
  estatusCita: PropTypes.number,
  justificado: PropTypes.number
};
