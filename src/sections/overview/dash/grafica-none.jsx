import PropTypes from 'prop-types';

import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export default function GraficaNone({ title, description, action, img, ...other }) {
  return (
    <Grid container spacing={2} sx={{ p: 0 }}>
      <Grid item xs={12} sm={12} md={12}>
        <Typography variant="h5" sx={{ mb: 0, whiteSpace: 'pre-line', textAlign: 'center' }}>
          {title}
        </Typography>
      </Grid>

      {img && (
        <Grid
          item
          xs={12}
          sm={12}
          md={12}
          sx={{
            p: { xs: 5, md: 3 },
            maxWidth: 300,
            mx: 'auto',
          }}
        >
          {img}
        </Grid>
      )}
    </Grid>
  );
}

GraficaNone.propTypes = {
  action: PropTypes.node,
  description: PropTypes.string,
  img: PropTypes.node,
  title: PropTypes.string,
};
