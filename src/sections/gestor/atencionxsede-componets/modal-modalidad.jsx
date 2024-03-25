import { mutate } from 'swr';
import { useState } from 'react';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { useUpdate, useCheckModalidades } from 'src/api/reportes';
// import { useGetGeneral } from 'src/api/general';

import { useSnackbar } from 'src/components/snackbar';
// ----------------------------------------------------------------------

export default function ModalModalidad({ open, onClose, id, est, estatusVal, modalidadesData, idOficina, tipoCita, idEspecialista, idArea }) {

  const confirm = useBoolean();

  const { enqueueSnackbar } = useSnackbar();

  const [estatus, setEstatus] = useState('');

  const handleChange = (event) => {
    setEstatus(event.target.value);
  }

  const updateEstatus = useUpdate(endpoints.gestor.updateModalidad);
  const { checkModalidades } = useCheckModalidades(idEspecialista, idOficina, tipoCita, idArea);

  const handleEstatus = async (i) => {

    try {

      const data = {
        'idDetallePnt': id,
        'modalidad': i,
      };

      if (data?.modalidad !== '') {

        onClose();

        const update = await updateEstatus(data);

        if (update.result === true) {
          enqueueSnackbar(update.msg, { variant: 'success' });

          mutate(endpoints.gestor.getAtencionXsede);
          mutate(endpoints.gestor.getAtencionXsedeEsp);

        } else {
          enqueueSnackbar(update.msg, { variant: 'error' });
        }

      } else {
        enqueueSnackbar(`¡No se selecciono alguna opción!`, { variant: 'danger' });
      }

    } catch (error) {
      console.error("Error en handleEstatus:", error);
      enqueueSnackbar(`¡No se pudieron actualizar los datos de usuario!`, { variant: 'danger' });
    }

  }

  return (
    <>
      {!isEmpty(checkModalidades) ? (
        <>
          {checkModalidades?.result ?
            (<Stack spacing={1} >

              <DialogTitle>¿Estás seguro que deseas cambiar la modalidad?</DialogTitle>

              <FormControl spacing={3} sx={{ p: 3 }}>

                <InputLabel spacing={3} sx={{ p: 3 }} id="demo-simple-select-label">Modalidad</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="Modalidad"
                  value={estatus}
                  onChange={(e) => handleChange(e)}
                >
                  {modalidadesData.map((i) => (
                    i.modalidad === estatusVal ? null : (
                      <MenuItem key={i.idOpcion} value={i.idOpcion}>
                        {i.modalidad}
                      </MenuItem>
                    )
                  ))}
                </Select>

              </FormControl>

            </Stack>)
            : <DialogTitle>{checkModalidades?.msg}</DialogTitle>}


          <DialogActions>
            <Button variant="contained" color="error" onClick={onClose}>
              Cerrar
            </Button>
            {checkModalidades?.result ?
              <Button variant="contained" color="success" onClick={() => {
                handleEstatus(estatus);
                confirm.onFalse();
              }}>
                Guardar
              </Button>
              : ''}
          </DialogActions>
        </>
      ) : (

        <Grid container sx={{ p: 5 }} justifyContent="center" alignItems="center">
          <CircularProgress />
        </Grid>

      )}
    </>
  );
}

ModalModalidad.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  id: PropTypes.any,
  est: PropTypes.number,
  estatusVal: PropTypes.string,
  modalidadesData: PropTypes.any,
  idOficina: PropTypes.number,
  tipoCita: PropTypes.number,
  idEspecialista: PropTypes.number,
  idArea: PropTypes.number
};
