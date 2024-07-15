import { memo } from 'react';

import { Card } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';

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
              className="fade-in"
            />

          ) : (
            <>
              <Grid container spacing={1} component="nav" direction="row" sx={{
                mx: 1, my: 2, borderRadius: '7px', width: '5%',
                height: 30, backgroundColor: "#ececec7a", animation: 'pulse 1.5s infinite',
                marginLeft: '35%'
              }} >
                <Card />
              </Grid>

              <Grid container spacing={1} component="nav" direction="row" sx={{
                mx: 1, my: 2, borderRadius: '7px', width: '5%',
                height: 30, backgroundColor: "#ececec7a", animation: 'pulse 1.5s infinite',
              }} >
                <Card />
              </Grid>

              <Grid container spacing={1} component="nav" direction="row" sx={{
                mx: 1, my: 2, borderRadius: '7px', width: '5%',
                height: 30, backgroundColor: "#ececec7a", animation: 'pulse 1.5s infinite',
              }} >
                <Card />
              </Grid>

              <Grid container spacing={1} component="nav" direction="row" sx={{
                mx: 1, my: 2, borderRadius: '7px', width: '5%',
                height: 30, backgroundColor: "#ececec7a", animation: 'pulse 1.5s infinite',
              }} >
                <Card />
              </Grid>

              <Grid container spacing={1} component="nav" direction="row" sx={{
                mx: 1, my: 2, borderRadius: '7px', width: '5%',
                height: 30, backgroundColor: "#ececec7a", animation: 'pulse 1.5s infinite',
              }} >
                <Card />
              </Grid>
            </>
          )}

        </Scrollbar>
      </Toolbar>

      <HeaderShadow />
    </AppBar>
  );
}

export default memo(NavHorizontal);
