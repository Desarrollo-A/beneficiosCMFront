import React from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { endpoints } from 'src/utils/axios';

import { useGetGeneral, usePostGeneral } from 'src/api/general';

// ----------------------------------------------------------------------

export default function UserQuickEditForm({ open, onClose, idEncuesta }) {

  const { encuestaData } = usePostGeneral(idEncuesta, endpoints.encuestas.getEncuesta, "encuestaData");

  const { Resp1Data } = useGetGeneral(endpoints.encuestas.getResp1, "Resp1Data");

  const { Resp2Data } = useGetGeneral(endpoints.encuestas.getResp2, "Resp2Data");

  const { Resp3Data } = useGetGeneral(endpoints.encuestas.getResp3, "Resp3Data");

  const { Resp4Data } = useGetGeneral(endpoints.encuestas.getResp4, "Resp4Data");

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <>
        <DialogTitle>Encuesta</DialogTitle>

        {encuestaData.length > 0 ? (

          <Stack spacing={1} >
            {encuestaData.map((item, index) => (

              <React.Fragment key={index}>

                <DialogContent style={{ fontWeight: 'bold' }}>
                  {item.pregunta}
                </DialogContent>

                {item.respuestas === "1" || item.respuestas === 1 && (
                  <DialogContent spacing={1}> Respuestas: {Resp1Data.map((i) => i.label).join(', ')} </DialogContent>
                )}

                {item.respuestas === "2" || item.respuestas === 2 && (
                  <DialogContent spacing={1}> Respuestas: {Resp2Data.map((i) => i.label).join(', ')} </DialogContent>
                )}

                {item.respuestas === "3" || item.respuestas === 3 && (
                  <DialogContent> Respuestas: {Resp3Data.map((i) => i.label).join(', ')} </DialogContent>
                )}

                {item.respuestas === "4" || item.respuestas === 4 && (
                  <DialogContent> Respuestas: {Resp4Data.map((i) => i.label).join(', ')} </DialogContent>
                )}

                {item.respuestas === "5" || item.respuestas === 5 && (
                  <DialogContent> Respuesta: Abierta </DialogContent>
                )}

                {/* {item.respuestas === "6" || item.respuestas === 6 && (
              <DialogContent> Respuestas: Abierta larga </DialogContent>
            )} */}

                <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
              </ React.Fragment>
            ))}

          </Stack>



        ) : (

          <Stack spacing={1} >
            <Grid container sx={{ p: 5 }} justifyContent="center" alignItems="center">
              <CircularProgress />
            </Grid>
          </Stack>

        )}

        <DialogActions>
          <Button variant="contained" color="error" onClick={onClose}>
            Cerrar
          </Button>
        </DialogActions>
      </>
    </Dialog>

  );
}

UserQuickEditForm.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  idEncuesta: PropTypes.number,
};
