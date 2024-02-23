import { useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
import Dialog from '@material-ui/core/Dialog';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import Avatar from '@mui/material/Avatar';
import LoadingButton from '@mui/lab/LoadingButton';
import ListItemText from '@mui/material/ListItemText';
import { alpha, useTheme } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';

import { useAuthContext } from 'src/auth/hooks';
import { AvatarShape } from 'src/assets/illustrations';
import { updateAppointment } from 'src/api/calendar-colaborador';

import Image from 'src/components/image';

export default function EvaluateDialog({ open, pendiente, mutate, cerrar }) {
  const [valorRating, setValorRating] = useState(0);
  const { especialista, beneficio, sexoEspecialista, start } = pendiente;

  const { user: datosUser } = useAuthContext();
  const theme = useTheme();

  const handleRatingChange = (newValue) => {
    setValorRating(newValue);
  };

  const handleRate = async (thisEvent) => {
    const update = await updateAppointment(
      datosUser.idUsuario,
      thisEvent.id,
      thisEvent.estatus,
      thisEvent.idDetalle,
      valorRating * 2,
      thisEvent.idEventoGoogle
    );
    if (!update.result) {
      enqueueSnackbar('¡Se obtuvo un error al intentar registrar la evaluación de la cita!', {
        variant: 'error',
      });
    }
    enqueueSnackbar('¡Gracias por evaluar la cita!', {
      variant: 'success',
    });
    setValorRating(0);
    if (mutate) mutate();
    if (cerrar) cerrar();
    return true;
  };

  return (
    <Dialog
      open={open}
      fullWidth
      disableEnforceFocus
      maxWidth="xs"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      sx={{
        borderRadius: 'initial',
        p: 0,
      }}
      padding={0}
    >
      <Card sx={{ textAlign: 'center', borderRadius: '0%' }}>
        <Box sx={{ position: 'relative' }}>
          <AvatarShape
            sx={{
              left: 0,
              right: 0,
              zIndex: 10,
              mx: 'auto',
              bottom: -27,
              position: 'absolute',
            }}
          />

          <Avatar
            alt={especialista}
            src={
              sexoEspecialista === 'F'
                ? 'https://api-dev-minimal-v510.vercel.app/assets/images/avatar/avatar_4.jpg'
                : 'https://api-dev-minimal-v510.vercel.app/assets/images/avatar/avatar_12.jpg'
            }
            sx={{
              width: 64,
              height: 64,
              zIndex: 11,
              left: 0,
              right: 0,
              bottom: -32,
              mx: 'auto',
              position: 'absolute',
            }}
          />

          <Image
            src="https://api-dev-minimal-v510.vercel.app/assets/images/cover/cover_12.jpg"
            alt="https://api-dev-minimal-v510.vercel.app/assets/images/cover/cover_12.jpg"
            ratio="16/9"
            overlay={alpha(theme.palette.grey[900], 0.48)}
            sx={{ borderRadius: '0%' }}
          />
        </Box>

        <ListItemText
          sx={{ mt: 7, mb: 1 }}
          primary={especialista || 'Especialista'}
          secondary={beneficio || 'Beneficio saludable'}
          primaryTypographyProps={{ typography: 'subtitle1' }}
          tertiary={start || '2024-01-01 10:00:00'}
          secondaryTypographyProps={{ component: 'span', mt: 0.5 }}
        />
        <ListItemText
          sx={{ mt: 1, mb: 5 }}
          secondary={start || '2024-01-01 10:00:00'}
          primaryTypographyProps={{ typography: 'subtitle1' }}
          secondaryTypographyProps={{ component: 'span', mt: 0.5 }}
        />

        <Stack direction="row" alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
          <Rating
            name="half-rating"
            defaultValue={0}
            precision={0.5}
            value={valorRating}
            onChange={(e, value) => handleRatingChange(value)}
          />
        </Stack>
        <DialogActions justifycontent="center" sx={{ justifyContent: 'center' }}>
          <LoadingButton variant="contained" color="success" onClick={() => handleRate(pendiente)}>
            Calificar
          </LoadingButton>
        </DialogActions>
      </Card>
    </Dialog>
  );
}

EvaluateDialog.propTypes = {
  open: PropTypes.bool,
  pendiente: PropTypes.object,
  mutate: PropTypes.func,
  cerrar: PropTypes.func,
};
