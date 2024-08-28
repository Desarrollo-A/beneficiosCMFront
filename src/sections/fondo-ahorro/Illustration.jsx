import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import { alpha, useTheme } from '@mui/material/styles';

import { endpoints } from 'src/utils/axios';

import { useGetGeneral } from 'src/api/general';

import Image from 'src/components/image';
import { MotionContainer } from 'src/components/animate';
import Carousel, { useCarousel, CarouselDots } from 'src/components/carousel';

// ----------------------------------------------------------------------

export default function Illustration({ list, ...other }) {

  const { carruselData } = useGetGeneral(endpoints.dashboard.getCarrusel, "carruselData");

  const carousel = useCarousel({
    speed: 1500,
    autoplay: true,
    ...CarouselDots({
      sx: {
        top: '90%',
        left: '50%',
        position: 'absolute',
        color: 'primary.light',
      },
    }),
  });

  return (
    <Card {...other}>
      {!isEmpty(carruselData) ? (
          <Carousel ref={carousel.carouselRef} {...carousel.carouselSettings}>
            {carruselData.map((app, index) => (
              <CarouselItem key={index} item={app} active={index === carousel.currentIndex} />
            ))}
          </Carousel>
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

Illustration.propTypes = {
  list: PropTypes.array,
};

// ----------------------------------------------------------------------

function CarouselItem({ item, active }) {
  const theme = useTheme();

  const { imagen } = item;

  const renderImg = (
    <Image
      src={`${import.meta.env.BASE_URL}assets/images/carrusel/${imagen}.jpg`}
      overlay={`linear-gradient(to bottom, ${alpha(theme.palette.grey[900], 0)} 0%, ${theme.palette.grey[900]
        } 150%)`}
      sx={{
        width: 1,
        height: {
          xs: 440,
          xl: 500,
        },
      }}
    />
  );

  return (
    <MotionContainer action animate={active} sx={{ position: 'relative' }} className="fade-in">
      {renderImg}
    </MotionContainer>
  )
}

CarouselItem.propTypes = {
  active: PropTypes.bool,
  item: PropTypes.object,
};
