import { useFieldArray, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';

import { endpoints } from 'src/utils/axios';

import { useGetGeneral } from 'src/api/general';

import Iconify from 'src/components/iconify';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function InvoiceNewEditDetails() {

  const { respuestasData } = useGetGeneral(endpoints.encuestas.getRespuestas, "respuestasData");

  const { minEncuestaData } = useGetGeneral(endpoints.encuestas.encuestaMinima, "minEncuestaData");

  const minEnc = parseInt(minEncuestaData.map((u) => (u.minIdEncuesta)), 10)+1;

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

      <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
        {fields.map((item, index) => (
          <Stack key={item.id} alignItems="flex-end" spacing={1.5}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: 1 }}>
              <RHFTextField
                size="small"
                name={`items[${index}].pregunta`}
                label="Pregunta"
                InputLabelProps={{ shrink: true }}
              />

              <RHFSelect
                name={`items[${index}].respuesta`}
                size="small"
                label="Respuestas"
                InputLabelProps={{ shrink: true }}
                sx={{
                  maxWidth: { md: 160 },
                }}
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

            </Stack>

            <Button
              size="small"
              color="error"
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              onClick={() => handleRemove(index)}
            >
              Remover
            </Button>
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
          color="primary"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleAdd}
          sx={{ flexShrink: 0 }}
        >
          Agregar Pregunta
        </Button>

      </Stack>
    </Box>
  );
}
