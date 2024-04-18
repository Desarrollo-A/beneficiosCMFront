import { useState } from 'react';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { enqueueSnackbar } from 'notistack';
import Dialog from '@material-ui/core/Dialog';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import { createTheme, ThemeProvider } from '@mui/material/styles';

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
  const { especialista, beneficio, idEspecialista, idEncuesta, id, estatus, idDetalle, idEventoGoogle } = pendiente;

  const lightTheme = createTheme({
    palette: {
      mode: 'light',
    },
    components: {
      MuiPickersDay: {
        // Sobrescribe los estilos del día del calendario
        styleOverrides: {
          root: {
            color: 'black', // Establece el color del día a negro
          },
        },
      },
    },
  });

  const { user: datosUser } = useAuthContext();

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

      if (insert.estatus === true /* && update.result */) {

        await updateAppointment(
          datosUser.idUsuario,
          id,
          estatus,
          idDetalle,
          idEncuesta,
          idEventoGoogle
        );

        enqueueSnackbar(insert.msj, { variant: 'success' });
        resetForm();
        mutate(endpoints.encuestas.getEcuestaValidacion);
        router.replace(paths.dashboard.root);

        if (mutate) mutate();
        if (cerrar) cerrar();

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

      <DialogTitle sx={{ m: 0, p: 2, margin: '25px', textAlign: 'center' }} id="customized-dialog-title">
        ENCUESTA DE SATISFACCIÓN {beneficio.toUpperCase()}
        <Typography variant="subtitle2" >
           ESPECIALISTA: {especialista}
        </Typography>
      </DialogTitle>

      {!isEmpty(encuestaData) ? (

        <Stack sx={{ mt: 0 }}>
          <DialogContent dividers sx={{margin: '25px'}}>

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
                          <RHFRadioGroup row sx={{
                            display: 'grid',
                            columnGap: 1,
                            rowGap: 1,
                            m: 1,
                            gridTemplateColumns: 'repeat(3, 1fr)',
                          }} name={`resp_${index}`} options={Resp1Data} />
                        )}
                        
                        {item.respuestas === "2" || item.respuestas === 2 && (
                          <RHFRadioGroup row spacing={4} name={`resp_${index}`} options={Resp2Data} />
                        )}

                        {item.respuestas === "3" || item.respuestas === 3 && (
                          <RHFRadioGroup row sx={{ m: 2 }} spacing={4} name={`resp_${index}`} options={Resp3Data} />
                        )}

                        {item.respuestas === "4" || item.respuestas === 4 && (
                          <RHFRadioGroup row sx={{ m: 1 }} name={`resp_${index}`} options={Resp4Data} />
                        )}

                        {item.respuestas === "5" || item.respuestas === 5 && (
                          <ThemeProvider theme={lightTheme}>
                          <RHFTextField name={`resp_${index}`} multiline rows={3} />
                          </ThemeProvider>
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
