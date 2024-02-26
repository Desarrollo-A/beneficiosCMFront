import axios from 'axios';
import { useState, useEffect } from 'react';

import { Stack } from '@mui/system';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------
import { HOST } from 'src/config-global';
import { useGetGeneral } from 'src/api/general';
import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';
import { Upload } from 'src/components/upload';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import EmptyContent from 'src/components/empty-content/empty-content';

import VisorPdf from 'src/sections/privacidad/visorArchivoPdf';

let once = 0;

export default function AvisoPrivacidadGeneral() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();

  const [especialidadSelector, setEspecialidadSelector] = useState('');
  const [propiedadesIFrame, setPropiedadesIFrame] = useState({
    visualize: 'none',
    rutaArchivo: '',
    tituloEspecialidad: '',
    idDocumento: 0,
  });
  const { especialidadesDisponibles } = useGetGeneral(
    endpoints.avisosPrivacidad.getEspecialidadToSelect,
    'especialidadesDisponibles'
  );
  const [archivoPrivacidad, setArchivoPrivacidad] = useState({
    archivo: '',
    idDocumento: 0,
    nombreDocumento: '',
  });
  const [existeRama, setExisteRama] = useState(false);
  const [detalleEspecialidad, setDetalleEspecialidad] = useState({ id: '', nombre: '' });
  const [actualizarView, setAcualizarView] = useState(false);
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [archivo, setArchivo] = useState(null);

  // funcion para hacer comunicacion bi-direccional entre
  // componente padre y componente hijo
  const manejarBanderaDesdeHijo = (dato) => {
    setAcualizarView(dato);
    setTimeout(() => {
      setAcualizarView(false);
    }, 2000);
  };

  useEffect(() => {
    // setearle valores al iframe para que se vizualice
    setPropiedadesIFrame({
      visualize: propiedadesIFrame.visualize,
      rutaArchivo: propiedadesIFrame.rutaArchivo,
      tituloEspecialidad: propiedadesIFrame.tituloEspecialidad,
      idDocumento: archivoPrivacidad.idDocumento,
    });
  }, [
    archivoPrivacidad.idDocumento,
    propiedadesIFrame.rutaArchivo,
    propiedadesIFrame.tituloEspecialidad,
    propiedadesIFrame.visualize,
  ]);

  const handle = async (event) => {
    setAcualizarView(false);
    setEspecialidadSelector(event);
    setDetalleEspecialidad({ id: event.idOpcion, nombre: event.nombre });
    try {
      // Realizar la llamada al servicio
      const respuesta = await axios.get(
        `${HOST}${endpoints.avisosPrivacidad.getAvisoDePrivacidad}/${event.idOpcion}`
      );
      if (respuesta.data.length >= 1) {
        // Actualizar el estado con los datos obtenidos
        setExisteRama(false);
        setArchivoPrivacidad({
          archivo: respuesta.data[0].expediente,
          idDocumento: respuesta.data[0].idDocumento,
          nombreDocumento: `${respuesta.data[0].nombreDocumento} de ${respuesta.data[0].nombreEspecialidad}`,
        });
        setPropiedadesIFrame({
          visualize: 'block',
          rutaArchivo: `${HOST}/dist/documentos/avisos-privacidad/${respuesta.data[0].expediente}`,
          tituloEspecialidad: respuesta.data[0].nombreEspecialidad,
          idDocumento: respuesta.data[0].idDocumento,
          setFuncion: manejarBanderaDesdeHijo,
        });
      } else {
        setExisteRama(true);
        setPropiedadesIFrame({
          visualize: 'none',
          rutaArchivo: ``,
          tituloEspecialidad: 'na',
          idDocumento: 'na',
        });
      }
    } catch (error) {
      console.error('Error al obtener datos del servicio SQL', error);
    }
  };

  useEffect(() => {
    const handleChange = async (event) => {
      setAcualizarView(false);
      setEspecialidadSelector(event);
      setDetalleEspecialidad({ id: event.idOpcion, nombre: event.nombre });
      try {
        // Realizar la llamada al servicio
        const respuesta = await axios.get(
          `${HOST}${endpoints.avisosPrivacidad.getAvisoDePrivacidad}/${event.idOpcion}`
        );
        if (respuesta.data.length >= 1) {
          // Actualizar el estado con los datos obtenidos
          setExisteRama(false);
          setArchivoPrivacidad({
            archivo: respuesta.data[0].expediente,
            idDocumento: respuesta.data[0].idDocumento,
            nombreDocumento: `${respuesta.data[0].nombreDocumento} de ${respuesta.data[0].nombreEspecialidad}`,
          });
          setPropiedadesIFrame({
            visualize: 'block',
            rutaArchivo: `${HOST}/dist/documentos/avisos-privacidad/${respuesta.data[0].expediente}`,
            tituloEspecialidad: respuesta.data[0].nombreEspecialidad,
            idDocumento: respuesta.data[0].idDocumento,
            setFuncion: manejarBanderaDesdeHijo,
          });
        } else {
          setExisteRama(true);
          setPropiedadesIFrame({
            visualize: 'none',
            rutaArchivo: ``,
            tituloEspecialidad: 'na',
            idDocumento: 'na',
          });
        }
      } catch (error) {
        console.error('Error al obtener datos del servicio SQL', error);
      }
    };
    
    if (typeof especialidadesDisponibles === 'object' && especialidadesDisponibles.length > 0) {
      console.log('1', especialidadesDisponibles);
      if (especialidadesDisponibles.length > 0) {
        especialidadesDisponibles.forEach((especialidad) => {
          if (user.idPuesto === especialidad.idPuesto && once === 0) {
            handleChange(especialidad);
            once += 1;
          }
        });
      }
    }
  }, [especialidadesDisponibles, user.idPuesto]);

  useEffect(() => {
    if (actualizarView) {
      // para que haga efecto solo cuando el estado este en true
      const response = async function refrescarData() {
        const respuesta = await axios.get(
          `${HOST}${endpoints.avisosPrivacidad.getAvisoDePrivacidad}/${detalleEspecialidad.id}`
        );
        if (respuesta.data.length >= 1) {
          // Actualizar el estado con los datos obtenidos
          setExisteRama(false);
          setArchivoPrivacidad({
            archivo: respuesta.data[0].expediente,
            idDocumento: respuesta.data[0].idDocumento,
            nombreDocumento: `${respuesta.data[0].nombreDocumento} de ${respuesta.data[0].nombreEspecialidad}`,
          });
          setPropiedadesIFrame({
            visualize: 'block',
            rutaArchivo: `${HOST}/dist/documentos/avisos-privacidad/${respuesta.data[0].expediente}`,
            tituloEspecialidad: respuesta.data[0].nombreEspecialidad,
            idDocumento: respuesta.data[0].idDocumento,
          });
        } else {
          setExisteRama(true);
          setPropiedadesIFrame({
            visualize: 'none',
            rutaArchivo: ``,
            tituloEspecialidad: 'na',
            idDocumento: 'na',
          });
        }
      };
      response();
    }
  }, [actualizarView, detalleEspecialidad.id]);

  // eslint-disable-next-line react/no-unstable-nested-components
  const NoHayArchivo = () => {
    const manejarCambioArchivo = (event) => {
      // acciones al cambiar el documento
      const archivoSeleccionado = event[0].path;

      setNombreArchivo(archivoSeleccionado);
      setArchivo(event[0]);
    };

    const eliminarArchivo = () => {
      setNombreArchivo('');
      setArchivo('');
    };

    const manejarEnvioFormulario = (event) => {
      event.preventDefault();
      if (archivo) {
        const formData = new FormData();
        formData.append('archivo', archivo);
        formData.append('nombreEspecialidad', detalleEspecialidad.nombre);
        formData.append('idEspecialidad', detalleEspecialidad.id);
        formData.append('accion', 1); // tipoDeAccion: 1: nuevo 2: Editar
        formData.append('idUsuario', user?.idUsuario);

        // Realizar la llamada al servidor para subir el archivo
        fetch(`${HOST}${endpoints.avisosPrivacidad.actualizarArchivoPrivacidad}`, {
          method: 'POST',
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.code === 200) {
              setAcualizarView(true);
              enqueueSnackbar(data.message, { variant: 'success', autoHideDuration: 3000 });
              setNombreArchivo('');
              setArchivo(null);
            } else {
              enqueueSnackbar(data.message, { variant: 'error', autoHideDuration: 3000 });
            }
          })
          .catch((error) => {
            enqueueSnackbar('Error al subir el archivo', {
              variant: 'error',
              autoHideDuration: 3000,
            });
          });
      }
    };

    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'} style={{ paddingTop: '2%' }}>
        <Grid container spacing={2}>
          <Grid xs={12}>
            <form onSubmit={manejarEnvioFormulario}>
              <Stack direction="row" justifyContent="center">
                <Typography>{nombreArchivo}</Typography>
              </Stack>
              {user?.idRol === 4 ? (
                <Grid
                  xs={12}
                  style={{
                    alignItems: 'center',
                    height: '450px',
                    width: '100%',
                    alignContent: 'space-around',
                    flexWrap: 'wrap',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Upload
                    onDrop={manejarCambioArchivo}
                    accept={{ 'application/pdf': [] }}
                    file={archivo}
                    onDelete={() => eliminarArchivo()}
                  />
                </Grid>
              ) : (
                <Grid
                  xs={12}
                  style={{
                    alignItems: 'center',
                    height: '100%',
                    width: '100%',
                    alignContent: 'space-around',
                    flexWrap: 'wrap',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <EmptyContent
                    filled
                    title="Sin Datos"
                    sx={{
                      py: 10,
                    }}
                  />
                </Grid>
              )}
              <Grid
                xs={12}
                style={{
                  textAlign: 'center',
                  marginTop: '10%',
                  display: nombreArchivo === '' ? 'none' : 'block',
                }}
              >
                <Button
                  variant="contained"
                  type="submit"
                  color="success"
                  endIcon={<Iconify icon="eva:cloud-upload-fill" />}
                >
                  Subir archivo
                </Button>
              </Grid>
            </form>
          </Grid>
        </Grid>
      </Container>
    );
  };

  let visorPdfFile = '';
  if (existeRama === true) {
    visorPdfFile = <NoHayArchivo />;
  }

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Grid container spacing={2}>
          <Grid xs={12}>
            <h3>Políticas de privacidad</h3>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Tipo especialidad</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={especialidadSelector}
                label="Tipo especialidad"
                onChange={(e) => handle(e.target.value)}
                sx={{ width: '100%' }}
                defaultValue=""
              >
                {especialidadesDisponibles !== undefined &&
                  especialidadesDisponibles.length > 0 &&
                  especialidadesDisponibles.map((elemento, index) =>
                    user.idPuesto === elemento.idPuesto || user?.idRol === 4 ? (
                      <MenuItem value={elemento} key={elemento.idOpcion}>
                        {elemento.nombre}
                      </MenuItem>
                    ) : (
                      ''
                    )
                  )}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Container>

      {visorPdfFile}
      <VisorPdf
        datos={propiedadesIFrame}
        enviarDatosAlPadre={manejarBanderaDesdeHijo}
        idPuesto={especialidadSelector.idPuesto}
      />
    </>
  );
}
