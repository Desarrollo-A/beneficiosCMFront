import PropTypes from 'prop-types';
import { forwardRef } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
// import { useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------

const Logo = forwardRef(({ disabledLink = false, sx, ...other }, ref) => {
  // -------------------------------------------------------
   const logo = (
    <div style={{margin:"30px"}}>
     <Box
       component="img"
       src= {`${import.meta.env.BASE_URL}assets/img/beneficiosBrand.svg`}
       style={{marginTop:"0", marginLeft:"0", marginRight:"0", filter: 'invert(100%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(103%) contrast(100%)'}}
       sx={{ width: "100%", cursor: 'pointer', ...sx }}
     />
     </div>
   );
  if (disabledLink) {
    return logo;
  }

  return (
    <Link component={RouterLink} href="/" sx={{ display: 'contents' }}>
      {logo}
    </Link>
  );
});

Logo.propTypes = {
  disabledLink: PropTypes.bool,
  sx: PropTypes.object,
};

export default Logo;
