import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { endpoints } from 'src/utils/axios';

import { useGetGeneral } from 'src/api/general';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import Simulator from '../simulator';
import Information from '../information';
import Illustration from '../Illustration';

// ----------------------------------------------------------------------

const SPACING = 3;

export default function FondoAhorroView() {

  const settings = useSettingsContext();

  const { infoData } = useGetGeneral(endpoints.fondoAhorro.getInformacion, "infoData");

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      

      <Grid container spacing={SPACING} disableEqualOverflow>
          <Grid item xs={12} md={7}>
            <Illustration />
          </Grid>

          {/*
        <Grid item xs={12}>
          <Information list={infoData} />
        </Grid>
        */}

        <Grid item xs={12} md={5}>
          <Simulator conditional={0}/>
        </Grid> 

        {/* <Grid item xs={12} md={12}>
        <Box component="ul" sx={{ paddingLeft: 2 }}>
                    <Box
                        component="li"
                        sx={{
                            listStyleType: 'disc',
                            marginLeft: 2, // Espacio antes del texto
                            display: 'list-item',
                            '&::marker': {
                                fontSize: '1rem', // Tamaño del punto
                            },
                        }}
                    >
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            El ahorro que solicitas será de forma mensual y se te descontará proporcionalmente a la semana.
                        </Typography>
                        <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                            Ejemplo : Solicitas de $400.00 al mes, se te descontarán $100.00 a la semana (Aprox.).
                        </Typography>
                    </Box>
                    <Box
                        component="li"
                        sx={{
                            listStyleType: 'disc',
                            marginLeft: 2, // Espacio antes del texto
                            display: 'list-item',
                            '&::marker': {
                                fontSize: '1rem', // Tamaño del punto
                            },
                        }}
                    >
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            El ahorro se puede cancelar en cualquier momento.
                        </Typography>
                    </Box>
                    <Box
                        component="li"
                        sx={{
                            listStyleType: 'disc',
                            marginLeft: 2, // Espacio antes del texto
                            display: 'list-item',
                            '&::marker': {
                                fontSize: '1rem', // Tamaño del punto
                            },
                        }}
                    >
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            La solicitud se procesará para tu firma digital, solo puedes generar tu firma una vez.
                        </Typography>
                    </Box>
                </Box>
        </Grid>  */}

      </Grid>
    </Container>
  );
}
