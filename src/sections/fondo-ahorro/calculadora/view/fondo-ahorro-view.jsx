import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';

import { useSettingsContext } from 'src/components/settings';

import '../../style.css';
import Simulator from '../simulator';
import Illustration from '../Illustration';


// ----------------------------------------------------------------------

const SPACING = 3;

export default function FondoAhorroView() {

  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      

      <Grid container spacing={SPACING} disableEqualOverflow>
          <Grid item xs={12} md={7}>
            <Illustration />
          </Grid>

        <Grid item xs={12} md={5}>
          <Simulator conditional={0}/>
        </Grid> 

      </Grid>
    </Container>
  );
}
