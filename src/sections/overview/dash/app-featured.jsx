import { isEmpty } from 'lodash';
import { m } from 'framer-motion';
import PropTypes from 'prop-types';

import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { endpoints } from 'src/utils/axios';

import { useGetGeneral } from 'src/api/general';

import Image from 'src/components/image';
import { varFade, MotionContainer } from 'src/components/animate';
import Carousel, { useCarousel, CarouselDots, CarouselArrows } from 'src/components/carousel';

import './view/style.css';

// ----------------------------------------------------------------------

export default function AppFeatured({ list, ...other }) {

  const { carruselData } = useGetGeneral(endpoints.dashboard.getCarrusel, "carruselData");

  const carousel = useCarousel({
    speed: 1500,
    autoplay: true,
    ...CarouselDots({
      sx: {
        top: 16,
        left: 16,
        position: 'absolute',
        color: 'primary.light',
      },
    }),
  });

  return (
    <Card {...other}>
      {!isEmpty(carruselData) ? (
        <>
          <Carousel ref={carousel.carouselRef} {...carousel.carouselSettings}>
            {carruselData.map((app, index) => (
              <CarouselItem key={index} item={app} active={index === carousel.currentIndex} />
            ))}
          </Carousel>

          <CarouselArrows
            onNext={carousel.onNext}
            onPrev={carousel.onPrev}
            sx={{ top: 8, right: 8, position: 'absolute', color: 'common.white' }}
          />
        </>
      ) : (
        <Grid container spacing={1} sx={{
          p: 5, backgroundColor: "#ECECEC", animation: 'pulse 1.5s infinite', height: {
            xs: 280,
            xl: 320,
          }
        }} justifyContent="center" alignItems="center">
          <Card />
        </Grid>
      )}
    </Card>
  );
}

AppFeatured.propTypes = {
  list: PropTypes.array,
};

// ----------------------------------------------------------------------

function CarouselItem({ item, active }) {
  const theme = useTheme();

  const { imagen, titulo, descripcion } = item;

  const renderImg = (
    <Image
      alt={titulo}
      src={`${import.meta.env.BASE_URL}assets/images/carrusel/${imagen}.jpg`}
      overlay={`linear-gradient(to bottom, ${alpha(theme.palette.grey[900], 0)} 0%, ${theme.palette.grey[900]
        } 150%)`}
      sx={{
        width: 1,
        height: {
          xs: 280,
          xl: 320,
        },
      }}
    />
  );

  return (
    <MotionContainer action animate={active} sx={{ position: 'relative' }} className="fade-in">
      <Stack
        spacing={1}
        sx={{
          p: 3,
          width: 1,
          bottom: 0,
          zIndex: 9,
          textAlign: 'left',
          position: 'absolute',
          color: 'common.white',
        }}
      >
        <m.div variants={varFade().inRight}>
          <Typography variant="overline" sx={{ color: 'primary.light' }}>
            Novedades
          </Typography>
        </m.div>

        <m.div variants={varFade().inRight}>
          <Link color="inherit" underline="none">
            <Typography variant="h5" noWrap>
              {titulo}
            </Typography>
          </Link>
        </m.div>

        <m.div variants={varFade().inRight}>
          <Typography variant="body2" noWrap>
            {descripcion}
          </Typography>
        </m.div>
      </Stack>

      {renderImg}
    </MotionContainer>
  )
}

CarouselItem.propTypes = {
  active: PropTypes.bool,
  item: PropTypes.object,
};
