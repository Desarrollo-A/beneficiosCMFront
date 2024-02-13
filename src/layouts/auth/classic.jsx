import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
// import { useTheme } from '@mui/material/styles';

// import { paths } from 'src/routes/paths';

import { useResponsive } from 'src/hooks/use-responsive';

// import { useAuthContext } from 'src/auth/hooks';


// ----------------------------------------------------------------------

// const METHODS = [
//   {
//     id: 'jwt',
//     label: 'Jwt',
//     path: paths.auth.jwt.login,
//     icon: '/assets/icons/auth/ic_jwt.svg',
//   },
//   {
//     id: 'firebase',
//     label: 'Firebase',
//     path: paths.auth.firebase.login,
//     icon: '/assets/icons/auth/ic_firebase.svg',
//   },
//   {
//     id: 'amplify',
//     label: 'Amplify',
//     path: paths.auth.amplify.login,
//     icon: '/assets/icons/auth/ic_amplify.svg',
//   },
//   {
//     id: 'auth0',
//     label: 'Auth0',
//     path: paths.auth.auth0.login,
//     icon: '/assets/icons/auth/ic_auth0.svg',
//   },
// ];

export default function AuthClassicLayout({ children, image, title }) {
   // const { method } = useAuthContext();

  // const theme = useTheme();

  const mdUp = useResponsive('up', 'md');

  const renderContent = (
    <Stack
      sx={{
        width: 1,
        mx: 'auto',
        maxWidth: 480,
        px: { xs: 2, md: 8 },
        pt: { xs: 15, md: 20 },
        pb: { xs: 15, md: 0 },
      }}
    >
      {children}
    </Stack>
  );

  const renderSection = (
    <Stack
      flexGrow={1}
      spacing={10}
      alignItems="center"
      justifyContent="center"
      sx={{
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundImage: `url(${import.meta.env.BASE_URL}assets/illustrations/mainLoginBG.jpg)`,
      }}>
      <Box
        component="img"
        alt="auth"
        src={image || `${import.meta.env.BASE_URL}assets/img/unnamed.png`}
        sx={{
          maxWidth: {
            xs: 480,
            lg: 560,
            xl: 720,
          },
        }}
      />
    </Stack>

    
  );

  return (
    <Stack
      component="main"
      direction="row"
      sx={{
        minHeight: '100vh',
      }}
    >

      {mdUp && renderSection}

      {renderContent}
    </Stack>
  );
}

AuthClassicLayout.propTypes = {
  children: PropTypes.node,
  image: PropTypes.string,
  title: PropTypes.string,
};
