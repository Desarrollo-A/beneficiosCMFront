import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';

// import { useResponsive } from 'src/hooks/use-responsive';

export default function AuthClassicLayout({ children, image, title }) {

  // const mdUp = useResponsive('up', 'md');

  const renderContent = (
    <Stack
      sx={{
        width: 1,
        mx: 'auto',
        maxWidth: { xs: 350, md: 500 },
        px: { xs: 2, md: 8 },
        pt: { xs: 5, md: 0 },
        pb: { xs: 10, md: 0 },
        position: 'relative',
        left: { md: '18%' } 
      }}
    >
      {children}
    </Stack>
  );

  return (
    <Stack
      component="main"
      direction="row"
      sx={{
        minHeight: '100vh',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundImage: {
          xs : `url(${import.meta.env.BASE_URL}assets/illustrations/fondoMobil.png)`,
          md : `url(${import.meta.env.BASE_URL}assets/illustrations/mainLoginBGFinal.png)`
        }
      }}
    >

      {/* {mdUp} */}
      <Grid container 
        sx={{ width : '100%',
          display: 'flex',
          alignItems: {
            xs : 'baseline',
            md :  'center' 
          }
        }}>
        {renderContent}
      </Grid>
    </Stack>
  );
}

AuthClassicLayout.propTypes = {
  children: PropTypes.node,
  image: PropTypes.string,
  title: PropTypes.string,
};
