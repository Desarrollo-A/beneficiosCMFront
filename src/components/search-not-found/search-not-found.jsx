import PropTypes from 'prop-types';

import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export default function SearchNotFound({ query, sx, ...other }) {
  return query ? (
    <Paper
      sx={{
        bgcolor: 'unset',
        textAlign: 'center',
        ...sx,
      }}
      {...other}
    >
      <Typography variant="h6" gutterBottom>
        Sin resultados
      </Typography>

      <Typography variant="body2">
        Sin resultados para &nbsp;
        <strong>&quot;{query}&quot;</strong>.
        <br />
        Intente comprobar si hay errores tipográficos o utilizar palabras completas.
      </Typography>
    </Paper>
  ) : (
    <Typography variant="body2" sx={sx}>
      Por favor ingrese palabras clave
    </Typography>
  );
}

SearchNotFound.propTypes = {
  query: PropTypes.string,
  sx: PropTypes.object,
};
