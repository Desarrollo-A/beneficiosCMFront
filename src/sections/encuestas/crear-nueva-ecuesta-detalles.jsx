import { useFieldArray, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';

import { endpoints } from 'src/utils/axios';

import { useGetGeneral } from 'src/api/general';

import Iconify from 'src/components/iconify';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function InvoiceNewEditDetails() {

  const { respuestasData } = useGetGeneral(endpoints.encuestas.getRespuestas, "respuestasData");

  const { minEncuestaData } = useGetGeneral(endpoints.encuestas.encuestaMinima, "minEncuestaData");

  const minEnc = parseInt(minEncuestaData.map((u) => (u.minIdEncuesta)), 10) + 1;

  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const handleAdd = () => {
    append({
      pregunta: '',
      respuesta: '',
      idEncuesta: minEnc,
    });
  };

  const handleRemove = (index) => {
    remove(index);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 2.5 },
        }} divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>

        {fields.map((item, index) => (
          <Stack key={item.id} >
            <Grid container spacing={3} disableEqualOverflow>
              <Grid xs={9} md={9}>
                <RHFTextField
                  size="small"
                  name={`items[${index}].pregunta`}
                  label="Pregunta"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid xs={3} md={3}>
                <RHFSelect
                  name={`items[${index}].respuesta`}
                  size="small"
                  label="Respuestas"
                  InputLabelProps={{ shrink: true }}
                >

                  <Divider sx={{ borderStyle: 'dashed' }} />

                  {respuestasData.map((res) => (
                    <MenuItem
                      key={res.idOpcion}
                      value={res.idOpcion}
                    >
                      {res.nombre}
                    </MenuItem>
                  ))}
                </RHFSelect>

              </Grid></Grid>

            <Grid xs={3} md={3}>
              <Button
                size="small"
                color="error"
                variant="contained"
                startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                onClick={() => handleRemove(index)}
                sx={{
                  p: 1,
                  my: 1
                }}
              >
                Remover
              </Button>
            </Grid>

          </Stack>
        ))}
      </Stack>

      <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

      <Stack
        spacing={3}
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-end', md: 'center' }}
      >
        <Button
          size="small"
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleAdd}
          sx={{ flexShrink: 0 }}
        >
          Agregar pregunta
        </Button>

      </Stack>
    </Box>
  );
}
