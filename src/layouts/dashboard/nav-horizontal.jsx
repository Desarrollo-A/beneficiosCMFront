import { memo } from 'react';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import CircularProgress from '@mui/material/CircularProgress';

import { useMockedUser } from 'src/hooks/use-mocked-user';

import { bgBlur } from 'src/theme/css';

import Scrollbar from 'src/components/scrollbar';
import { NavSectionHorizontal } from 'src/components/nav-section';

import { HEADER } from '../config-layout';
import { useNavData } from './config-navigation';
import HeaderShadow from '../common/header-shadow';

// ----------------------------------------------------------------------

function NavHorizontal() {
  const theme = useTheme();

  const { user } = useMockedUser();

  const navData = useNavData();

  return (
    <AppBar
      component="div"
      sx={{
        top: HEADER.H_DESKTOP_OFFSET,
      }}
    >
      <Toolbar
        sx={{
          ...bgBlur({
            color: '#161c24',
          }),
        }}
      >
        <Scrollbar
          sx={{
            '& .simplebar-content': {
              display: 'flex',
            },
          }}
        >

          {navData.length > 0 ? (

            <NavSectionHorizontal
              data={navData}
              slotProps={{
                currentRole: user?.role,
              }}
              sx={{
                ...theme.mixins.toolbar,
              }}
            />

          ) : (

            <Grid container spacing={1} sx={{ p: 3.5 }} justifyContent="center" alignItems="center">
              <CircularProgress sx={{ color: 'white' }} />
            </Grid>
          )}

        </Scrollbar>
      </Toolbar>

      <HeaderShadow />
    </AppBar>
  );
}

export default memo(NavHorizontal);
