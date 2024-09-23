import Box from '@mui/material/Box';
import { Button, Dialog } from '@mui/material';
import { alpha } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useBoolean } from 'src/hooks/use-boolean';

import { _bookingNew } from 'src/_mock';
import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';

import NewGame from '../new-game';
import BoxBoletos from '../box-boletos';
import Patrocinadores from '../patrocinadores';

import {
  // crearDocumentoLegalario,
  getDocumentos,
  loginLegalario,
  tokenLegalario,
} from 'src/api/fondoAhorro/legalario';

// ----------------------------------------------------------------------
const SPACING = 3;

export default function BoletosView() {
  const settings = useSettingsContext();
  const { user: datosUser } = useAuthContext();

  const newGame = useBoolean();

  const handleLegalario = async () => {
    const test = await loginLegalario('coordinador1.desarrollo@ciudadmaderas.com', 'pipBoy30');
    console.log('TEST', test);
    if (test.success) {
      const test2 = await tokenLegalario(test.data);
      console.log('TEST2', test2);

      const test3 = await getDocumentos(test2.data.access_token);
      console.log('ABC', test3);
    } else {
      console.log('ERROR');
    }
  };

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Grid container spacing={SPACING} disableEqualOverflow>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              {/* <Button variant="outlined" onClick={(newGame.onTrue)}> */}
              <Button
                variant="outlined"
                onClick={() => {
                  console.log('btn');
                  handleLegalario();
                }}
              >
                Añadir partido <Iconify ml={1} width={16} icon="material-symbols:library-add" />
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Patrocinadores title="Newest Booking" subheader="12 Booking" list={_bookingNew} />
          </Grid>

          <Grid item xs={12}>
            <BoxBoletos title="Newest Booking" subheader="12 Booking" list={_bookingNew} />
          </Grid>
        </Grid>
      </Container>

      <Dialog open={newGame.value} backdrop="static" fullWidth disableEnforceFocus maxWidth="md">
        <NewGame onClose={newGame.onFalse} />
      </Dialog>
    </>
  );
}
