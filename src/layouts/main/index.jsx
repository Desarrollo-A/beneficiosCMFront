import PropTypes from 'prop-types';

import Box from '@mui/material/Box';

// import { usePathname } from 'src/routes/hooks';

import Footer from './footer';
import Header from './header';

// ----------------------------------------------------------------------

export default function MainLayout({ children }) {
  // const pathname = usePathname();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1 }}>
      <Header />

      <Footer />
    </Box>
  );
}

MainLayout.propTypes = {
  children: PropTypes.node,
};
