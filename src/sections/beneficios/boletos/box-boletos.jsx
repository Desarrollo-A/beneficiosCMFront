import { mutate } from 'swr';
import { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import Pagination from '@mui/material/Pagination';
import {
  Button,
  Dialog,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { HOST } from 'src/config-global';
import { useUpdate } from 'src/api/reportes';
import { useAuthContext } from 'src/auth/hooks';
import { usePostGeneral } from 'src/api/general';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

import './styles.css'
import NewGame from './new-game';
import AddTicket from './add-ticket';
// ----------------------------------------------------------------------

export default function BoxBoletos({ subheader, list, sx, idRol, ...other }) {

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 6;

  // Filtrar la lista por el título basado en el término de búsqueda
  const filteredList = list.filter(item =>
    item.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular cuántas páginas necesitas para la lista filtrada
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  // Obtener los elementos para la página actual de la lista filtrada
  const currentItems = filteredList.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Resetear la página al hacer una nueva búsqueda
  };

  return (
    <Grid container disableEqualOverflow spacing={3}>

      <Grid item xs={12} md={12} >
        <TextField
          fullWidth
          label="Buscar partido"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Iconify icon="icon-park-outline:search" sx={{ ml: 1, color: 'text.disabled' }} />
              </InputAdornment>
            )
          }}
        />
      </Grid>

      {filteredList.length === 0 ? (
        <Grid
          item
          xs={12}
          container
          direction="column"
          alignItems="center"
          justifyContent="center"
        >
          <Image
            src={`${import.meta.env.BASE_URL}assets/img/notFound.png`}
            ratio="1/1"
            sx={{ width: '25%' }}
          />
          <Typography variant="h6" align="center">
            Sin resultados
          </Typography>
        </Grid>
      ) : (
        currentItems.map((item) => (
          <Grid item xs={12} md={4} key={item.id}>
            <BookingItem item={item} idRol={idRol} />
          </Grid>
        ))
      )}

      {filteredList.length > 0 && (
        <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} />
        </Grid>
      )}

    </Grid>
  );
}

BoxBoletos.propTypes = {
  list: PropTypes.array,
  subheader: PropTypes.string,
  sx: PropTypes.object,
  title: PropTypes.string,
  idRol: PropTypes.number,
};

// ----------------------------------------------------------------------

function BookingItem({ item, idRol }) {
  const {
    id,
    titulo,
    // descripcion,
    fechaPartido,
    lugarPartido,
    limiteBoletos,
    imagen,
    imagenPreview,
    estatus,
  } = item;

  const { user } = useAuthContext();

  const idUsuario = user?.idRol;

  const [dt] = useState({
    idBoleto:id,
    idUsuario
  });

  const { solicitudData } = usePostGeneral(dt, endpoints.boletos.getSolicitud, 'solicitudData');

  const [date, time] = fechaPartido.split(' ');

  // Convierte la cadena 'date' a un objeto Date
  const dateObj = new Date(`${date}T${time}`);

  const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
  const opcionesHora = { hour: 'numeric', minute: 'numeric', hour12: false };

  const fechaFormateada = dateObj.toLocaleDateString('es-ES', opciones);

  const horaFormateada = dateObj.toLocaleTimeString('es-ES', opcionesHora);

  const Lightbox = useBoolean();

  const addTicket = useBoolean();

  const editGame = useBoolean();

  const theme = useTheme();

  const confirm = useBoolean();

  const confirmBoletos = useBoolean();

  const active = useBoolean();

  const { enqueueSnackbar } = useSnackbar();

  const coverUrl = `${HOST}/documentos/archivo/${imagen}`;

  const coverUrlPreview = `${HOST}/documentos/archivo/${imagenPreview}`;

  const updateEstatus = useUpdate(endpoints.boletos.updateEstatusBoletos);

  const solicitudBoletos = useUpdate(endpoints.boletos.solicitudBoletos);

  const handleEstatus = async (i) => {

    const data = {
      id,
      estatus: i
    };

    try {

      if (data) {

        confirmBoletos.onFalse();
        active.onFalse();

        const update = await updateEstatus(data);

        if (update.result === true) {
          enqueueSnackbar(update.msg, { variant: 'success' });

          mutate(endpoints.boletos.getBoletos);

        } else {
          enqueueSnackbar(update.msg, { variant: 'error' });
        }

      } else {
        enqueueSnackbar(`¡Error en enviar los datos!`, { variant: 'danger' });
      }

    } catch (error) {
      enqueueSnackbar(`¡No se pudieron actualizar los datos!`, { variant: 'danger' });
    }
  }

  const handleBoletos = async () => {

    const data = {
      id,
      idUsuario
    };

    try {

      if (data) {

        confirm.onFalse();
        active.onFalse();

        const update = await solicitudBoletos(data);

        if (update.result === true) {
          enqueueSnackbar(update.msg, { variant: 'success' });

          mutate(endpoints.boletos.getSolicitud);

        } else {
          enqueueSnackbar(update.msg, { variant: 'error' });
        }

      } else {
        enqueueSnackbar(`¡Error en enviar los datos!`, { variant: 'danger' });
      }

    } catch (error) {
      enqueueSnackbar(`¡No se pudieron actualizar los datos!`, { variant: 'danger' });
    }
  }

  return (
    <>
      <Paper
        sx={{
          borderRadius: 2,
          position: 'relative',
          bgcolor: 'background.neutral',
          p: 1,
          transition: 'background-color 0.5s ease',
          '&:hover': {
            bgcolor: '#F0ECE0',
          }
        }}
      >

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            position: 'relative',
            '@media (max-width: 600px)': {
              flexDirection: 'column',
              alignItems: 'flex-start',
            },
          }}
        >
          <Typography
            variant='body1'
            sx={{
              p: 1,
              fontWeight: 'bold',
              flexGrow: 1,
              textAlign: 'center',
              '@media (max-width: 600px)': {
                textAlign: 'left',
                width: '100%',
              },
            }}
          >
            {titulo}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              position: 'relative',
              margin: '10px',
              '@media (max-width: 600px)': {
                marginTop: '-35px',
                alignSelf: 'flex-end',
              },
            }}
          >
            {idRol === 4 ? (
              <>
                <Tooltip title={estatus === 1 ? "Inhabilitar" : "Habilitar"} placement="top">
                  <IconButton variant="contained" sx={{ backgroundColor: '#484744' }} onClick={() => {
                    confirm.onTrue();
                  }}>
                    <Iconify width={16} icon={estatus === 1 ? "mdi:eye-outline" : "iconamoon:eye-off"} sx={{ color: 'white' }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Editar" placement="top">
                  <IconButton variant="contained" sx={{ backgroundColor: '#484744' }} onClick={editGame.onTrue}>
                    <Iconify width={16} icon="fluent:edit-24-filled" sx={{ color: 'white' }} />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              null
            )}
          </Box>
        </Box>

        <Box sx={{
          p: 1, position: 'relative', backgroundColor: theme.palette.mode === 'dark' ? '#25303d' : '#F5F5F5', borderRadius: 2, margin: '8px',
          transition: 'background-color 0.5s ease',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.3)',
          }
        }} >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ color: 'text.secondary', typography: 'caption', width: '100%', p: 0.2 }}
          >
            <Stack direction="row" alignItems="center">
              <Iconify width={16} icon="lets-icons:calendar-fill" sx={{ mr: 0.5, flexShrink: 0 }} />
              Fecha: {fechaFormateada}
            </Stack>

            {limiteBoletos > 0 && solicitudData.length < 1 ? (
              <Button className='btn-ticket border-animated-ticket' 
              onClick={() => {confirmBoletos.onTrue();}} 
              variant="contained" sx={{ height: { xs: '40px', lg: '20px' } }}>
                ¡Quiero boletos!
              </Button>
            ) : (
              null
            )}
          </Stack>

          <Stack
            rowGap={1.5}
            columnGap={3}
            flexWrap="wrap"
            direction="row"
            alignItems="center"
            sx={{ color: 'text.secondary', typography: 'caption', p: 0.2 }}
          >
            <Stack direction="row" alignItems="center">
              <Iconify width={16} icon="lets-icons:clock-fill" sx={{ mr: 0.5, flexShrink: 0 }} />
              Hora: {horaFormateada}
            </Stack>
          </Stack>
          <Stack
            rowGap={1.5}
            columnGap={3}
            flexWrap="wrap"
            direction="row"
            alignItems="center"
            sx={{ color: 'text.secondary', typography: 'caption', p: 0.2 }}
          >
            <Stack direction="row" alignItems="center">
              <Iconify width={16} icon="ic:round-stadium" sx={{ mr: 0.5, flexShrink: 0 }} />
              Lugar: {lugarPartido}
            </Stack>
          </Stack>
          {/* <Stack
            rowGap={1.5}
            columnGap={3}
            flexWrap="wrap"
            direction="row"
            alignItems="center"
            sx={{ color: 'text.secondary', typography: 'caption', p: 0.2 }}
          >
            <Stack direction="row" alignItems="center">
              <Iconify width={16} icon="tabler:point-filled" sx={{ mr: 0.5, flexShrink: 0 }} />
              {descripcion}
            </Stack>
          </Stack> */}
        </Box>

        <Box sx={{ p: 1, position: 'relative' }}>
          <Image alt={coverUrlPreview} src={coverUrlPreview} ratio="1/1" sx={{ borderRadius: 2, height: '250px', }} onClick={Lightbox.onTrue} />
        </Box>
      </Paper>

      <Dialog open={Lightbox.value}
        onClose={Lightbox.onFalse}>
        <Image alt={coverUrl} src={coverUrl} sx={{ borderRadius: 2, width: '100%', height: '600px' }} />
      </Dialog>

      <Dialog
        open={addTicket.value}
        backdrop="static"
        fullWidth
        disableEnforceFocus
        maxWidth="md"
      >
        <AddTicket
          onClose={addTicket.onFalse}
        />
      </Dialog>

      <Dialog
        open={editGame.value}
        backdrop="static"
        fullWidth
        disableEnforceFocus
        maxWidth="md"
      >
        {/* <EditGame
          onClose={editGame.onFalse}
      /> */}
        <NewGame
          onClose={editGame.onFalse}
          item={item}
        />
      </Dialog>

      <ConfirmDialog
        open={confirmBoletos.value}
        onClose={confirmBoletos.onFalse}
        title="Solicitud de boletos"
        content={`¿Estás seguro de solicitar boletos para el partido ${titulo}?`}
        action={
          <>
            <Button variant="contained" color="error" onClick={() => { confirmBoletos.onFalse() }}>
              Cancelar
            </Button>
            <Button variant="contained" color="success" onClick={() => {
              handleBoletos();
              confirmBoletos.onFalse();
            }}>
              Aceptar
            </Button>
          </>
        }
      />

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={estatus === 1 ? "Inhabilitar" : "Habilitar"}
        content={estatus === 1 ? "¿Estás seguro de inhabilitar la publicación de el partido?" :
          "¿Estás seguro de habilitar la publicación de el partido?"
        }
        action={
          <>
            <Button variant="contained" color="error" onClick={() => { confirm.onFalse() }}>
              Cancelar
            </Button>
            <Button variant="contained" color="success" onClick={() => {
              handleEstatus(estatus === 1 ? 0 : 1);
              confirm.onFalse();
            }}>
              Aceptar
            </Button>
          </>
        }
      />

    </>
  );
}

BookingItem.propTypes = {
  item: PropTypes.object,
  idRol: PropTypes.number,
};
