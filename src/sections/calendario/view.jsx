import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';
import { Calendar } from 'src/components/calendar';
import { useSettingsContext } from 'src/components/settings';

import { useBoolean } from 'src/hooks/use-boolean';

import './style.css';

//---------------------------------------------------------

export default function CalendarioView() {
	const settings = useSettingsContext()
	const { user } = useAuthContext()

	const [animate, setAnimate] = useState(false)

	const dialog = useBoolean()

	const handleClick = useCallback(() => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    setAnimate(true);
    setTimeout(() => {
      setAnimate(false);
    }, 500); // Duración de la animación en milisegundos
  }, [])

  const addHorarioPresencial = () => {
    //setOpenPresencialDialog(true);
  }

  return(
		<>
			<Container maxWidth={settings.themeStretch ? false : 'xl'}>
				<Stack
	        direction="row"
	        alignItems="center"
	        spacing={2}
	        justifyContent="right"
	        sx={{
	          mb: { xs: 3, md: 5 },
	        }}
	      >
	      	<Typography variant="h4">Calendario</Typography>
	      	<Box sx={{ flex: 1 }}></Box>
          <Button
            className={`ButtonCita ${animate ? 'animate' : ''}`}
            onClick={dialog.onTrue}
            id="animateElement"
          >
            <span>{user.idRol === 3 ? 'Agendar cita como beneficiario' : 'Agendar nueva cita'}</span>
            <Iconify icon="carbon:add-filled" />
          </Button>
          {user.idRol === 3 &&
	          <Button color="inherit" variant="outlined" onClick={addHorarioPresencial}>
	            Establecer horario presencial
	          </Button>
        	}
	      </Stack>

	      <Calendar
	      	select={handleClick}
	      />
			</Container>
		</>
  )
}