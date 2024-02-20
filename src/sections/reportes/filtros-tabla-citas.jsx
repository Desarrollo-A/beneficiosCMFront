import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
/* import Button from '@mui/material/Button'; */

/* import Iconify from 'src/components/iconify';
import { shortDateLabel } from 'src/components/custom-date-range-picker'; */

// ----------------------------------------------------------------------

export default function FiltrosTabla({
  filters,
  onFilters,
  rol,
  //
  onResetFilters,
  //
  results,
  ...other
}) {

 /*  const shortLabel = shortDateLabel(filters.startDate, filters.endDate); */

  const handleRemoveStatus = () => {
    onFilters('estatus', 'all');
  };

  /* const handleRemoveRole = (inputValue) => {
    const newValue = filters.area.filter((item) => item !== inputValue);
    onFilters('area', newValue);
  };

  const handleRemoveDate = () => {
    onFilters('startDate', null);
    onFilters('endDate', null);
  };

  const handleRemoveEspe = (inputValue) => {
    const newValue = filters.especialista.filter((item) => item !== inputValue);
    onFilters('especialista', newValue);
  }; */

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          resultados encontrados
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {filters.estatus !== 'all' && (
          <Block label="Estatus:">
            <Chip size="small" label={filters.estatus} onDelete={handleRemoveStatus} />
          </Block>
        )}

        {/* {rol !== 1 ? (
          <>
            {!!filters.area.length && (
              <Block label="Área:">
                {filters.area.map((item) => (
                  <Chip key={item} label={item} size="small" onDelete={() => handleRemoveRole(item)} />
                ))}
              </Block>
            )}
          </>
        ) : (
          null
        )}

        {!!filters.especialista.length && (
          <Block label="Especialista:">
            {filters.especialista.map((item) => (
              <Chip key={item} label={item} size="small" onDelete={() => handleRemoveEspe(item)} />
            ))}
          </Block>
        )}

        {filters.startDate && filters.endDate && (
          <Block label="Fecha:">
            <Chip size="small" label={shortLabel} onDelete={handleRemoveDate} />
          </Block>
        )} */}

        {/* <Button
          color="error"
          onClick={onResetFilters}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          Limpiar
        </Button> */}
      </Stack>
    </Stack>
  );
}

FiltrosTabla.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  onResetFilters: PropTypes.func,
  results: PropTypes.number,
  rol: PropTypes.any,
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
