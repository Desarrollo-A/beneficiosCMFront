import { mutate } from 'swr';
import { useState } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import { TextField, Autocomplete } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { useUpdate, useGetAreas } from 'src/api/reportes';

import { useSnackbar } from 'src/components/snackbar';
// ----------------------------------------------------------------------

export default function ModalArea({ id, onClose, idArea }) {
  const confirm = useBoolean();

  const { enqueueSnackbar } = useSnackbar();

  const { areas, areasResult, areasMsg } = useGetAreas();

  const [ selectArea, setSelectArea ] = useState(null);

  const [ loadingBtn, setLoadingBtn ] = useState(false);

  const updateArea = useUpdate(endpoints.gestor.updateArea);

  const handleEstatus = async () => {
    setLoadingBtn(true);

    try {
      const data = {
        idDetallePnt: id,
        idArea: selectArea,
      };

      if (Number.isInteger(data?.idArea)) {

        const update = await updateArea(data);

        if (update.result === true) {
          onClose();
          enqueueSnackbar(update.msg, { variant: 'success' });

          mutate(endpoints.gestor.getAtencionXsede);
          mutate(endpoints.gestor.getAtencionXsedeEsp);
        } else {
          enqueueSnackbar(update.msg, { variant: 'error' });
          onClose();
        }
      } else {
        enqueueSnackbar(`¡No se selecciono alguna opción!`, { variant: 'error' });
        onClose();
      }
      setLoadingBtn(false);
    } catch (error) {
      enqueueSnackbar(`¡Error al actualizar el registro!`, { variant: 'error' });
      onClose();
    }

  };

  const handleChange = (e, value, reason) => {
   if(reason === 'clear')
        setSelectArea(null);
    else
        setSelectArea(value?.value);
  };

  const handleKeyDown = async () => {
    setSelectArea(null);
  };

  return (
    <>
      {areasResult ? (
        <Stack spacing={1}>
          <DialogTitle>¿Estás seguro que deseas cambiar el área?</DialogTitle>

          <FormControl spacing={3} sx={{ p: 3 }}>
            <Autocomplete
              id="area"
              name="area"
              noOptionsText='Sin opciones'
              isOptionEqualToValue={(option, value) => option.value === value.value}
              getOptionDisabled={(option) => option.value === idArea}
              onChange={(e, value, reason) => handleChange(e, value, reason)}
              onKeyDown={(e) => {
                handleKeyDown();
              }}
              options={areas?.map((i) => ({
                key: i,
                value: i.idArea,
                label: i.nombre,
              }))}
              renderInput={(params) => (
                <TextField
                  variant="outlined"
                  {...params}
                  label="Selecciona un área"
                  placeholder="Área"
                />
              )}
            />
          </FormControl>
          
        </Stack>
      ) : (
        <DialogTitle>{areasMsg}</DialogTitle>
      )}

      <DialogActions>
        <Button variant="contained" color="error" onClick={onClose}>
          Cerrar
        </Button>
        {areasResult ? (
          <LoadingButton
            variant="contained"
            color="success"
            loading={loadingBtn}
            disabled={!Number.isInteger(selectArea)}
            onClick={() => {
              handleEstatus();
              confirm.onFalse();
            }}
          >
            Guardar
          </LoadingButton>
        ) : (
          ''
        )}
      </DialogActions>
    </>
  );
}

ModalArea.propTypes = {
  onClose: PropTypes.func,
  id: PropTypes.any,
  idArea: PropTypes.number,
};
