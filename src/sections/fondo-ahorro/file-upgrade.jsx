import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import Iconify from 'src/components/iconify';
import CardHeader from '@mui/material/CardHeader';
import Paper from '@mui/material/Paper';
import ListItemText from '@mui/material/ListItemText';


import Label from 'src/components/label';
import { bgGradient } from 'src/theme/css';
import { UpgradeStorageIllustration } from 'src/assets/illustrations';
import { IconButton } from '@mui/material';

// ----------------------------------------------------------------------

export default function FileUpgrade({ sx, ...other }) {
  const theme = useTheme();

  return (
    <>
    {/* <Stack
      alignItems="center"
      sx={{
        ...bgGradient({
          direction: '135deg',
          startColor: alpha(theme.palette.primary.light, 0.2),
          endColor: alpha(theme.palette.primary.main, 0.2),
          
        }),
        p: 5,
        borderRadius: 2,
        backgroundColor: 'common.white',
        ...sx,
      }}
      {...other}
    >

      

      <Typography variant="caption" sx={{ color: 'primary.dark', textAlign: 'center' }}>
        Upgrade your plan and get more space
      </Typography>

      <Button
        size="large"
        color="inherit"
        variant="contained"
        sx={{
          mt: 5,
          mb: 2,
          color: 'common.white',
          bgcolor: 'grey.800',
          '&:hover': {
            bgcolor: 'grey.700',
          },
        }}
      >
        Upgrade Plan
      </Button>
    </Stack> */}
<Box sx={{ py: 2, ...sx }} {...other}>
      <CardHeader
        sx={{
          p: 0,
          mb: 3,
        }}
      />
<Paper
      sx={{
        mr: 3,
        borderRadius: 2,
        position: 'relative',
        bgcolor: 'background.neutral',
      }}
    >
      <Stack
        spacing={2}
        sx={{
          px: 2,
          pb: 1,
          pt: 2.5,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <ListItemText
            /* primary={name} */
            /* secondary={fDateTime(bookedAt)} */
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
              color: 'text.disabled',
            }}
          />
        </Stack>

        <Stack
          rowGap={1.5}
          columnGap={3}
          flexWrap="wrap"
          direction="row"
          alignItems="center"
          sx={{ color: 'text.secondary', typography: 'caption' }}
        >
          <Stack direction="row" alignItems="center">
            <Iconify width={16} icon="solar:calendar-date-bold" sx={{ mr: 0.5, flexShrink: 0 }} />
            {/* {duration} */}fsfds
          </Stack>

          <Stack direction="row" alignItems="center">
            <Iconify
              width={16}
              icon="solar:users-group-rounded-bold"
              sx={{ mr: 0.5, flexShrink: 0 }}
            />
            {/* {guests} Guests */}fsdf
          </Stack>
        </Stack>
      </Stack>

      <Box sx={{ p: 1, position: 'relative' }}>
        <IconButton>fdfdf</IconButton>
        {/* <Image alt={coverUrl} src={coverUrl} ratio="1/1" sx={{ borderRadius: 1.5 }} /> */}
      </Box>
    </Paper>


</Box>

</>
    
  );
}

FileUpgrade.propTypes = {
  sx: PropTypes.object,
};
