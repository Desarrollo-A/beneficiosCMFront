import * as Yup from 'yup';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { useGetGeneral, useInsertGeneral } from 'src/api/general';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect} from 'src/components/hook-form';

import InvoiceNewEditDetails from './crear-nueva-ecuesta-detalles';

// ----------------------------------------------------------------------

export default function InvoiceNewEditForm({ currentInvoice }) {

  const { enqueueSnackbar } = useSnackbar();

  const { areasData } = useGetGeneral(endpoints.encuestas.getPuestos, "areasData");

  const insertData = useInsertGeneral(endpoints.encuestas.encuestaCreate);

  const router = useRouter();

  const loadingSend = useBoolean();

  const NewInvoiceSchema = Yup.object().shape({
    area: Yup.mixed().nullable().required('Is required'),
    items: Yup.mixed().nullable().required('Is required'),
  });

/*   const defaultValues = useMemo(
    () => ({
      area:currentInvoice?.area || '',
      items: currentInvoice?.items || [
        {
          pregunta: null,
          respuesta: null,
        },
      ],
    }),
    [currentInvoice]
  ); */

  const methods = useForm({
    resolver: yupResolver(NewInvoiceSchema),
/*     defaultValues, */
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

  const handleCreateAndSend = handleSubmit(async (data) => {
    /* loadingSend.onTrue(); */

    /* console.log(data); */

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      loadingSend.onFalse();

      const insert = await insertData(data);
      router.push(paths.dashboard.encuestas.crear);

      if (insert.estatus===200) {
        enqueueSnackbar(insert.mensaje, { variant: 'success' });
        resetForm();
      } else {
        enqueueSnackbar(insert.mensaje, { variant: 'error' });
      }

    } catch (error) {
      console.error(error);
      loadingSend.onFalse();
    }
    
  });

  return (
    <FormProvider methods={methods} key={formKey}>

      <Card>

      <Box sx={{ p: 3 }}>

      <Typography variant="h6" sx={{ color: 'text.disabled', mb: 3 }}>
        Preguntas:
      </Typography>

      <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>

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
      </Stack>

      <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

      </Box>

        <InvoiceNewEditDetails />

      </Card>

      <Stack justifyContent="flex-end" direction="row" spacing={2} sx={{ mt: 3 }}>

        <LoadingButton
          size="large"
          variant="contained"
          loading={loadingSend.value && isSubmitting}
          onClick={handleCreateAndSend}
        >
          Crear
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}

InvoiceNewEditForm.propTypes = {
  currentInvoice: PropTypes.object,
};
