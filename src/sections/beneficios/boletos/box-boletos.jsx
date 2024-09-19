import { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import Pagination from '@mui/material/Pagination';
import { Button, TextField, Typography, IconButton, InputAdornment, Dialog, DialogContent } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';

import './styles.css'
import EditGame from './edit-game';
import AddTicket from './add-ticket';
// ----------------------------------------------------------------------

export default function BoxBoletos({ subheader, list, sx, ...other }) {

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 6;

  // Filtrar la lista por el título basado en el término de búsqueda
  const filteredList = list.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            <BookingItem item={item} />
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
};

// ----------------------------------------------------------------------

function BookingItem({ item }) {
  const { avatarUrl, name, duration, bookedAt, guests, coverUrl, price, isHot } = item;

  const Lightbox = useBoolean();

  const addTicket = useBoolean();

  const editGame = useBoolean();

  const theme = useTheme();

  const confirm = useBoolean();

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
            QUERÉTARO vs TOLUCA
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
            <Tooltip title="Ocultar" placement="top">
              <IconButton variant="contained" sx={{ backgroundColor: '#484744' }} onClick={() => {confirm.onTrue();
            }}>
                <Iconify width={16} icon="iconamoon:eye-off" sx={{ color: 'white' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar" placement="top">
              <IconButton variant="contained" sx={{ backgroundColor: '#484744' }} onClick={editGame.onTrue}>
                <Iconify width={16} icon="fluent:edit-24-filled" sx={{ color: 'white' }} />
              </IconButton>
            </Tooltip>
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
              05 de septiembre del 2024
            </Stack>

            <Button className='btn-ticket border-animated-ticket' onClick={addTicket.onTrue} variant="contained" sx={{ height: { xs: '40px', lg: '20px' } }}>
              ¡Quiero boletos!
            </Button>
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
              4:00pm
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
              Estadio corregidora
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ p: 1, position: 'relative' }}>
          <Image alt={coverUrl} src={coverUrl} ratio="1/1" sx={{ borderRadius: 2, height: '200px' }} onClick={Lightbox.onTrue} />
        </Box>
      </Paper>

      <Dialog open={Lightbox.value}
        onClose={Lightbox.onFalse}>
        <Image alt={coverUrl} src={coverUrl} sx={{ borderRadius: 2, width: '100%' }} />
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
      <EditGame
          onClose={editGame.onFalse}
      />
      </Dialog>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Inhabilitar"
        content="¿Estás seguro de inhabilitar la publicación de el partido?"
        action={
          <>
            <Button variant="contained" color="error" onClick={() => {confirm.onFalse()}}>
              Cancelar
            </Button>
            <Button variant="contained" color="success" /* onClick={() => {
              handleEstatus(row);
              confirm.onFalse();
            }} */>
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
};
