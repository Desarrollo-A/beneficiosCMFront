import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';

/* import { endpoints } from 'src/utils/axios';

import { useGetGeneral } from 'src/api/general'; */

import Image from 'src/components/image';
import { MotionContainer } from 'src/components/animate';
import Carousel, { useCarousel, CarouselDots } from 'src/components/carousel';

// ----------------------------------------------------------------------

export default function Illustration({ list, ...other }) {

  // const { carruselData } = useGetGeneral(endpoints.dashboard.getCarrusel, "carruselData");

  const carruselData = [
    {"imagen": 1,},
    {"imagen": 2},
    {"imagen": 3},
    {"imagen": 4}
  ];

  const carousel = useCarousel({
    speed: 1800,
    autoplay: true,
    ...CarouselDots({
      sx: {
        top: '90%',
        left: '50%',
        position: 'absolute',
        transform: 'translate(-50%, -50%)',
        color: 'primary.light',
      },
    }),
  });

  return (
<Card {...other} sx={{ height: 'auto', position: 'relative', maxHeight: '600px'  }}>
  {!isEmpty(carruselData) ? (
    <Carousel ref={carousel.carouselRef} {...carousel.carouselSettings}>
      {carruselData.map((app, index) => (
        <CarouselItem key={index} item={app} active={index === carousel.currentIndex} />
      ))}
    </Carousel>
  ) : (
    <Grid container spacing={1} sx={{
      p: 5, backgroundColor: "#ECECEC", animation: 'pulse 1.5s infinite', height: {
        xl: 600,
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
  const { imagen } = item;

  const renderImg = (
    <Image
      src={`${import.meta.env.BASE_URL}assets/images/fondoAhorro/${imagen}.png`}
      sx={{
        width: '100%',              
        height: 'auto',             
        maxWidth: '100%',          
        maxHeight: '100%',        
        objectFit: 'contain',    
      }}
    />
  );

  return (
    <MotionContainer action animate={active} sx={{ position: 'relative', height: '100%' }} className="fade-in">
      {renderImg}
    </MotionContainer>
  );
}

CarouselItem.propTypes = {
  active: PropTypes.bool,
  item: PropTypes.object,
};
