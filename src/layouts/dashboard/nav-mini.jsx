import Box from '@mui/material/Box';
import { Card } from '@mui/material';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';

import { useMockedUser } from 'src/hooks/use-mocked-user';

import { bgBlur, hideScroll } from 'src/theme/css';

import Logo from 'src/components/logoMini';
import { NavSectionMini } from 'src/components/nav-section';

import { NAV } from '../config-layout';
import { useNavData } from './config-navigation';
import NavToggleButton from '../common/nav-toggle-button';

// ----------------------------------------------------------------------

export default function NavMini() {
  const { user } = useMockedUser();

  const navData = useNavData();

  return (
    <Box
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_MINI },
      }}
    >
      <NavToggleButton
        sx={{
          top: 22,
          left: NAV.W_MINI - 12,
        }}
      />

      <Stack
        sx={{
          pb: 2,
          height: 1,
          position: 'fixed',
          width: NAV.W_MINI,
          borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          ...hideScroll.x,
          ...bgBlur({
            color: '#161c24',
          }),
        }}
      >
        <Logo sx={{ mx: 'auto', my: 2 }} />
        
        {navData.length > 0 ? (

          <NavSectionMini
            data={navData}
            slotProps={{
              currentRole: user?.role,
            }}
            className="fade-in"
          />

        ) : (
          <>
            <Grid container spacing={1} sx={{
              mx: 'auto', my: .4, borderRadius: '7px', width: '90%',
              p: 4, backgroundColor: "#ececec7a", animation: 'pulse 1.5s infinite',
            }} justifyContent="center" alignItems="center">
              <Card />
            </Grid>

            <Grid container spacing={1} sx={{
              mx: 'auto', my: .4, borderRadius: '7px', width: '90%',
              p: 4, backgroundColor: "#ececec7a", animation: 'pulse 1.5s infinite',
            }} justifyContent="center" alignItems="center">
              <Card />
            </Grid>

            <Grid container spacing={1} sx={{
              mx: 'auto', my: .4, borderRadius: '7px', width: '90%',
              p: 4, backgroundColor: "#ececec7a", animation: 'pulse 1.5s infinite',
            }} justifyContent="center" alignItems="center">
              <Card />
            </Grid>

            <Grid container spacing={1} sx={{
              mx: 'auto', my: .4, borderRadius: '7px', width: '90%',
              p: 4, backgroundColor: "#ececec7a", animation: 'pulse 1.5s infinite',
            }} justifyContent="center" alignItems="center">
              <Card />
            </Grid>

          </>
        )}

      </Stack>
    </Box>
  );
}
