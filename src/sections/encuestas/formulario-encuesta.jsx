import { mutate } from 'swr';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { endpoints } from 'src/utils/axios';

import { useAuthContext } from 'src/auth/hooks';
import { /* usePost, */ useInsert } from 'src/api/encuestas';
import { useGetGeneral, usePostGeneral } from 'src/api/general';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFRadioGroup } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function FormularioEncuesta() {
  const [searchParams] = useSearchParams();

  const idEncuesta = searchParams.get('idEncuesta');

  const router = useRouter();

  const { user } = useAuthContext();

  /* const array = [idEncuesta, user?.idUsuario]; */

  /* const validarData = usePost(array, endpoints.encuestas.getEcuestaValidacion, "validarData"); */

  const { encuestaData } = usePostGeneral(
    idEncuesta,
    endpoints.encuestas.getEncuesta,
    'encuestaData'
  );

  const { Resp1Data } = useGetGeneral(endpoints.encuestas.getResp1, 'Resp1Data');

  const { Resp2Data } = useGetGeneral(endpoints.encuestas.getResp2, 'Resp2Data');

  const { Resp3Data } = useGetGeneral(endpoints.encuestas.getResp3, 'Resp3Data');

  const { Resp4Data } = useGetGeneral(endpoints.encuestas.getResp4, 'Resp4Data');

  const insertData = useInsert(endpoints.encuestas.encuestaInsert);

  const { enqueueSnackbar } = useSnackbar();

  /* let validacion; */

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
        idEnc: idEncuesta,
        idArea: encuestaData[0]?.idArea,
        resp: data[respKey],
      };
    });

    try {
      await new Promise((resolve) => setTimeout(resolve));

      const insert = await insertData(newData);

      console.log(newData);

      if (insert.estatus === true) {
        enqueueSnackbar(insert.msj, { variant: 'success' });
        resetForm();
        mutate(endpoints.encuestas.getEcuestaValidacion);
        router.replace(paths.dashboard.root);
      } else {
        enqueueSnackbar(insert.msj, { variant: 'error' });
      }
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      enqueueSnackbar(`Error en actualizar los datos!`, { variant: 'danger' });
    }
  });

  return (
    /*  validarData.validarData === true && validacion === true ? ( */

    <FormProvider methods={methods} onSubmit={onSubmit} key={formKey}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <Card sx={{ p: 3 }}>
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
                  <Typography variant="subtitle2">{item.pregunta}</Typography>

                  {item.respuestas === '1' ||
                    (item.respuestas === 1 && (
                      <RHFRadioGroup row spacing={4} name={`resp_${index}`} options={Resp1Data} />
                    ))}

                  {item.respuestas === '2' ||
                    (item.respuestas === 2 && (
                      <RHFRadioGroup row spacing={4} name={`resp_${index}`} options={Resp2Data} />
                    ))}

                  {item.respuestas === '3' ||
                    (item.respuestas === 3 && (
                      <RHFRadioGroup row spacing={4} name={`resp_${index}`} options={Resp3Data} />
                    ))}

                  {item.respuestas === '4' ||
                    (item.respuestas === 4 && (
                      <RHFRadioGroup row spacing={4} name={`resp_${index}`} options={Resp4Data} />
                    ))}

                  {item.respuestas === '5' ||
                    (item.respuestas === 5 && (
                      <RHFTextField name={`resp_${index}`} multiline rows={4} />
                    ))}

                  {/* {item.respuestas === "6" || item.respuestas === 6 && (
                      <RHFTextField name={`resp_${index}`} multiline rows={4} />
                    )} */}

                  {/* <Controller
                    name={`pgt_${index}`}
                    defaultValue={item.pregunta}
                    render={({ field }) =>
                    <RHFTextField sx={{ display: { xl: 'none', xs: 'block' } }} name={`resp_${index}`} defaultValue={item.pregunta}  onChange={
                      (value) => field.onChange(value)
                  }/>
                    }
                  /> */}
                </Stack>
              ))}
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Enviar
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
    /* ) : (
      <Typography variant="subtitle2">
        No disponible
      </Typography>
    ) */
  );
}

FormularioEncuesta.propTypes = {};
