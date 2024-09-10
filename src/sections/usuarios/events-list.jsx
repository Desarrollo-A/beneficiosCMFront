import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/system/Stack';
import LoadingButton from '@mui/lab/LoadingButton';

import { useBoolean } from 'src/hooks/use-boolean';
// import { useResponsive } from 'src/hooks/use-responsive';

// import { bgGradient } from 'src/theme/css';
import { useAuthContext } from 'src/auth/hooks';
import { useGetEventos } from 'src/api/perfil/eventos';

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

  const eventDialog = useBoolean();
  const [password, setPassword] = useState('');

  const handleNewEvent = () => {
    eventDialog.onTrue();
  };

  return (
    <>
      <Stack>
        <Stack
          sx={{
            margin: '0' /* No es necesario 0px */,
            alignItems: 'flex-end' /* Alinea al lado izquierdo */,
            paddingBottom: '10px',
          }}
        >
          <LoadingButton
            variant="contained"
            color="inherit"
            onClick={() => handleNewEvent()}
            // loading={1 = "as"}
            sx={{ width: 'auto' }}
          >
            Nuevo evento
          </LoadingButton>
        </Stack>
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
            <EventItem
              key={event.idEvento}
              event={event}
              //   onView={() => handleView(tour.id)}
              //   onEdit={() => handleEdit(tour.id)}
              //   onDelete={() => handleDelete(tour.id)}
            />
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
