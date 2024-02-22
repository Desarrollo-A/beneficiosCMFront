import * as yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { useAuthContext } from 'src/auth/hooks';
import { setHorarioPresencial, useGetSedesPresenciales } from 'src/api/especialistas';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFSelect, RHFHidden, RHFDatePicker } from 'src/components/hook-form';

// -------------------------------------------------------------------

export default function AgendaDialog({ open, onClose, id, start, end, sede, ...props }) {
  const theme = useTheme();

  const { enqueueSnackbar } = useSnackbar();

  const { user } = useAuthContext();

  const { sedes } = useGetSedesPresenciales({ idEspecialista: user?.idUsuario });

  const checkMin = (value, context) => {
    const end = new Date(value)
    const start = context.from[0].value.start

    return end > start
  }

  const formSchema = yup.object({
    id: yup.number().nullable(true),
    start: yup.string().transform(parseStartDate).required(),
    end: yup.string().test('check-min', "Fecha final debe ser mayor a la fecha inicial", checkMin ).transform(parseEndDate).required(),
    sede: yup.number().required().typeError('Debes elegir una opción.'),
    especialista: yup.number(),
  });

  const methods = useForm({
    resolver: yupResolver(formSchema),
    // defaultValues: currentEvent,
  });

  const { handleSubmit } = methods;

  const onSubmit = handleSubmit(async (data) => {
    console.log(data);

    const response = await setHorarioPresencial(data);

    if (response.status === 'error') {
      enqueueSnackbar(response.message, { variant: 'error' });
    } else {
      enqueueSnackbar(response.message);

      onClose();
    }
  });

  const handleClose = (event, reason) => {
    onClose();
  };

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      onClose={handleClose}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 1000,
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogContent sx={{ p: { xs: 1, md: 2 } }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            useFlexGap
            flexWrap="wrap"
            spacing={2}
            sx={{ p: { xs: 1, md: 2 } }}
          >
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
              Establecer horario presencial
            </Typography>

            <Stack direction="column" spacing={2}>
              <Stack direction="row" spacing={2}>
                <RHFHidden name="especialista" value={user?.idUsuario} />
                <RHFDatePicker name="start" label="Inicio" value={start} disablePast={true} />
                <RHFDatePicker name="end" label="Final" value={end} disablePast={true} />
              </Stack>
              <RHFSelect name="sede" label="Sede" value="">
                <MenuItem key={0} value={0}>
                  Sin horario
                </MenuItem>
                {sedes.map((s, index) => (
                  <MenuItem key={index} value={s.value}>
                    {s.label}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={handleClose}>
            Cerrar
          </Button>
          <LoadingButton type="submit" variant="contained" color="success">
            Guardar
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

function parseStartDate(value, originalValue) {
  // originalValue.setUTCHours(0,0,0,0);
  return originalValue.toISOString();
}

function parseEndDate(value, originalValue) {
  // originalValue.setUTCHours(23,59,59,0);
  return originalValue.toISOString();
}

AgendaDialog.propTypes = {
  open: PropTypes.any,
  onClose: PropTypes.any,
  id: PropTypes.any,
  start: PropTypes.any,
  end: PropTypes.any,
  sede: PropTypes.any,
};
