import PropTypes from 'prop-types';
import { Base64 } from 'js-base64';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { endpoints } from 'src/utils/axios';

import { useGetGeneral, usePostGeneral, useInsertGeneral } from 'src/api/general';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
  RHFRadioGroup,
} from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function FormularioEncuesta({ idEncuesta }) {

  const router = useRouter();

  const idUser = JSON.parse(Base64.decode(sessionStorage.getItem('accessToken').split('.')[2]));

  const { encuestaData } = usePostGeneral(idEncuesta, endpoints.encuestas.getEncuesta, "encuestaData");

  const { Resp1Data } = useGetGeneral(endpoints.encuestas.getResp1, "Resp1Data");

  const { Resp2Data } = useGetGeneral(endpoints.encuestas.getResp2, "Resp2Data");

  const { Resp3Data } = useGetGeneral(endpoints.encuestas.getResp3, "Resp3Data");

  const { Resp4Data } = useGetGeneral(endpoints.encuestas.getResp4, "Resp4Data");

  const insertData = useInsertGeneral(endpoints.encuestas.encuestaInsert);

  const { enqueueSnackbar } = useSnackbar();

  /*   const NewUserSchema = Yup.object().shape({
      uno: Yup.string().required('* Requerido'),
      dos: Yup.string().required('* Requerido'),
      tres: Yup.string().required('* Requerido'),
      cuatro: Yup.string().required('* Requerido'),
      cinco: Yup.string().required('* Requerido'),
      seis: Yup.string().required('* Requerido'),
    }); */

  /*   const defaultValues = useMemo(
      () => ({
        uno: currentUser?.uno || '',
        dos: currentUser?.dos || '',
        tres: currentUser?.tres || '',
        cuatro: currentUser?.cuatro || '',
        cinco: currentUser?.cinco || '',
        seis: currentUser?.seis || '',
      }),
      [currentUser]
    ); */

  const methods = useForm({
    /*  resolver: yupResolver(NewUserSchema),
     defaultValues, */
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
        idUsuario:idUser.idUsuario,
        resp: data[respKey]
      };
    });

    try {
      await new Promise((resolve) => setTimeout(resolve));

      const insert = await insertData(newData);

      if (insert.estatus === 200) {
        enqueueSnackbar(insert.mensaje, { variant: 'success' });
        resetForm();
        
        router.push(paths.dashboard);

      } else {
        enqueueSnackbar(insert.mensaje, { variant: 'error' });
      }
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      enqueueSnackbar(`¡No se pudó actualizar los datos!`, { variant: 'danger' });
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit} key={formKey}>
      <Grid container spacing={3}>

        <Grid xs={12} md={12}>
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

                  <Typography variant="subtitle2" >
                    {item.pregunta}
                  </Typography>

                  {item.respuestas === "1" && (
                    <RHFRadioGroup row spacing={4} name={`resp_${index}`} options={Resp1Data} />
                  )}

                  {item.respuestas === "2" && (
                    <RHFRadioGroup row spacing={4} name={`resp_${index}`} options={Resp2Data} />
                  )}

                  {item.respuestas === "3" && (
                    <RHFRadioGroup row spacing={4} name={`resp_${index}`} options={Resp3Data} />
                  )}

                  {item.respuestas === "4" && (
                    <RHFRadioGroup row spacing={4} name={`resp_${index}`} options={Resp4Data} />
                  )}

                  {item.respuestas === "5" && (
                    <RHFTextField name={`resp_${index}`} />
                  )}

                  {item.respuestas === "6" && (
                    <RHFTextField name={`resp_${index}`} multiline rows={4} />
                  )}

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
  );
}

FormularioEncuesta.propTypes = {
  idEncuesta: PropTypes.number,
};