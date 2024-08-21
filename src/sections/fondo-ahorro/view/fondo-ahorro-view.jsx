import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';

import { _bookingNew } from 'src/_mock';

import { useSettingsContext } from 'src/components/settings';

import BookingNewest from '../booking-newest';

// ----------------------------------------------------------------------

const SPACING = 3;

export default function FondoAhorroView() {

  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={SPACING} disableEqualOverflow>

        <Grid item xs={12}>
          <BookingNewest list={_bookingNew} />
        </Grid>

      </Grid>
    </Container>
  );
}
