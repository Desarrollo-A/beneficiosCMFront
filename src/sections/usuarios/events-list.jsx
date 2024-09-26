import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/system/Stack';
import LoadingButton from '@mui/lab/LoadingButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Grid, useTheme, TextField, Typography, Pagination, InputAdornment } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useAuthContext } from 'src/auth/hooks';
import { useGetEventos } from 'src/api/perfil/eventos';

import Iconify from 'src/components/iconify';

import EventItem from './event-item';
import NewEventDialog from './new-event-dialog';
// import WidgetConteo from '../overview/dash/widget-conteo';

// ----------------------------------------------------------------------

export default function EventsList({ ...other }) {
  // const theme = useTheme();
  // const color = 'primary';

  const { user } = useAuthContext();
  const { data: events, mutate: eventsMutate } = useGetEventos(
    user?.idContrato,
    user?.idSede,
    user?.idDepto
  );
  // const cantidadTarjetasCarga = [0, 1, 2];
  const isMobile = useMediaQuery('(max-width: 960px)');

  const [eventos, setEventos] = useState([]);
  const [found, setFound] = useState(true);
  const [page, setPage] = useState(1);
  const [filteredData, setFiltered] = useState([]);
  const [currentItems, setCurrentItems] = useState([]);
  const itemsPerPage = 6;

  const theme = useTheme();

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const eventDialog = useBoolean();

  const handleNewEvent = () => {
    eventDialog.onTrue();
  };

  useEffect(() => {
    setEventos(events);
    setFiltered(events);
  }, [events]);

  const handleSearchChange = (event) => {
    setPage(1);

    setFiltered(
      events.filter((item) => item.titulo.toLowerCase().includes(event.target.value.toLowerCase()))
    );

    if (filteredData.length) {
      setFound(true);
    } else {
      setFound(false);
    }

    if (event.target.value.length === 0) {
      setEventos(events);
    } else {
      setEventos(filteredData);
    }
  };

  useEffect(() => {
    setCurrentItems(filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage));
  }, [filteredData, page]);

  return (
    <>
      <Stack>
        <Grid
          container
          sx={{
            margin: '0' /* No es necesario 0px */,
            alignItems: 'flex-end' /* Alinea al lado izquierdo */,
            paddingBottom: '10px',
          }}
          direction={isMobile ? 'column' : 'row'}
        >
          <Grid item xs={10} sx={{ p: 1, width: isMobile ? '100%' : '' }}>
            <TextField
              fullWidth
              label="Buscar evento"
              variant="outlined"
              size="small"
              onChange={handleSearchChange}
              InputLabelProps={{
                style: { color: theme.palette.mode === 'dark' ? '#ffffff' : '' },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Iconify
                      icon="icon-park-outline:search"
                      sx={{ ml: 1, color: theme.palette.mode === 'dark' ? '#ffffff' : 'text.disabled' }}
                    />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={2} sx={{ p: 1 }}>
            <LoadingButton
              variant="outlined"
              color="inherit"
              onClick={() => handleNewEvent()}
              // loading={1 = "as"}
              
            >
              Añadir evento <Iconify icon="f7:plus-square-on-square" ml={1} />
            </LoadingButton>
          </Grid>
        </Grid>
        <Box
          gap={3}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          }}
        >
          {eventos.length ? (
            currentItems.map((event) =>
              user.permisos !== 6 && event.estatusEvento === 2 ? (
                ''
              ) : (
                <EventItem key={event.idEvento} event={event} mutate={eventsMutate} />
              )
            )
          ) : (
            <>
              {found ? (
                <>
                  <Grid item xs={12} sm={6} md={3}>
                    <Grid
                      sx={{
                        backgroundColor: '#ECECEC',
                        animation: 'pulse 1.5s infinite',
                        borderRadius: 1,
                      }}
                    >
                      ‎
                    </Grid>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Stack
                      sx={{
                        backgroundColor: '#ECECEC',
                        animation: 'pulse 1.5s infinite',
                        borderRadius: 1,
                      }}
                    >
                      ‎
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Stack
                      sx={{
                        backgroundColor: '#ECECEC',
                        animation: 'pulse 1.5s infinite',
                        borderRadius: 1,
                      }}
                    >
                      ‎
                    </Stack>
                  </Grid>
                </>
              ) : (
                <Stack>
                  <Grid>
                    <Typography variant="h5">Sin eventos disponibles</Typography>
                  </Grid>
                </Stack>
              )}
            </>
          )}
        </Box>
      </Stack>
      {found ?
        (<Stack sx={{ mt: 4, alignItems: 'center' }}>
          <Pagination
            count={Math.ceil(filteredData.length / itemsPerPage)}
            page={page}
            onChange={handlePageChange}
          />
        </Stack>) : 
        ('')
      }
      
      {eventDialog && (
        <NewEventDialog
          open={eventDialog.value}
          onClose={eventDialog.onFalse}
          mutate={eventsMutate}
        />
      )}
    </>
  );
}
