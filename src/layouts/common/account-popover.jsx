import { m } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
// import { useGoogleOneTapLogin } from '@react-oauth/google';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useMockedUser } from 'src/hooks/use-mocked-user';

import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';
import { varHover } from 'src/components/animate';
import { useSnackbar } from 'src/components/snackbar';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

const OPTIONS = [
  {
    label: 'Perfil',
    linkTo: paths.dashboard.usuariosexternos.perfil,
  },
];

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const router = useRouter();

  // const userData = JSON.parse(Base64.decode(localStorage.getItem('accessToken').split('.')[2]));
  const { user: userData } = useAuthContext();

  useMockedUser();

  const { logout } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();

  const popover = usePopover();

  const handleLogout = async () => {
    try {
      await logout();
      popover.onClose();
      router.replace(import.meta.env.BASE_URL);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to logout!', { variant: 'error' });
    }
  };

  const handleClickItem = (path) => {
    popover.onClose();
    router.push(path);
  };

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => console.log(tokenResponse),
    scope:
      'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
    flow: 'auth-code',
  });

  if (userData) {
    return (
      <>
        <IconButton
          component={m.button}
          whileTap="tap"
          whileHover="hover"
          variants={varHover(1.05)}
          onClick={popover.onOpen}
        >
          <Iconify icon="solar:user-bold-duotone" width={24} />
        </IconButton>

        <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 240, p: 0 }}>
          <Box sx={{ p: 2, pb: 1.5 }}>
            <Typography variant="subtitle2" noWrap>
              {userData.idUsuario} {userData.nombre}
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
              {userData.correo}
            </Typography>
          </Box>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <Box sx={{ p: 1, mb: 1, mt: 0 }}>
            <MenuItem onClick={() => login()}>Conectar cuenta de google</MenuItem>
          </Box>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <Stack sx={{ p: 1 }}>
            {OPTIONS.map((option) => (
              <MenuItem key={option.label} onClick={() => handleClickItem(option.linkTo)}>
                {option.label}
              </MenuItem>
            ))}
          </Stack>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <MenuItem
            onClick={handleLogout}
            sx={{ m: 1, fontWeight: 'fontWeightBold', color: 'error.main' }}
          >
            Cerrar sesión
          </MenuItem>
        </CustomPopover>
      </>
    );
  }
  return null;
}
