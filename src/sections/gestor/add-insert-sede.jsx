import { useFieldArray, useFormContext } from 'react-hook-form';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';

import { useAuthContext } from 'src/auth/hooks';

import { endpoints } from 'src/utils/axios';

import { useGetGeneral } from 'src/api/general';

import Iconify from 'src/components/iconify';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function AddInsertSede({idSede, especiaData, oficinaData, modalidadesData}) {

  const { user } = useAuthContext();

  const { respuestasData } = useGetGeneral(endpoints.encuestas.getRespuestas, "respuestasData");

  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const handleAdd = () => {
    append({
      oficina: '',
      especialista: '',
      modalidad: '',
      sede: idSede,
      usuario: user.idUsuario,
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

              <RHFSelect
                name={`items[${index}].oficina`}
                size="small"
                label="Oficina"
                InputLabelProps={{ shrink: true }}
              >

                <Divider sx={{ borderStyle: 'dashed' }} />

                {oficinaData.map((i) => (
                  <MenuItem
                    key={i.idOficina}
                    value={i.idOficina}
                  >
                    {i.oficina}
                  </MenuItem>
                ))}
              </RHFSelect>

              <RHFSelect
                name={`items[${index}].especialista`}
                size="small"
                label="Especialista"
                InputLabelProps={{ shrink: true }}
              >

                <Divider sx={{ borderStyle: 'dashed' }} />

                {especiaData.map((i) => (
                  <MenuItem
                    key={i.idUsuario}
                    value={i.idUsuario}
                  >
                    {i.nombre}
                  </MenuItem>
                ))}
              </RHFSelect>

              <RHFSelect
                name={`items[${index}].modalidad`}
                size="small"
                label="Modalidad"
                InputLabelProps={{ shrink: true }}
              >

                <Divider sx={{ borderStyle: 'dashed' }} />

                {modalidadesData.map((i) => (
                  <MenuItem
                    key={i.idOpcion}
                    value={i.idOpcion}
                  >
                    {i.modalidad}
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
          Agregar registro
        </Button>

      </Stack>
    </Box>
  );
}

AddInsertSede.propTypes = {
  idSede: PropTypes.any,
  oficinaData:PropTypes.any,
  especiaData:PropTypes.any,
  modalidadesData:PropTypes.any,
};
