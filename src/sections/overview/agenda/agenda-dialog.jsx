import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';

import LoadingButton from '@mui/lab/LoadingButton';

import FormProvider from 'src/components/hook-form/form-provider';
import { RHFSelect, RHFDatePicker } from 'src/components/hook-form';
import { useSnackbar } from 'src/components/snackbar';

import { useAuthContext } from 'src/auth/hooks';
import { useGetSedesPresenciales, setHorarioPresencial } from 'src/api/especialistas'

// -------------------------------------------------------------------

export default function AgendaDialog({open, onClose, start, end, ...props}){

  const theme = useTheme();

  const { enqueueSnackbar } = useSnackbar();

  const { user } = useAuthContext();

  const { sedes } = useGetSedesPresenciales({idEspecialista : user.idUsuario});

  const formSchema = yup.object({
    start: yup.string().transform(parseDateString).required(),
    end: yup.string().transform(parseDateString).required(),
    sede : yup.number().required(),
  });

  const methods = useForm({
    resolver: yupResolver(formSchema),
    // defaultValues: currentEvent,
  });

  const { reset, watch, handleSubmit } = methods;

  const onSubmit = handleSubmit(async (data) => {
    data.especialista = user.idUsuario
    console.log(data)

    let response = await setHorarioPresencial(data)

    if(response.status === 'error'){
      enqueueSnackbar(response.message, { variant: 'error'});
    }else{
      enqueueSnackbar(response.message);

      onClose();
    }
  })

  const handleClose = (event, reason) => {
    onClose();
  }

  return(
    <>
      <Dialog
        fullWidth
        maxWidth={'xs'}
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
                  <RHFDatePicker name="start" label="Inicio" value={start} />
                  <RHFDatePicker name="end" label="Final" value={end} />
                </Stack>
                <RHFSelect name="sede" label="Sede">
                  {sedes.map((sede, index) => (
                    <MenuItem key={index} value={sede.value}>
                      {sede.label}
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
              <LoadingButton
                type="submit"
                variant="contained"
                color="success"
              >
                Guardar
              </LoadingButton>
          </DialogActions>
        </FormProvider>
      </Dialog>
    </>
  )
}

function parseDateString(value, originalValue) {
  return originalValue.toISOString()
}