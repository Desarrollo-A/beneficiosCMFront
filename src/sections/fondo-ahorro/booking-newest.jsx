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
import Carousel, { useCarousel, CarouselArrows } from 'src/components/carousel';

// ----------------------------------------------------------------------

export default function BookingNewest({ title, subheader, list, sx, ...other }) {
  const theme = useTheme();

  const carousel = useCarousel({
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
        title={title}
        subheader={subheader}
        action={<CarouselArrows onNext={carousel.onNext} onPrev={carousel.onPrev} />}
        sx={{
          p: 0,
          mb: 3,
        }}
      />

      <Carousel ref={carousel.carouselRef} {...carousel.carouselSettings}>
        {list.map((item) => (
          <BookingItem key={item.id} item={item} />
        ))}
      </Carousel>
    </Box>
  );
}

BookingNewest.propTypes = {
  list: PropTypes.array,
  subheader: PropTypes.string,
  sx: PropTypes.object,
  title: PropTypes.string,
};

// ----------------------------------------------------------------------

function BookingItem({ item }) {
  const { avatarUrl, name, duration, bookedAt, guests, coverUrl, price, isHot } = item;

  return (
    <Paper
      sx={{
        mr: 3,
        borderRadius: 2,
        position: 'relative',
        bgcolor: 'background.neutral',
      }}
    >
      <Stack
        spacing={2}
        sx={{
          px: 2,
          pb: 1,
          pt: 2.5,
          position: 'relative',
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
          }}
        />

        <Box key={item.title} sx={{ textAlign: 'center', px: 5, position: 'relative', zIndex: 2 }}>
          <Iconify icon="solar:verified-check-bold" width={32} sx={{ color: 'primary.main' }} />

          <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }}>
            12 meses de periodo de inversión
          </Typography>
        </Box>
      </Stack>
    </Paper>

  );
}

BookingItem.propTypes = {
  item: PropTypes.object,
};
