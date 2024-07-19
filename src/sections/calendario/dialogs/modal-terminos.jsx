import React from 'react';
import PropTypes from 'prop-types';
import { DialogActions, DialogContent } from '@material-ui/core';

import { Grid, Stack, Button, CircularProgress } from '@mui/material';

import { HOST } from 'src/config-global';

// ----------------------------------------------------------------------

export default function ModalTerminos({ onClose, archivo }) {

  // const src = `${HOST}/documentos/archivo/${archivo}`;

  const src = `${HOST}/dist/documentos/avisos-privacidad/${archivo}`;

  return (<>
  { archivo !== 0 ? (
  <DialogContent>
    <Stack sx={{ mt: '5%', mb: '5%'}}>
        <iframe title="frame" src={src} width="100%" height="550px" />   
        </Stack>
    </DialogContent>
    ) : (
        <Grid container sx={{ p: 5 }} justifyContent="center" alignItems="center">
          <CircularProgress />
        </Grid>
    )
  }
    
    <DialogActions sx={{ mt: '5%', mb: '5%'}}>
        <Button variant="contained" color="error" onClick={onClose}>
          Cerrar
        </Button>
    </DialogActions>
    </>
  );
}

ModalTerminos.propTypes = {
  onClose: PropTypes.func,
  archivo: PropTypes.any
};
