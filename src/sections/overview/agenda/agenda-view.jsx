import { useState } from 'react';

import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { useSettingsContext } from 'src/components/settings';
import { Calendar } from 'src/components/calendar'

import { useAuthContext } from 'src/auth/hooks';
import { useGetHorariosPresenciales } from 'src/api/especialistas'

import AgendaDialog from './agenda-dialog';

// ----------------------------------------------------------------------

export default function AgendaView(){
  const settings = useSettingsContext();

  const { user } = useAuthContext();

  const { horarios, horariosGet } = useGetHorariosPresenciales({idEspecialista : user.idUsuario});

  const [openDialog, setOpenDialog] = useState(false);

  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [sede, setSede] = useState();
  const [id, setId] = useState();

  const addEvent = () => {
    setStart(new Date());
    setEnd(new Date());
    setOpenDialog(true);
  }

  const onSelectRange = (start, end) => {
    setStart(start);
    setEnd(end);
    setOpenDialog(true);
  }

  const onCloseDialog = () => {
    setOpenDialog(false);
    setSede(null);
    setId(null);
    horariosGet({idEspecialista : user.idUsuario});
  }

  const onClickEvent = (event) => {
    // console.log(event)

    setStart(event.start);
    setEnd(event.end);
    setSede(event.extendedProps.sede);
    setId(event.id);
    setOpenDialog(true);
  }

  return(
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Stack
          alignItems="center"
          justifyContent="space-between"
          sx={{
            mb: { xs: 3, md: 5 },
            flexDirection: { sm: 'row', md: 'col' },
          }}
        >
          <Typography variant="h4"> </Typography>
          <Button color="inherit" variant="outlined" onClick={addEvent}>
            Establecer horario presencial
          </Button>
        </Stack>
        <Card>
          <Calendar
            onSelectRange={onSelectRange}
            onClickEvent={onClickEvent}
            events={horarios}
          />
        </Card>
        <AgendaDialog
          open={openDialog}
          onClose={onCloseDialog}
          id={id}
          start={start}
          end={end}
          sede={sede}
        />
      </Container>
    </>
  )
}