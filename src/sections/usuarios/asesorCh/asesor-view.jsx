import { useState, useEffect, forwardRef } from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { alpha, styled, useTheme } from '@mui/material/styles';
import {
  Fab,
  Grid,
  Slide,
  Avatar,
  Dialog,
  Button,
  CardMedia,
  TextField,
  Typography,
  DialogContent,
  InputAdornment,
} from '@mui/material';

import { endpoints } from 'src/utils/axios';

import { bgGradient } from 'src/theme/css';
import { useGetGeneral } from 'src/api/general';

import Iconify from 'src/components/iconify';

import ListaPreguntas from './components/lista-preguntas';

const Transition = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export default function AsesorView() {
  // const settings = useSettingsContext();
  const isMobile = useMediaQuery('(max-width: 960px)');
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { faqsData } = useGetGeneral(endpoints.gestor.getFaqsCh, 'faqsData');
  const [faq, setFaq] = useState([]);
  const [found, setFound] = useState(true); // que importa

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

  const heightCard = 450;
  const heightGrid = heightCard + 20;

  useEffect(() => {
    setFaq(faqsData);
  }, [faqsData]);
  

  const modalEjecutivo = () => {
    if (open) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);

    const filterData = faqsData.filter((item) =>
      item.pregunta.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if(filterData.length){
      setFound(true)
    }
    else{
      setFound(false)
    }

    if (searchTerm === '') {
      setFaq(faqsData);
    } else {
      setFaq(filterData);
    }
  };

  return (
    <>
      <CardMedia
        style={{ backgroundColor: theme.palette.mode === 'dark' ? '#1a2027' : '' }}
        sx={{ mt: 5 }}
      >
        <Box>
          <Grid container direction={isMobile ? 'column' : 'row'}>
            <Grid item xs={7.5}>
              <Box
                sx={{
                  color: theme.palette.mode === 'light' ? 'common.dark' : 'common.white',
                  ml: 1,
                }}
              >
                <Box style={{ maxHeight: '100vh', overflow: 'auto' }}>
                  <Typography
                    variant="subtitle"
                    style={{
                      justifyContent: 'left',
                    }}
                  >
                    PREGUNTAS FRECUENTES
                  </Typography>
                </Box>
                <Box mb={2} />
                <TextField
                  fullWidth
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Buscar"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 1, mb: 2, height: 40 },
                  }}
                />
              </Box>

              <Item
                sx={{
                  ...bgGradient({
                    color: alpha(theme.palette.primary.darker, 0.5),
                  }),
                  color: theme.palette.mode === 'light' ? 'common.dark' : 'common.white',
                }}
              >
                <ListaPreguntas faqsData={faq} found={found} />
              </Item>
            </Grid>
            <Grid item xs={0.5} />
            {!isMobile ? (
              <Grid
                item
                xs={4}
                sx={{
                  ...bgGradient({
                    color: alpha(theme.palette.primary.darker, 0.5),
                  }),
                  backgroundColor: '#f0ece0',
                  height: heightGrid,
                  color: 'common.white',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 2,
                  boxShadow: '0.5em 0.5em 2em rgb(110 110 110 / 50%)',
                  p: 2,
                }}
                container
                spacing={0}
                alignItems={isMobile ? 'center' : ''}
                justifyContent={isMobile ? 'center' : ''}
              >
                <Avatar
                  variant="square"
                  src={`${import.meta.env.BASE_URL}assets/images/woman.png`}
                  sx={{
                    mx: 'auto',
                    width: { xs: 64, md: '100%' },
                    height: { xs: 64, md: heightGrid - 230 },
                    borderRadius: 2,
                    mt: -5,
                  }}
                />

                <Grid
                  sx={{
                    mt: -8,
                    padding: 1,
                    backgroundColor: '#f0ece0',
                    boxShadow: 0,
                    alignContent: 'center',
                    color: '#000000',
                  }}
                >
                  <Typography
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Iconify icon="ph:clock" sx={{ m: 1, color: '#f0ece0' }} />
                    MARIANA TORRES TORRES
                  </Typography>

                  <Typography
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      fontSize: 15,
                    }}
                  >
                    {!isMobile ? (
                      <Iconify icon="ph:clock" sx={{ color: 'text.disabled', m: 1 }} />
                    ) : (
                      ''
                    )}
                    Lunes a Viernes de 8:00 am a 6:00 pm
                  </Typography>

                  <Typography
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      fontSize: 15,
                    }}
                  >
                    {!isMobile ? (
                      <Iconify icon="cil:send" sx={{ color: 'text.disabled', m: 1 }} />
                    ) : (
                      ''
                    )}
                    tuejecutivoch@ciudadmaderas.com
                  </Typography>
                </Grid>
              </Grid>
            ) : (
              ''
            )}
          </Grid>
        </Box>
      </CardMedia>

      {isMobile ? (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', alignitems: 'center' }}>
          <Fab color="success" variant="extended" sx={{ height: 60 }} onClick={modalEjecutivo}>
            <Avatar
              src={`${import.meta.env.BASE_URL}assets/images/woman.png`}
              sx={{
                mx: 'auto',
                mt: 0.5,
                ml: 1,
              }}
            />
            <Typography sx={{ ml: 2 }}>Contacta a tu ejecutivo</Typography>
          </Fab>
        </Box>
      ) : (
        <Box sx={{ mt: -5, mr: -2, display: 'flex', justifyContent: 'right', alignItems: 'right' }}>
          <Fab
            color="success"
            variant="extended"
            href="https://api.whatsapp.com/send?phone=1234567890"
            target="_blank"
            rel="noreferrer"
            sx={{
              borderRadius: '18px',
              '&:hover': {
                // backgroundColor: '#1e7e34', // Cambia el color de fondo del Fab al hacer hover
                backgroundColor: '#22c55e',
                '& .whatsapp-icon': {
                  // backgroundColor: '#1e7e34'0
                  backgroundColor: '#22c55e', // Cambia el color del ícono de WhatsApp al hacer hover
                },
                '& .button:hover .button-slide': {
                  gridTemplateColumns: '1fr',
                },
              },
            }}
          >
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Item style={{ background: 'none', border: 'none', boxShadow: 'none' }}>
                  <Typography sx={{ ml: -1.5, color: 'white' }}>Contacta a tu ejecutivo</Typography>
                </Item>
              </Grid>
            </Grid>
            <Grid
              className="whatsapp-icon"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 60,
                backgroundColor: '#22c55e',
                borderRadius: '50%',
                mb: 1.5,
                mr: -3,
              }}
            >
              <Iconify icon="ic:baseline-whatsapp" ml={1.5} height={45} width={45} />
            </Grid>
          </Fab>
        </Box>
      )}

      <Dialog open={open} onClose={modalEjecutivo} TransitionComponent={Transition}>
        <DialogContent
          sx={{
            ...bgGradient({
              color: alpha(theme.palette.primary.darker, 0.5),
            }),
            backgroundColor: '#f0ece0',
            p: 3,
            overflowX: 'hidden',
          }}
        >
          <Grid container justifyContent="flex-end" sx={{ mt: -2, ml: 3.5, mb: -1 }}>
            <Button onClick={modalEjecutivo}>
              <Iconify icon="mingcute:close-fill" height={30} width={30} />
            </Button>
          </Grid>
          <Grid>
            <Item style={{ background: 'none', border: 'none', boxShadow: 'none' }}>
              <Avatar
                variant="square"
                src={`${import.meta.env.BASE_URL}assets/images/woman.png`}
                sx={{
                  mx: 'auto',
                  width: { xs: '100%', md: heightGrid - 150 },
                  height: { xs: heightGrid - 170, md: heightGrid - 170 },
                  borderRadius: 2,
                  mt: 0.5,
                }}
              />
            </Item>
            <Item style={{ background: 'none', border: 'none', boxShadow: 'none' }}>
              <Typography
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Iconify icon="ph:clock" sx={{ m: 1, color: '#f0ece0' }} />
                MARIANA TORRES TORRES
              </Typography>

              <Typography
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  fontSize: 15,
                }}
              >
                {isMobile ? <Iconify icon="ph:clock" sx={{ color: 'text.disabled', m: 1 }} /> : ''}
                Lunes a Viernes de 8:00 am a 6:00 pm
              </Typography>

              <Typography
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  fontSize: 15,
                }}
              >
                {isMobile ? <Iconify icon="cil:send" sx={{ color: 'text.disabled', m: 1 }} /> : ''}
                tuejecutivoch@ciudadmaderas.com
              </Typography>
            </Item>
            <Item style={{ background: 'none', border: 'none', boxShadow: 'none' }}>
              <Box sx={{ mt: 3 }}>
                <Fab
                  color="success"
                  variant="extended"
                  sx={{ height: 60 }}
                  href="https://api.whatsapp.com/send?phone=1234567890"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Iconify icon="ic:baseline-whatsapp" height={35} width={35} />
                  <Typography sx={{ ml: 1 }}>Contactar por whatsapp</Typography>
                </Fab>
              </Box>
            </Item>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
}

// #118d57
