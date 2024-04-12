import React from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';

import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Unstable_Grid2';
import RadioGroup from '@mui/material/RadioGroup';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import { endpoints } from 'src/utils/axios';

import { useGetGeneral, usePostGeneral } from 'src/api/general';

import FormProvider, {
  RHFTextField
} from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function UserQuickEditForm({ open, onClose, idEncuesta }) {

  const { encuestaData } = usePostGeneral(idEncuesta, endpoints.encuestas.getEncuesta, "encuestaData");

  const { Resp1Data } = useGetGeneral(endpoints.encuestas.getResp1, "Resp1Data");

  const methods = useForm({
  });

  const { Resp2Data } = useGetGeneral(endpoints.encuestas.getResp2, "Resp2Data");

  const { Resp3Data } = useGetGeneral(endpoints.encuestas.getResp3, "Resp3Data");

  const { Resp4Data } = useGetGeneral(endpoints.encuestas.getResp4, "Resp4Data");

  return (
    <Dialog
      onClose={onClose}
      open={open}
      fullWidth
      disableEnforceFocus
      maxWidth="sm"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      sx={{
        borderRadius: 'initial',
        p: 0,
      }}
      padding={0}
    >
      <>
        <DialogTitle sx={{ m: 0, p: 2, margin: '25px', textAlign: 'center' }} id="customized-dialog-title">
          Encuesta
        </DialogTitle>

        {encuestaData.length > 0 ? (

          <Stack sx={{ mt: 0 }} >
            {encuestaData.map((item, index) => (

              <FormProvider methods={methods} >

                <DialogContent style={{ fontWeight: 'bold', margin: '25px' }}>
                  {item.pregunta}
                </DialogContent>

                <DialogContent spacing={1} sx={{margin: '25px'}}>
                  {item.respuestas === "1" || item.respuestas === 1 && (
                    <RadioGroup
                      name="radio-buttons-group"
                      sx={{
                        display: 'grid',
                        columnGap: 1,
                        rowGap: 1,
                        m: 1,
                        gridTemplateColumns: 'repeat(3, 1fr)',
                      }}
                    >
                      {Resp1Data.map((r1) => (
                        <FormControlLabel key={r1.value} value={r1.value} control={<Radio />} label={r1.label} disabled />
                      ))}
                    </RadioGroup>
                  )}

                  {item.respuestas === "2" || item.respuestas === 2 && (
                    <RadioGroup
                      name="radio-buttons-group"
                      sx={{
                        display: 'grid',
                        columnGap: 1,
                        rowGap: 1,
                        m: 1,
                        gridTemplateColumns: 'repeat(3, 1fr)',
                      }}
                    >
                      {Resp2Data.map((r2) => (
                        <FormControlLabel key={r2.value} value={r2.value} control={<Radio />} label={r2.label} disabled />
                      ))}
                    </RadioGroup>
                  )}

                  {item.respuestas === "3" || item.respuestas === 3 && (
                    <RadioGroup
                      name="radio-buttons-group"
                      sx={{
                        display: 'grid',
                        columnGap: 1,
                        rowGap: 1,
                        m: 1,
                        gridTemplateColumns: 'repeat(3, 1fr)',
                      }}
                    >
                      {Resp3Data.map((r3) => (
                        <FormControlLabel key={r3.value} value={r3.value} control={<Radio />} label={r3.label} disabled />
                      ))}
                    </RadioGroup>
                  )}

                  {item.respuestas === "4" || item.respuestas === 4 && (
                    <RadioGroup
                      name="radio-buttons-group"
                      row
                    >
                      {Resp4Data.map((r4) => (
                        <FormControlLabel key={r4.value} value={r4.value} control={<Radio />} label={r4.label} disabled />
                      ))}
                    </RadioGroup>
                  )}

                  {item.respuestas === "5" || item.respuestas === 5 && (
                    <RHFTextField name='abierta' multiline rows={3} disabled />
                  )}

                </DialogContent>
              </FormProvider>
            ))}

          </Stack>



        ) : (

          <Stack spacing={1} >
            <Grid container sx={{ p: 5 }} justifyContent="center" alignItems="center">
              <CircularProgress />
            </Grid>
          </Stack>

        )}

        <DialogActions justifycontent="center" sx={{ justifyContent: 'center' }}>
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
