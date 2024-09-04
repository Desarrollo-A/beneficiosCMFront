import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import { alpha, useTheme } from '@mui/material/styles';

import { bgGradient } from 'src/theme/css';

// ----------------------------------------------------------------------

export default function ProfileCover({ name, avatarUrl, role, coverUrl, sex }) {
  const theme = useTheme();

  console.log(avatarUrl)

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.primary.darker, 0.5),
          imgUrl: `${import.meta.env.BASE_URL}assets/images/perfil/cover.jpg`,
        }),
        height: 1,
        color: 'common.white',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          left: { md: 50 },
          bottom: { md: 100 },
          zIndex: { md: 10 },
          pt: { xs: 6, md: 0 },
          position: { md: 'absolute' },
        }}
      >
        <Avatar
          src={`${import.meta.env.BASE_URL}assets/images/perfil/user.png`}
          alt={name}
          sx={{
            mx: 'auto',
            width: { xs: 64, md: 128 },
            height: { xs: 64, md: 128 },
            border: `solid 2px ${theme.palette.common.white}`,
          }}
        />

        <ListItemText
          sx={{
            mt: 3,
            ml: { md: 3 },
            textAlign: { xs: 'center', md: 'unset' },
          }}
          primary={
            <>
              {sex === 'M' ? 'Bienvenida' : 'Bienvenido'}
              <br />
              {name}
            </>
          }
          secondary={role}
          primaryTypographyProps={{
            typography: 'h4',
          }}
          secondaryTypographyProps={{
            mt: 0.5,
            color: 'inherit',
            component: 'span',
            typography: 'body2',
            sx: { opacity: 0.48 },
          }}
        />
      </Stack>
    </Box>
  );
}

ProfileCover.propTypes = {
  avatarUrl: PropTypes.string,
  coverUrl: PropTypes.string,
  name: PropTypes.string,
  sex: PropTypes.string,
  role: PropTypes.string,
};
