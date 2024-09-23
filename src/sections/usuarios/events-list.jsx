import { useState } from 'react';
import styled from '@emotion/styled';

import Box from '@mui/material/Box';
import Stack from '@mui/system/Stack';
import LoadingButton from '@mui/lab/LoadingButton';
import { Grid, InputAdornment, Paper, TextField } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useAuthContext } from 'src/auth/hooks';
import { useGetEventos } from 'src/api/perfil/eventos';

import Iconify from 'src/components/iconify';

import EventItem from './event-item';
import NewEventDialog from './new-event-dialog';

// ----------------------------------------------------------------------

export default function EventsList() {
  const { user } = useAuthContext();
  const { data: events, mutate: eventsMutate } = useGetEventos(
    user?.idContrato,
    user?.idSede,
    user?.idDepto
  );
  const [searchTerm, setSearchTerm] = useState('');

  const eventDialog = useBoolean();

  const handleNewEvent = () => {
    eventDialog.onTrue();
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

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
        >
          <Grid item xs={10} sx={{ p:1 }}>
            <TextField
              fullWidth
              label="Buscar partido"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Iconify
                      icon="icon-park-outline:search"
                      sx={{ ml: 1, color: 'text.disabled' }}
                    />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={2} sx={{ p:1 }}>
            <LoadingButton
              variant="outlined"
              color="inherit"
              onClick={() => handleNewEvent()}
              // loading={1 = "as"}
              sx={{
                width: 'auto',
                backgroundColor: '#FFF',
                border: 1,
              }}
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
          {events.map((event) => (
            <EventItem key={event.idEvento} event={event} mutate={eventsMutate} />
          ))}
        </Box>
      </Stack>
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
