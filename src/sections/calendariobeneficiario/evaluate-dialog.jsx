import { useState } from 'react';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { enqueueSnackbar } from 'notistack';
import Dialog from '@material-ui/core/Dialog';
import { useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { endpoints } from 'src/utils/axios';

import { useInsert } from 'src/api/encuestas';
import { useAuthContext } from 'src/auth/hooks';
import { useGetGeneral, usePostGeneral } from 'src/api/general';
import { updateAppointment } from 'src/api/calendar-colaborador';

import FormProvider, {
  RHFTextField,
  RHFRadioGroup,
} from 'src/components/hook-form';

export default function EvaluateDialog({ open, pendiente, mutate, cerrar }) {
  const [valorRating, setValorRating] = useState(0);
  const { especialista, beneficio, idEspecialista, idEncuesta, id, estatus, idDetalle, idEventoGoogle } = pendiente;

  console.log(pendiente)

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

  const [searchParams] = useSearchParams();

  const router = useRouter();

  const { user } = useAuthContext();

  const { encuestaData } = usePostGeneral(idEncuesta, endpoints.encuestas.getEncuesta, "encuestaData");

  const { Resp1Data } = useGetGeneral(endpoints.encuestas.getResp1, "Resp1Data");

  const { Resp2Data } = useGetGeneral(endpoints.encuestas.getResp2, "Resp2Data");

  const { Resp3Data } = useGetGeneral(endpoints.encuestas.getResp3, "Resp3Data");

  const { Resp4Data } = useGetGeneral(endpoints.encuestas.getResp4, "Resp4Data");

  const insertData = useInsert(endpoints.encuestas.encuestaInsert);


  const methods = useForm({
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const [formKey, setFormKey] = useState(0);

  const resetForm = () => {
    reset();
    setFormKey((prevKey) => prevKey + 1);
  };

  const onSubmit = handleSubmit(async (data) => {

    const update = await updateAppointment(
      datosUser.idUsuario,
      id,
      estatus,
      idDetalle,
      idEncuesta,
      idEventoGoogle
    );

    const newData = encuestaData.map((item, index) => {
      const respKey = `resp_${index}`;

      return {
        ...item,
        idUsuario: user?.idUsuario,
        idEnc: idEncuesta,
        idArea: encuestaData[0]?.idArea,
        idEsp: idEspecialista,
        resp: data[respKey]
      };
    });

    try {
      await new Promise((resolve) => setTimeout(resolve));

      const insert = await insertData(newData);

      if (insert.estatus === true && update.result) {
        enqueueSnackbar(insert.msj, { variant: 'success' });
        resetForm();
        mutate(endpoints.encuestas.getEcuestaValidacion);
        router.replace(paths.dashboard.root);

      } else {
        enqueueSnackbar(insert.msj, { variant: 'error' });
      }
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      enqueueSnackbar(`¡No se pudó actualizar los datos!`, { variant: 'danger' });
    }

  });

  return (
    <Dialog
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

      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        Encuesta de satisfacción {beneficio}
        <Typography variant="subtitle2" >
           Especialista: {especialista}
        </Typography>
      </DialogTitle>

      {!isEmpty(encuestaData) ? (

        <Stack sx={{ mt: 3 }}>
          <DialogContent dividers>

            <FormProvider methods={methods} onSubmit={onSubmit} key={formKey}>
              <Grid container spacing={3}>

                <Grid xs={12} md={12}>
                  <Box
                    rowGap={3}
                    columnGap={1}
                    display="grid"
                    gridTemplateColumns={{
                      xs: 'repeat(1, 1fr)',
                      sm: 'repeat(1, 1fr)',
                    }}
                  >

                    {encuestaData.map((item, index) => (

                      <Stack spacing={1} key={item.pregunta}>

                        <Typography variant="subtitle2" >
                          {item.pregunta}
                        </Typography>

                        {item.respuestas === "1" || item.respuestas === 1 && (
                          <RHFRadioGroup row spacing={4} name={`resp_${index}`} options={Resp1Data} />
                        )}

                        {item.respuestas === "2" || item.respuestas === 2 && (
                          <RHFRadioGroup row spacing={4} name={`resp_${index}`} options={Resp2Data} />
                        )}

                        {item.respuestas === "3" || item.respuestas === 3 && (
                          <RHFRadioGroup row spacing={4} name={`resp_${index}`} options={Resp3Data} />
                        )}

                        {item.respuestas === "4" || item.respuestas === 4 && (
                          <RHFRadioGroup row spacing={4} name={`resp_${index}`} options={Resp4Data} />
                        )}

                        {item.respuestas === "5" || item.respuestas === 5 && (
                          <RHFTextField name={`resp_${index}`} multiline rows={4} />
                        )}

                      </Stack>
                    ))}
                  </Box>

                  <DialogActions justifycontent="center" sx={{ justifyContent: 'center' }}>
                    <LoadingButton type="submit" variant="contained" color="success" loading={isSubmitting}>
                      Enviar
                    </LoadingButton>
                  </DialogActions>

                </Grid>
              </Grid>
            </FormProvider>

            {/* <DialogActions justifycontent="center" sx={{ justifyContent: 'center' }}>
          <LoadingButton variant="contained" color="success" onClick={() => handleRate(pendiente)}>
            Enviar
          </LoadingButton>
        </DialogActions> */}
          </DialogContent>
        </Stack>

      ) : (

        <Stack sx={{ mt: 3 }}>
          <DialogActions justifycontent="center" sx={{ justifyContent: 'center' }}>
            <CircularProgress />
          </DialogActions>
        </Stack>

      )}
    </Dialog>
  );
}

EvaluateDialog.propTypes = {
  open: PropTypes.bool,
  pendiente: PropTypes.object,
  mutate: PropTypes.func,
  cerrar: PropTypes.func,
};
