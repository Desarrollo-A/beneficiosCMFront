import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function FiltersAtencionXsede({
  filters,
  onFilters,
  //
  onResetFilters,
  //
  results,
  ...other
}) {
  // const handleRemoveStatus = () => {
  //   onFilters('status', 'all');
  // };

  const handleRemoveSede = (inputValue) => {
    const newValue = filters.sede.filter((item) => item !== inputValue);
    onFilters('sede', newValue);
  };

  const handleRemoveOficina = (inputValue) => {
    const newValue = filters.oficina.filter((item) => item !== inputValue);
    onFilters('oficina', newValue);
  };

  const handleRemovePuesto = (inputValue) => {
    const newValue = filters.puesto.filter((item) => item !== inputValue);
    onFilters('puesto', newValue);
  };

  const handleRemoveModalidad = (inputValue) => {
    const newValue = filters.modalidad.filter((item) => item !== inputValue);
    onFilters('modalidad', newValue);
  };

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          resultados encontrados
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">

        {!!filters.sede.length && (
          <Block label="Sede:">
            {filters.sede.map((item) => (
              <Chip key={item} label={item} size="small" onDelete={() => handleRemoveSede(item)} />
            ))}
          </Block>
        )}

        {!!filters.oficina.length && (
          <Block label="Oficina:">
            {filters.oficina.map((item) => (
              <Chip key={item} label={item} size="small" onDelete={() => handleRemoveOficina(item)} />
            ))}
          </Block>
        )}

        {!!filters.puesto.length && (
          <Block label="Área:">
            {filters.puesto.map((item) => (
              <Chip key={item} label={item} size="small" onDelete={() => handleRemovePuesto(item)} />
            ))}
          </Block>
        )}

        {!!filters.modalidad.length && (
          <Block label="Modalidad:">
            {filters.modalidad.map((item) => (
              <Chip key={item} label={item} size="small" onDelete={() => handleRemoveModalidad(item)} />
            ))}
          </Block>
        )}

        <Button
          color="error"
          onClick={onResetFilters}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          Borrar
        </Button>
      </Stack>
    </Stack>
  );
}

FiltersAtencionXsede.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  onResetFilters: PropTypes.func,
  results: PropTypes.number,
};

// ----------------------------------------------------------------------

function Block({ label, children, sx, ...other }) {
  return (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={1}
      direction="row"
      sx={{
        p: 1,
        borderRadius: 1,
        overflow: 'hidden',
        borderStyle: 'dashed',
        ...sx,
      }}
      {...other}
    >
      <Box component="span" sx={{ typography: 'subtitle2' }}>
        {label}
      </Box>

      <Stack spacing={1} direction="row" flexWrap="wrap">
        {children}
      </Stack>
    </Stack>
  );
}

Block.propTypes = {
  children: PropTypes.node,
  label: PropTypes.string,
  sx: PropTypes.object,
};
