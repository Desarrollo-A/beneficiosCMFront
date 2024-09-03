import * as Yup from 'yup';
import { mutate } from 'swr';
import { isEmpty } from 'lodash';
// import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { useInsert } from 'src/api/encuestas';
import { useGetGeneral } from 'src/api/general';
import { useAuthContext } from 'src/auth/hooks';

import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import FormProvider, { RHFSelect } from 'src/components/hook-form';

import InvoiceNewEditDetails from './crear-nueva-ecuesta-detalles';

// ----------------------------------------------------------------------

export default function InvoiceNewEditForm() {
  const { user } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();

  const insertData = useInsert(endpoints.encuestas.encuestaCreate);

  const { tipoEncData } = useGetGeneral(endpoints.encuestas.tipoEncuesta, 'tipoEncData');

  const [btnLoad, setBtnLoad] = useState(false);

  const router = useRouter();

  const loadingSend = useBoolean();

  const NewInvoiceSchema = Yup.object().shape({
    /* area: Yup.mixed().nullable().required('Is required'), */
    items: Yup.mixed().nullable().required('Is required'),
  });

  const defaultValues = useMemo(
    () => ({
      area: user?.idPuesto,
    }),
    [user?.idPuesto]
  );

  const methods = useForm({
    resolver: yupResolver(NewInvoiceSchema),
    defaultValues,
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

  const rol = user?.idRol;

  const handleCreateAndSend = handleSubmit(async (data, est) => {
    const estatus = { estatus: est };

    const dataValue = {
      ...estatus,
      ...data,
    };

    if (!isEmpty(dataValue.items)) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        loadingSend.onFalse();

        const insert = await insertData(dataValue);

        if (insert.estatus === true) {
          enqueueSnackbar(insert.msj, { variant: 'success' });
          resetForm();

          router.push(paths.dashboard.encuestas.ver);
          mutate(endpoints.encuestas.encuestaMinima);
          mutate(endpoints.encuestas.getEstatusUno);

          setBtnLoad(false);
        } else {
          enqueueSnackbar(insert.msj, { variant: 'error' });

          setBtnLoad(false);
        }
      } catch (error) {
        console.error(error);
        loadingSend.onFalse();

        setBtnLoad(false);
      }
    } else {
      enqueueSnackbar('Faltan datos', { variant: 'error' });

      setBtnLoad(false);
    }
  });

  const confirm = useBoolean();

  return (
    <FormProvider methods={methods} key={formKey}>
      <Card>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ color: 'text.disabled', mb: 3 }}>
            Preguntas:
          </Typography>

          <Stack
            sx={{
              p: 2.5,
              pr: { xs: 2.5, md: 2.5 },
            }}
            divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}
            spacing={3}
          >
            <Grid container spacing={3} disableEqualOverflow>
              <Grid xs={12} md={12}>
                {rol === 4 ? (
                  <RHFSelect
                    name="tipoEncuesta"
                    size="small"
                    label="Tipo de encuesta"
                    InputLabelProps={{ shrink: true }}
                  >
                    {tipoEncData.map((res) => (
                      <MenuItem key={res.id} value={res.id}>
                        {res.nombre}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                ) : null}
              </Grid>

              <Grid xs={12}>
                <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
              </Grid>
            </Grid>
          </Stack>
        </Box>

        <InvoiceNewEditDetails />
      </Card>

      <Stack justifyContent="flex-end" direction="row" spacing={2} sx={{ mt: 3 }}>
        <LoadingButton
          size="large"
          variant="contained"
          color="success"
          loading={loadingSend.value && isSubmitting}
          onClick={() => {
            confirm.onTrue();
          }}
        >
          Crear encuesta
        </LoadingButton>
      </Stack>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="¿Deseas activar la encuesta?"
        action={
          <>
            <Button
              variant="contained"
              color="error"
              loading={btnLoad}
              onClick={() => {
                setBtnLoad(true);
                confirm.onFalse();
                handleCreateAndSend(0);
              }}
            >
              No
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                handleCreateAndSend(1);
                confirm.onFalse();
              }}
            >
              Si
            </Button>
          </>
        }
      />
    </FormProvider>
  );
}

InvoiceNewEditForm.propTypes = {};
