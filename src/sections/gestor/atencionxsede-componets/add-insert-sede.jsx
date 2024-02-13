import { useState } from 'react';
import PropTypes from 'prop-types';
// import { useFieldArray, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
// import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';

// import { useBoolean } from 'src/hooks/use-boolean';

// import { endpoints } from 'src/utils/axios';

import { useAuthContext } from 'src/auth/hooks';
// import { useGetGeneral } from 'src/api/general';

// import Iconify from 'src/components/iconify';
import { RHFSelect } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function AddInsertSede({ idSede, especiaData, oficinaData, modalidadesData, handleEsp, handleMod }) {

  const { user } = useAuthContext();

  // const { control } = useFormContext();

  const [select, setSelect] = useState(0);

  const [mod, setMod] = useState(0);

  const [esp, setEsp] = useState(0);

  const [bol, setBol] = useState(false);

  // const { fields, append, remove } = useFieldArray({
  //   control,
  //   name: 'items',
  // });

  // const { append, remove } = useFieldArray({
  //   control,
  //   name: 'items',
  // });

  // const handleAdd = () => {
  //   append({
  //     especialista: '',
  //     sede: idSede,
  //     usuario: user.idUsuario,
  //   });
  // };

  // const handleRemove = (index) => {
  //   remove(index);
  // };

  const handleChangeOfi = (e) => {
    setSelect(e.target.value);

    if (e.target.value === 9) {
      setBol(false);
      handleMod({
        modalidad: 2,
        sede: idSede,
        usuario: user.idUsuario,
        oficina: e.target.value,
      });
    } else {
      setBol(true);
    }

    /* handleOfi({ oficina: e.target.value }); */
  }

  const handleChangeMod = (e) => {
    setMod(e.target.value);
    handleMod({
      modalidad: e.target.value,
      sede: idSede,
      usuario: user.idUsuario,
      oficina: select,
    });
  }

  const handleChangeEsp = (e) => {
    setEsp(e.target.value);
    handleEsp({especialista: e.target.value});
  }

  return (
    <Box sx={{ p: 3 }}>

      <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
        {/*  {fields.map((item, index) => ( */}
        <Stack alignItems="flex-end" spacing={1.5}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: 1 }}>

            <RHFSelect
              name='oficina'
              size="small"
              label="Oficina"
              value={select}
              InputLabelProps={{ shrink: true }}
              onChange={(e) => handleChangeOfi(e)}
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
              name='especialista'
              size="small"
              label="Especialista"
              InputLabelProps={{ shrink: true }}
              value={esp}
              onChange={(e) => handleChangeEsp(e)}
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

            {bol !== false ? (
              <RHFSelect
                name='modalidad'
                size="small"
                label="Modalidad"
                InputLabelProps={{ shrink: true }}
                value={mod}
                onChange={(e) => handleChangeMod(e)}
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
            ) : (
              null
            )}

          </Stack>

          {/* <Button
              size="small"
              color="error"
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              onClick={() => handleRemove(index)}
            >
              Remover
            </Button> */}
        </Stack>
        {/* ))} */}
      </Stack>

      {/* <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

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

      </Stack> */}
    </Box>
  );
}

AddInsertSede.propTypes = {
  idSede: PropTypes.any,
  oficinaData: PropTypes.any,
  especiaData: PropTypes.any,
  modalidadesData: PropTypes.any,
  handleEsp: PropTypes.any,
  handleMod: PropTypes.any,
};
