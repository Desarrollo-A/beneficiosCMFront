import Box from '@mui/material/Box';
import { Button, Dialog, } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { _bookingNew } from 'src/_mock';
import { useGetGeneral } from 'src/api/general';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';

import NewGame from '../new-game';
import BoxBoletos from '../box-boletos';
import Patrocinadores from '../patrocinadores';

// ----------------------------------------------------------------------
const SPACING = 3;

export default function BoletosView() {
  const settings = useSettingsContext();

  const newGame = useBoolean();

  const { boletosData } = useGetGeneral(
    endpoints.boletos.getBoletos,
    'boletosData'
  );

  return (
    <>

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Grid container spacing={SPACING} disableEqualOverflow>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={newGame.onTrue}>
                Añadir partido <Iconify ml={1} width={16} icon="material-symbols:library-add" />
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Patrocinadores title="Newest Booking" subheader="12 Booking" list={_bookingNew} />
          </Grid>

          <Grid item xs={12}>
            <BoxBoletos title="Newest Booking" subheader="12 Booking" list={boletosData} />
          </Grid>
        </Grid>
      </Container>

      <Dialog
        open={newGame.value}
        backdrop="static"
        fullWidth
        disableEnforceFocus
        maxWidth="md"
      >
        <NewGame
          onClose={newGame.onFalse}
        />
      </Dialog>

    </>
  );
}
