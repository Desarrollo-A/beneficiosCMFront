import * as React from 'react';
import { useState } from 'react';
import PropTypes from 'prop-types';

import { Stack} from '@mui/material';
import Slide from '@mui/material/Slide';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { endpoints } from 'src/utils/axios';

import { HOST } from 'src/config-global';
import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';
import { Upload } from 'src/components/upload';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />); 

export default function AvisoPrivacidadGeneral({datos, enviarDatosAlPadre, idPuesto}) {
    const settings = useSettingsContext();
    const [open, setOpen] = React.useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const [nombreArchivo, setNombreArchivo] = useState({nombre: '', activo: false});
    const { user } = useAuthContext();

    const handleEditarArchivo = () => {
        setOpen(true);
    }
    
    const handleClose = (reason) => {
        if (reason && reason === "backdropClick") 
        return;
        setOpen(false);
        setArchivo('');
        setNombreArchivo({nombre: '', activo: false});
    };

    // subir el archivo
    const [archivo, setArchivo] = useState(null);  
    const manejarCambioArchivo = (event) => {
        setArchivo(event[0]);
        setNombreArchivo({nombre: event[0].path, activo: true});
    };

    const eliminarArchivo = () => {
        setArchivo('');
        setNombreArchivo({nombre: '', activo: false});
    };


    const accessToken = sessionStorage.getItem('accessToken');
    
    return (
      <>
        <Container
          maxWidth={settings.themeStretch ? false : 'lg'}
          style={{ display: datos.visualize, paddingTop: '1%' }}
        >
          <Grid xs={10}>
            <Stack
              direction="row"
              justifyContent="right"
              useFlexGap
              flexWrap="wrap"
              sx={{ p: { xs: 1, md: 2 } }}
            >
              <Button
                variant="contained"
                style={{ display: user?.idRol === 4 ? '' : 'none' }}
                onClick={handleEditarArchivo}
                size="small"
                startIcon={<Iconify icon="eva:edit-fill" />}
              >
                Editar documento
              </Button>
            </Stack>

            <Stack sx={{ mt: '5%' }}>
              <iframe title="frame" src={datos.rutaArchivo} width="100%" height="550px" />
            </Stack>
          </Grid>
        </Container>
        <Container
          maxWidth={settings.themeStretch ? false : 'lg'}
          style={{ display: user?.idRol === 4 ? 'block' : 'none' }}
        >
          <Dialog
            open={open}
            onClose={handleClose}
            TransitionComponent={Transition}
            size="sm"
            maxWidth="sm"
            fullWidth
            PaperProps={{
              component: 'form',
              onSubmit: (event) => {
                event.preventDefault();
                if (archivo) {
                  const formData = new FormData();
                  formData.append('archivo', archivo);
                  formData.append('idDocumento', datos.idDocumento);
                  formData.append('nombreEspecialidad', datos.tituloEspecialidad);
                  formData.append('accion', 2); // tipoDeAccion: 1: nuevo 2: Editar

                  // Realizar la llamada al servidor para subir el archivo (puedes usar fetch o axios)
                  fetch(`${HOST}${endpoints.avisosPrivacidad.actualizarArchivoPrivacidad}`, {
                    method: 'POST',
                    body: formData,
                    headers: {
                      Token: accessToken,
                    }
                  })
                    .then((response) => response.json())
                    .then((data) => {
                      if (data.code === 200) {
                        enviarDatosAlPadre(true);
                        enqueueSnackbar(data.message, { variant: 'success' });
                        setOpen(false);
                        setArchivo('');
                        setNombreArchivo({nombre: '', activo: false});
                      } else {
                        enqueueSnackbar(data.message, { variant: 'error' });
                      }
                    })
                    .catch((error) => {
                      console.error(error);
                      enqueueSnackbar('Error al subir el archivo', { variant: 'error' });
                    });
                }
              },
            }}
          >
            <DialogTitle>Edición del archivo {datos.tituloEspecialidad}</DialogTitle>
            <DialogContent>
              <Stack
                direction="row"
                justifyContent="center"
                useFlexGap
                flexWrap="wrap"
                sx={{ p: { xs: 1, md: 2 } }}
              >
                {nombreArchivo.nombre}
              </Stack>
              <Upload
                file={archivo}
                onDrop={manejarCambioArchivo}
                onDelete={() => eliminarArchivo()}
                accept={{ 'application/pdf': [] }}
              />
            </DialogContent>
            <DialogActions>
              <Button variant='contained' color='error' onClick={handleClose}>Cerrar</Button>
              <Button
                type="submit"
                variant='contained'
                disabled={!nombreArchivo.activo}
                color='success'
                endIcon={<Iconify icon="eva:cloud-upload-fill" />}
              >
                Subir Archivo
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </>
    );

}

AvisoPrivacidadGeneral.propTypes = {
    datos: PropTypes.any,
    enviarDatosAlPadre: PropTypes.func,
    idPuesto: PropTypes.number
}