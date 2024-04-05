import { mutate } from 'swr';
import { useState } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { useUpdate } from 'src/api/reportes';
import { useAuthContext } from 'src/auth/hooks';
import { useGetGeneral } from 'src/api/general';

import { useSnackbar } from 'src/components/snackbar';
import { Box } from '@mui/system';
// ----------------------------------------------------------------------

export default function ModalEditarOficinas({
  open,
  onClose,
  idHorario,
  especialista,
  horaInicio,
  horaFin,
  sabado,
  horaInicioSabado,
  horaFinSabado,
  estatus }) {

  const confirm = useBoolean();

  const { user } = useAuthContext();

  const updateEstatus = useUpdate(endpoints.gestor.updateOficina);

  const { sedesData } = useGetGeneral(endpoints.gestor.getSedes, "sedesData");

  const { enqueueSnackbar } = useSnackbar();

  const [est, setEst] = useState(estatus);

  /*   const [ofic, setOfi] = useState(oficina);
  
    const [ubic, setUbi] = useState(ubicación);
  
    const [sed, setSed] = useState(sede); */

  /* const handleChange = (event) => {
    setEst(event.target.value);
  }

  const handleOfi = (event) => {
    setOfi(event.target.value);
  }

  const handleSed = (event) => {
    setSed(event.target.value);
  }

  const handleUbi = (event) => {
    setUbi(event.target.value);
  }

  const handleEstatus = async (data) => {

    try {

      onClose();

      const update = await updateEstatus(data);

      if (update.estatus === true) {
        enqueueSnackbar(update.msj, { variant: 'success' });

        mutate(endpoints.gestor.getOfi);

      } else {
        enqueueSnackbar(update.msj, { variant: 'error' });
      }

    } catch (error) {
      console.error("Error en handleEstatus:", error);
      enqueueSnackbar(`¡No se pudieron actualizar los datos!`, { variant: 'danger' });
    }

  } */

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >

      <Stack spacing={1} >

        <DialogTitle>
          Edición de horario
          <Box>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Especialista: {especialista}
            </Typography>
          </Box>
        </DialogTitle>


        <FormControl spacing={3} sx={{ p: 3 }}>

          {/* <TextField
            id="outlined-basic"
            label="Oficina"
            variant="outlined"
            value={ofic}
            onChange={(e) => handleOfi(e)}
            sx={{ mb: 3 }}
          /> */}

          <FormControl >
            <InputLabel spacing={3} sx={{ p: 0 }} id="demo-simple-select-label">Sede</InputLabel>
            {/* <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Modalidad"
              value={sed}
              onChange={(e) => handleSed(e)}
              sx={{ mb: 3 }}
            >
              {sedesData.map((i) => (
                  <MenuItem key={i.idSede} value={i.idSede}>
                    {i.sede}
                  </MenuItem>
              ))}
            </Select> */}
          </FormControl>

          {/* <TextField
            id="outlined-basic"
            label="Ubicación"
            variant="outlined"
            value={ubic}
            onChange={(e) => handleUbi(e)}
            sx={{ mb: 3 }}
          /> */}

          <FormControl >
            <InputLabel spacing={3} sx={{ p: 0 }} id="demo-simple-select-label">Estatus</InputLabel>
            {/* <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Estatus"
              value={est}
              onChange={(e) => handleChange(e)}
              sx={{ mb: 3 }}
            >
              <MenuItem value={1}>
                Activa
              </MenuItem>
              <MenuItem value={0}>
                Inactiva
              </MenuItem>
            </Select> */}
          </FormControl>

        </FormControl>

      </Stack>

      <DialogActions>
        <Button variant="contained" color="error" onClick={onClose}>
          Cerrar
        </Button>
        <Button variant="contained" color="success" onClick={() => {
          /* handleEstatus(
            {
              'idOfi': idOficina,
              'ofi': ofic,
              'idSede': sed,
              'ubi': ubic,
              'estatus': est,
              'modificadoPor': user.idUsuario,
            }); */
          confirm.onFalse();
        }}>
          Guardar
        </Button>
      </DialogActions>

    </Dialog>

  );
}

ModalEditarOficinas.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  idHorario: PropTypes.any,
  especialista: PropTypes.any,
  horaInicio: PropTypes.any,
  horaFin: PropTypes.any,
  sabado: PropTypes.any,
  horaInicioSabado: PropTypes.any,
  horaFinSabado: PropTypes.any,
  estatus: PropTypes.any,
};
