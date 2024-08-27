import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

export default function ConfirmCancelDialog({ open, onClose, onCancel, btnConfirmAction }) {
  return (
    <Dialog open={open} maxWidth="sm">
      <DialogContent>
        <Stack
          direction="row"
          justifyContent="center"
          useFlexGap
          flexWrap="wrap"
          sx={{ pt: { xs: 1, md: 2 }, pb: { xs: 1, md: 2 } }}
        >
          <Typography color="red" sx={{ mt: 1, mb: 1 }}>
            <strong>¡ATENCIÓN!</strong>
          </Typography>
        </Stack>

        <Typography>¿Estás seguro de cancelar la cita?</Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="error" onClick={onClose}>
          Cerrar
        </Button>
        <LoadingButton
          variant="contained"
          color="success"
          onClick={onCancel}
          loading={btnConfirmAction}
          autoFocus
        >
          Aceptar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

ConfirmCancelDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onCancel: PropTypes.func,
  btnConfirmAction: PropTypes.bool,
};
