import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { alpha, styled, useTheme } from '@mui/material/styles';
import { Card, Grid, Stack, Avatar, Divider, CardMedia, Typography } from '@mui/material';

import { bgGradient } from 'src/theme/css';

// import { useSettingsContext } from 'src/components/settings';
import ListaPreguntas from './components/lista-preguntas';

export default function AsesorView() {
  // const settings = useSettingsContext();
  const isMobile = useMediaQuery('(max-width: 960px)');

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    ...theme.applyStyles('dark', {
      backgroundColor: '#1A2027',
    }),
  }));

  const theme = useTheme();

  const heightCard = 350;
  const heightGrid = heightCard + 20;

  return (
    <Card>
      <CardMedia style={{ backgroundColor: theme.palette.mode === 'dark' ? '#1a2027' : '' }}>
        <Box>
          <Grid container direction={isMobile ? 'column' : 'row'}>
            <Grid
              item
              xs={8}
              sx={{
                scrollbarWidth: 'thin' /* Width of the scrollbar */,
                height: heightGrid,
                overflowY: 'auto',
                display: 'flex',
                flexGrow: 1,
                flexDirection: 'column',
                maxHeight: heightGrid,
              }}
            >
              <Item
                sx={{
                  color: theme.palette.mode === 'light' ? 'common.dark' : 'common.white',
                }}
              >
                <Typography variant="h6">Preguntas frecuentes</Typography>
              </Item>
              <Item
                sx={{
                  ...bgGradient({
                    color: alpha(theme.palette.primary.darker, 0.5),
                  }),
                  color: theme.palette.mode === 'light' ? 'common.dark' : 'common.white',
                }}
              >
                <ListaPreguntas />
              </Item>
            </Grid>
            <Grid item xs={0.2} sx={{ height: heightGrid }}>
              <Item
                sx={{
                  ...bgGradient({
                    color: alpha(theme.palette.primary.darker, 0.5),
                  }),
                  height: 1,
                  color: 'common.white',
                }}
              >
                <Divider orientation="vertical" />
              </Item>
            </Grid>
            <Grid
              item
              xs={3.8}
              sx={{
                ...bgGradient({
                  color: alpha(theme.palette.primary.darker, 0.5),
                  imgUrl: `${import.meta.env.BASE_URL}assets/images/perfil/cover.jpg`,
                }),
                height: heightGrid,
                color: 'common.white',
                display: 'flex',
                alignItems: 'center',
                padding: 2,
              }}
              container
              spacing={0}
              // direction={!isMobile ? 'column' : ''}
              alignItems={!isMobile ? 'center' : ''}
              justifyContent={!isMobile ? 'center' : ''}
            >
              <Stack direction={isMobile ? 'row' : 'column'}>
                <Avatar
                  src={`${import.meta.env.BASE_URL}assets/images/perfil/user.png`}
                  sx={{
                    mx: 'auto',
                    width: { xs: 64, md: 128 },
                    height: { xs: 64, md: 128 },
                    border: `solid 2px ${theme.palette.common.white}`,
                    mb: 2,
                    mr: 2,
                  }}
                />

                <Card sx={{ padding: 2, backgroundColor: 'rgba(52, 52, 52, 0.8)' }}>
                  <Typography>nombre ejecutivo</Typography>
                  <Typography>dato extra</Typography>
                  {/* numero whatsapp: https://api.whatsapp.com/send?phone=1234567890 */}
                </Card>
              </Stack>

              {/* <Button
                href="https://api.whatsapp.com/send?phone=1234567890"
                target="_blank"
                rel="noreferrer"
              >
                <Iconify icon="logos:whatsapp-icon" style={{ fontSize: '40px' }}/>
              </Button> */}
            </Grid>
          </Grid>
        </Box>
      </CardMedia>
    </Card>
  );
}
