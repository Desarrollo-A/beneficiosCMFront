import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';

import Box from '@mui/material/Box';
import { Button } from '@mui/material';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { endpoints } from 'src/utils/axios';

import { useInsert } from 'src/api/encuestas';
import { useAuthContext } from 'src/auth/hooks';
import { updateEvaluacion } from 'src/api/evaluacion';
import { useGetGeneral, usePostGeneral } from 'src/api/general';

import FormProvider, {
  RHFTextField,
} from 'src/components/hook-form';

export default function EvaluateDialog({ open, encuestas, mutate, cerrar }) {

  const [tipoEvaluacion, setTipoEvaluacion] = useState(0);

  const [paramsEnc, setParamsEnc] = useState(0);

  const { encuestaData } = usePostGeneral(tipoEvaluacion, endpoints.encuestas.getEncuestaContestar, "encuestaData");

  const { Resp1Data } = useGetGeneral(endpoints.encuestas.getResp1, "Resp1Data");

  const handleEvaluacion = useCallback((e) => () => {
    setParamsEnc(e);
    setTipoEvaluacion(e.encuesta);
  }, []);

  // console.log(encuestas)

  function formatText(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

  const router = useRouter();

  const { user } = useAuthContext();

  const insertData = useInsert(endpoints.encuestas.encuestaInsert);


  const methods = useForm({});

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

  const newData = encuestaData.map((item, index) => {
    const respKey = `resp_${index}`;

    return {
      ...item,
      idUsuario: user?.idUsuario,
      idEnc: encuestaData[0]?.idEncuesta,
      idArea: paramsEnc.beneficio,
      idEsp: paramsEnc.especialista,
      resp: data[respKey]
    };
  });

  try {
    await new Promise((resolve) => setTimeout(resolve));

    const insert = await insertData(newData);

    if (insert.estatus === true) {
      const update =  await updateEvaluacion(
        paramsEnc.idCita,
        paramsEnc.encuesta,
        user?.idUsuario,
      );

      if (update.result === true) {

      enqueueSnackbar(insert.msj, { variant: 'success' });
      resetForm();
      mutate(endpoints.encuestas.getEcuestaValidacion);
      router.replace(paths.dashboard.root);

      mutate();
      cerrar();

      }else{
        enqueueSnackbar(`¡No se pudó actualizar los datos!`, { variant: 'danger' });
      }

    } else {
      enqueueSnackbar(insert.msj, { variant: 'error' });
    }
  } catch (error) {
    console.error("Error en handleSubmit:", error);
    // enqueueSnackbar(`¡No se pudó actualizar los datos!`, { variant: 'danger' });
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

      {tipoEvaluacion === 0 ? (
        <>
          <DialogTitle sx={{ m: 0, p: 2, margin: '25px', textAlign: 'center' }} id="customized-dialog-title">
            Encuestas por contestar
          </DialogTitle>

          <Stack sx={{ mt: 0 }}>
            <DialogContent dividers sx={{ margin: '25px' }}>
              {encuestas.map((item, index) => (
                <>
                  <Typography variant="subtitle2" >
                    {item.primeraSesion === 0 ? (
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        Encuesta de primera sesión ({formatText(item.especialidad)} - {item.fecha})
                        <Button variant="contained" color="primary" key={item.idCita}
                          onClick={handleEvaluacion(
                            { idCita: item.idCita, especialista: item.idEspecialista, beneficio: item.idpuesto, encuesta: 1 }
                          )}>Contestar</Button>
                      </Box>
                    ) : null}
                  </Typography>
                  <Box mb={2} />
                  <Typography variant="subtitle2" >
                    {item.satisfaccion === 0 ? (
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        Encuesta de satisfacción ({formatText(item.especialidad)} - {item.fecha})
                        <Button variant="contained" color="primary"
                          onClick={handleEvaluacion(
                            { idCita: item.idCita, especialista: item.idEspecialista, beneficio: item.idpuesto, encuesta: 4 }
                          )}>Contestar</Button>
                      </Box>
                    ) : null}
                  </Typography>
                  <Box mb={2} />
                  <Typography variant="subtitle2" >
                    {item.reagenda === 0 ? (
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        Encuesta de reagenda ({formatText(item.especialidad)} - {item.fecha})
                        <Button variant="contained" color="primary"
                          onClick={handleEvaluacion(
                            { idCita: item.idCita, especialista: item.idEspecialista, beneficio: item.idpuesto, encuesta: 3 }
                          )}>Contestar</Button>
                      </Box>
                    ) : null}
                  </Typography>
                  <Box mb={2} />
                  <Typography variant="subtitle2" >
                    {item.cancelacion === 0 ? (
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        Encuesta de cancelación ({formatText(item.especialidad)} - {item.fecha})
                        <Button variant="contained" color="primary"
                          onClick={handleEvaluacion(
                            { idCita: item.idCita, especialista: item.idEspecialista, beneficio: item.idpuesto, encuesta: 2 }
                          )}>Contestar</Button>
                      </Box>
                    ) : null}
                  </Typography>
                  <Box mb={2} />
                </>
              ))}
            </DialogContent>
          </Stack>
        </>

      ) : (

        <Stack sx={{ mt: 0 }}>
          <DialogContent dividers >

            <FormProvider methods={methods} onSubmit={onSubmit} key={formKey}>

              <DialogTitle sx={{ m: 0, p: 2, margin: '25px', textAlign: 'center' }} id="customized-dialog-title">
                Encuesta
              </DialogTitle>

              {encuestaData.length > 0 ? (
                <>
                  <Stack sx={{ mt: 0 }} >
                    {encuestaData.map((item, index) => (
                      <>
                        <DialogContent style={{ fontWeight: 'bold', margin: '15px' }}>
                          {item.pregunta}
                        </DialogContent>

                        <DialogContent sx={{ margin: '15px' }}>
                        <Controller
                          name={`resp_${index}`}
                          control={methods.control}
                          render={({ field }) => (
                            <RadioGroup {...field} key={item.idPregunta}>
                              {Resp1Data.map((r1) =>
                                r1.grupo === item.respuestas ? (
                                  <li key={r1.id} style={{ marginBottom: '0px', listStyleType: 'none' }}>
                                    <FormControlLabel value={r1.value} control={<Radio />} label={r1.label} />
                                  </li>
                                ) : null
                              )}
                            </RadioGroup>
                          )}
                        />

                          {item.respuestas === "5" || item.respuestas === 5 && (
                            <RHFTextField name={`resp_${index}`} multiline rows={3} />
                          )}

                        </DialogContent>
                      </>
                    ))}

                  </Stack>

                  <DialogActions justifycontent="center" sx={{ justifyContent: 'center' }}>
                    <LoadingButton type="submit" variant="contained" color="success" loading={isSubmitting}>
                      Enviar
                    </LoadingButton>
                  </DialogActions>
                </>
              ) : (

                <Stack spacing={1} >
                  <Grid container sx={{ p: 5 }} justifyContent="center" alignItems="center">
                    <CircularProgress />
                  </Grid>
                </Stack>

              )}
            </FormProvider>
          </DialogContent>
        </Stack>
      )}
    </Dialog>
  );
}

EvaluateDialog.propTypes = {
  open: PropTypes.bool,
  encuestas: PropTypes.array,
  mutate: PropTypes.func,
  cerrar: PropTypes.func,
};
