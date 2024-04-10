import 'dayjs/locale/es';
import dayjs from 'dayjs';
import { mutate } from 'swr';
import { useState } from 'react';
import { format } from 'date-fns';
import PropTypes from 'prop-types';

import { Box } from '@mui/system';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import { MobileTimePicker } from '@mui/x-date-pickers';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { useUpdate } from 'src/api/reportes';
import { useAuthContext } from 'src/auth/hooks';

import { useSnackbar } from 'src/components/snackbar';
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
  horaFinSabado
 }) {

  const confirm = useBoolean();

  dayjs.locale('es');

  const { enqueueSnackbar } = useSnackbar();

  const esp = {
    // idioma de los botones
    okButtonLabel: 'Seleccionar',
    cancelButtonLabel: 'Cancelar',
    datePickerToolbarTitle: 'Selecciona una fecha',
    timePickerToolbarTitle: 'Selecciona un horario',
  };

  const { user } = useAuthContext();

  const [isChecked, setIsChecked] = useState(sabado !== 0);

  // Función para manejar el cambio de estado del checkbox
  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);

    if(event.target.checked === false){
    setInicioSabado(null);
    setFinSabado(null);
    }

  };

  const updateHorario = useUpdate(endpoints.gestor.updateHorario);

  const [inicio, setInicio] = useState(horaInicio);

  const [fin, setFin] = useState(horaFin);

  const [inicioSabado, setInicioSabado] = useState(isChecked === true ? horaInicioSabado : null);

  const [finSabado, setFinSabado] = useState(isChecked === true ? horaFinSabado : null);

  const handleInicio = (timeValue) => {
    setInicio(format(timeValue, 'HH:mm'));
  }

  const handleFin = (timeValue) => {
    setFin(format(timeValue, 'HH:mm'));
  }

  const handleInicioSabado = (timeValue) => {
    setInicioSabado(format(timeValue, 'HH:mm'));
  }

  const handleFinSabado = (timeValue) => {
    setFinSabado(format(timeValue, 'HH:mm'));
  }

  const handleHorario = async (data) => {

    console.log(data)

    try {

      onClose();

      const update = await updateHorario(data);

      if (update.estatus === true) {
        enqueueSnackbar(update.msj, { variant: 'success' });

        mutate(endpoints.gestor.getHorariosEspecificos);

      } else {
        enqueueSnackbar(update.msj, { variant: 'error' });
      }

    } catch (error) {
      console.error("Error en handleHorario:", error);
      enqueueSnackbar(`¡No se pudieron actualizar los datos!`, { variant: 'danger' });
    }

  }

  const defaultValueInicio = new Date(`1970-01-01T${horaInicio}`);

  const defaultValueFinal = new Date(`1970-01-01T${horaFin}`);

  const defaultValueSbInicio = isChecked === true ? new Date(`1970-01-01T${horaInicioSabado}`) : null;

  const defaultValueSbFinal = isChecked === true ? new Date(`1970-01-01T${horaFinSabado}`) : null;

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

        <DialogContent>

          <Box sx={{ marginBottom: '16px' }}>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Horario entre semana
            </Typography>
          </Box>

          <LocalizationProvider localeText={esp}>
            <Box sx={{ marginBottom: '16px' }}>
              <MobileTimePicker
                sx={{ width: '100%' }}
                label="Hora de inicio"
                defaultValue={defaultValueInicio}
                onChange={handleInicio}
              />
            </Box>
          </LocalizationProvider>

          <LocalizationProvider localeText={esp}>
            <Box sx={{ marginBottom: '16px' }}>
              <MobileTimePicker
                sx={{ width: '100%' }}
                label="Hora de final"
                defaultValue={defaultValueFinal}
                onChange={handleFin}
              />
            </Box>
          </LocalizationProvider>

          <Box sx={{ marginBottom: '16px' }}>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Horario sabatino
            </Typography>
          </Box>

          <FormGroup sx={{ marginBottom: '16px' }}>
            <FormControlLabel
              control={<Checkbox checked={isChecked} onChange={handleCheckboxChange} />}
              label={isChecked ? 'Activo' : 'Inactivo'}
            />
          </FormGroup>

          {isChecked === true ? (

            <><LocalizationProvider localeText={esp}>
              <Box sx={{ marginBottom: '16px' }}>
                <MobileTimePicker
                  sx={{ width: '100%' }}
                  label="Hora de inicio"
                  defaultValue={defaultValueSbInicio}
                  onChange={handleInicioSabado} />
              </Box>
            </LocalizationProvider><LocalizationProvider localeText={esp}>
                <Box sx={{ marginBottom: '16px' }}>
                  <MobileTimePicker
                    sx={{ width: '100%' }}
                    label="Hora de final"
                    defaultValue={defaultValueSbFinal}
                    onChange={handleFinSabado} />
                </Box>
              </LocalizationProvider></>

          ) : (
            null
          )}

        </DialogContent>

      </Stack>

      <DialogActions>
        <Button variant="contained" color="error" onClick={onClose}>
          Cerrar
        </Button>
        <Button variant="contained" color="success" onClick={() => {
          handleHorario(
            {
              'id': idHorario,
              'horaInicio': inicio,
              'horaFin': fin,
              'sabado': isChecked,
              'horaInicioSabado': inicioSabado,
              'horaFinSabado': finSabado,
              'modificadoPor': user.idUsuario,
            });
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
  horaFinSabado: PropTypes.any
};
