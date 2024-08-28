import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { fDateTime } from 'src/utils/format-time';

import Label from 'src/components/label';
import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import Carousel, { useCarousel, CarouselDots, CarouselArrows } from 'src/components/carousel';

// ----------------------------------------------------------------------

export default function Information({ title, subheader, list, sx, ...other }) {
  const theme = useTheme();

  const carousel = useCarousel({
    speed: 1500,
    autoplay: true,
    slidesToShow: 4,
    responsive: [
      {
        breakpoint: theme.breakpoints.values.lg,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: theme.breakpoints.values.md,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: theme.breakpoints.values.sm,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  });

  return (
    <Box sx={{ py: 2, ...sx }} {...other}>
      <CardHeader
        title={
          <Typography
            variant="h4"
            component="h4"
            sx={{
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            <Box component="span" sx={{ color: '#B4A46C' }}>¿</Box>
            <Box component="span" sx={{ color: 'black' }}>Como funciona</Box>
            <Box component="span" sx={{ color: '#00307b' }}> Inversión Maderas</Box>
            <Box component="span" sx={{ color: '#B4A46C' }}>?</Box>
          </Typography>
        }
        action={<CarouselArrows onNext={carousel.onNext} onPrev={carousel.onPrev} />}
        sx={{
          p: 0,
          mb: 3,
          textAlign: 'center',
        }}
      />

      <Carousel
        ref={carousel.carouselRef}
        {...carousel.carouselSettings}
        sx={{ display: 'flex', justifyContent: 'center' }} // Centra el carrusel
      >
        {list.map((item) => (
          <Box
            key={item.id}
            sx={{
              display: 'flex',
              justifyContent: 'center', // Centra horizontalmente
              alignItems: 'center', // Centra verticalmente
              width: '100%', // Ocupa el ancho completo del contenedor
            }}
          >
            <BookingItem item={item} />
          </Box>
        ))}
      </Carousel>
    </Box>
  );
}

Information.propTypes = {
  list: PropTypes.array,
  subheader: PropTypes.string,
  sx: PropTypes.object,
  title: PropTypes.string,
};

// ----------------------------------------------------------------------

function BookingItem({ item }) {
  const { nombre } = item;

  return (
    <Paper
      sx={{
        borderRadius: 2,
        position: 'relative',
        bgcolor: 'background.neutral',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: 300,
        height: 150,
        mx: 'auto',
        py: 2,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: '50%',
          bgcolor: '#efefef',
          zIndex: 1,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          width: '100%',
          maxWidth: 300,
          mx: 'auto',
          height: '50%', // Ajusta la altura relativa a Paper
          display: 'flex',
          alignItems: 'center', 
          justifyContent: 'center', 
        }}
      >
        <Iconify icon="solar:verified-check-bold" width={32} sx={{ color: 'primary.main' }} />
      </Box>
      <Stack
        spacing={2}
        sx={{
          px: 2,
          pb: 1,
          pt: 2.5,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          zIndex: 2,
        }}
      >
        <Box mb={3}/>
        <Typography
          variant="subtitle1"
          sx={{
            mb: 1,
            mt: 2,
            whiteSpace: 'normal',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordWrap: 'break-word',
            maxWidth: '100%',
          }}
        >
          {nombre}
        </Typography>
      </Stack>
    </Paper>

  );
}

BookingItem.propTypes = {
  item: PropTypes.object,
};
