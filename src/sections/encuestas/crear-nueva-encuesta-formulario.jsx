import * as Yup from 'yup';
import { mutate } from 'swr';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { useInsert } from 'src/api/encuestas';
import { useAuthContext } from 'src/auth/hooks';

import FormProvider from 'src/components/hook-form';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

import InvoiceNewEditDetails from './crear-nueva-ecuesta-detalles';

// ----------------------------------------------------------------------

export default function InvoiceNewEditForm() {

  const { user } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();

  const insertData = useInsert(endpoints.encuestas.encuestaCreate);

  const router = useRouter();

  const loadingSend = useBoolean();

  const NewInvoiceSchema = Yup.object().shape({
    /* area: Yup.mixed().nullable().required('Is required'), */
    items: Yup.mixed().nullable().required('Is required'),
  });

  const defaultValues = useMemo(
    () => ({
      area: user.idPuesto
    }),
    [user.idPuesto]
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

  const handleCreateAndSend = handleSubmit(async (data, est) => {

    const estatus = {estatus: est}

    const dataValue = {
      ...estatus,
      ...data
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
          mutate(endpoints.encuestas.getEncNotificacion);
          mutate(endpoints.encuestas.getEstatusUno);

        } else {
          enqueueSnackbar(insert.msj, { variant: 'error' });
        }

      } catch (error) {
        console.error(error);
        loadingSend.onFalse();
      }

    } else {
      enqueueSnackbar("Faltan Datos", { variant: 'error' });
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

          {/* <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>

            <RHFSelect
              name="area"
              size="small"
              label="Área"
              InputLabelProps={{ shrink: true }}
              sx={{
                maxWidth: { md: 160 },
              }}
            >
              <Divider sx={{ borderStyle: 'dashed' }} />

              {areasData.map((res) => (
                <MenuItem
                  key={res.idPuesto}
                  value={res.idPuesto}
                >
                  {res.puesto}
                </MenuItem>
              ))}
            </RHFSelect>
            </Stack> */}

          <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

        </Box>

        <InvoiceNewEditDetails />

      </Card>

        <Stack justifyContent="flex-end" direction="row" spacing={2} sx={{ mt: 3 }}>

          <LoadingButton
            size="large"
            variant="contained"
            loading={loadingSend.value && isSubmitting}
            onClick={() => {
              confirm.onTrue();
            }}
          >
            Crear
          </LoadingButton>
        </Stack>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="¿Deseas activar la encuesta?"
        action={
          <>
          <Button variant="contained" onClick={() => {
            handleCreateAndSend(1);
            confirm.onFalse();
          }}>
            Si
          </Button>
          <Button variant="contained" onClick={() => {
            confirm.onFalse();
            handleCreateAndSend(0);
          }}>
            No
          </Button>
          </>
        }
      />

    </FormProvider >
  );
}

InvoiceNewEditForm.propTypes = {
};
