import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

// ----------------------------------------------------------------------

export default function BookingWidgetSummary({ title, total, icon, sx, length, ...other }) {

  const theme = useTheme();
  
  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.palette.mode === 'dark' ? '#25303d' : '#f4f6f8',
        p: 2,
        pl: 3,
        ...sx,
      }}
      {...other}
    >
      
      <Box>
        <Box sx={{ mb: 1, typography: 'h3' }}> 
          {length >= 0 ? ( 
            total
           ):(
            <CircularProgress /> )}
          </Box>
        <Box sx={{ color: 'text.secondary', typography: 'subtitle2' }}>{title}</Box>
      </Box>

      <Box
        sx={{
          width: 120,
          height: 120,
          lineHeight: 0,
          borderRadius: '50%',
          bgcolor: 'background.neutral',
        }}
      >
        {icon}
      </Box>
    </Card>
  );
}

BookingWidgetSummary.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  sx: PropTypes.object,
  title: PropTypes.string,
  total: PropTypes.any,
  length: PropTypes.any,
};
