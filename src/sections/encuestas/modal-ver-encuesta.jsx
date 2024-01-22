import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

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

      <DialogTitle>Encuesta</DialogTitle>

      <Stack spacing={1} >
        {encuestaData.map((item) => (

          <>

            <DialogContent>
              {item.pregunta}
            </DialogContent>

            {item.respuestas === "1" && (
              <DialogContent spacing={1}> Respuestas: {Resp1Data.map((i) => i.label).join(', ')} </DialogContent>
            )}

            {item.respuestas === "2" && (
              <DialogContent spacing={1}> Respuestas: {Resp2Data.map((i) => i.label).join(', ')} </DialogContent>
            )}

            {item.respuestas === "3" && (
              <DialogContent> Respuestas: {Resp3Data.map((i) => i.label).join(', ')} </DialogContent>
            )}

            {item.respuestas === "4" && (
              <DialogContent> Respuestas: {Resp4Data.map((i) => i.label).join(', ')} </DialogContent>
            )}

            {item.respuestas === "5" && (
              <DialogContent> Respuesta: Abierta corta </DialogContent>
            )}

            {item.respuestas === "6" && (
              <DialogContent> Respuestas: Abierta larga </DialogContent>
            )}
          </>
        ))}

      </Stack>

      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Cerrar
        </Button>
      </DialogActions>
      
    </Dialog>

  );
}

UserQuickEditForm.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  idEncuesta: PropTypes.number,
};
