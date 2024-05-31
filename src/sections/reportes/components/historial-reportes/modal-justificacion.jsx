import PropTypes from 'prop-types';

import { Box } from '@mui/system';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { HOST } from 'src/config-global';

import Iconify from 'src/components/iconify';
// ----------------------------------------------------------------------
export default function ModalJustificacion({ open, onClose, observacion, archivo }) {
  const theme = useTheme();

  const fileExt = archivo ? /[^.]+$/.exec(archivo)[0] : '';

  return (
      <Dialog
          fullWidth
          maxWidth={false}
          open={open}
          onClose={onClose}
          PaperProps={{
              sx: { maxWidth: fileExt === 'pdf' ? 720 : 350 },
          }}
      >

          <DialogTitle>Justificación de cita</DialogTitle>

          <DialogContent>
              <Grid xs={12} md={6} sx={{ p: 3 }}>
                <Box sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#25303d' : '#f7f7f7',
        borderRadius: '5px', }}>Comentario: {observacion}</Box>
                  <Box mb={2} />
                  {archivo ? (
                      <>
                          {fileExt === 'pdf' ? (
                              <iframe title="frame" src={`${HOST}/documentos/archivo/${archivo}`} width="100%" height="550px" />
                          ) : (
                              <Button variant="contained" color="info" sx={{width:'100%', height: '60px', }}
                                href={`${HOST}/documentos/archivo/${archivo}`}>
                                  <Iconify icon="humbleicons:download" /> 
                                  Descargar archivo
                              </Button>
                          )}
                      </>
                  ) : (
                      null
                  )}
              </Grid>

          </DialogContent>

          <DialogActions>
              <Button variant="contained" color="error" onClick={onClose}>
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
  archivo: PropTypes.any
};
