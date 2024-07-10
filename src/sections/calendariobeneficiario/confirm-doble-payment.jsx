import 'dayjs/locale/es';
import PropTypes from 'prop-types';
import { Dialog, DialogContent } from '@material-ui/core';

import { useTheme } from '@mui/material/styles';
import LoadingButton from '@mui/lab/LoadingButton';
import { Stack, Button, Typography, DialogActions, Box } from '@mui/material';

import Image from 'src/components/image';
import SvgColor from 'src/components/svg-color/svg-color';
import { alignProperty } from '@mui/material/styles/cssUtils';

export default function ConfirmDoblePayment({ open, onClose, paymentFunc }) {
  const theme = useTheme();
  return (
    <Dialog open={open} maxWidth="sm" disableEnforceFocus>
      <Box sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#212B36' : '#f7f7f7' }}>
        <DialogContent>
          <Stack
            direction="row"
            justifyContent="center"
            useFlexGap
            flexWrap="wrap"
            sx={{ pt: { xs: 1, md: 2 } }}
          >
            <Image
              disabledEffect
              alt={`${import.meta.env.BASE_URL}assets/icons/faqs/ic_payment.svg`}
              src={`${import.meta.env.BASE_URL}assets/icons/faqs/ic_payment.svg`}
              sx={{ width: 150, height: 150, mx: 'auto' }}
            />
          </Stack>
          <Stack
            direction="row"
            justifyContent="center"
            useFlexGap
            flexWrap="wrap"
            sx={{ pt: { xs: 1, md: 2 }, pb: { xs: 1, md: 2 } }}
          >
            <Typography color="red" sx={{ mt: 1 }}>
              <strong>¡ATENCIÓN!</strong>
            </Typography>
          </Stack>
          <Typography
            sx={{
              justifyContent: 'center',
              alignContent: 'center',
              textAlign: 'center',
              color: theme.palette.mode === 'dark' ? 'white' : 'black',
              mb: 1,
            }}
          >
            ¡Si ya realizaste tu pago, espera 10 minutos mientras se procesa! Si no lo has
            realizado, puedes hacer clic en "Pagar".
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={onClose}>
            Cerrar
          </Button>
          <LoadingButton
            variant="contained"
            color="success"
            onClick={() => {
              paymentFunc();
              onClose();
            }}
            autoFocus
          >
            Pagar de todas formas
          </LoadingButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

ConfirmDoblePayment.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  paymentFunc: PropTypes.func,
  // cita: PropTypes.object,
};
