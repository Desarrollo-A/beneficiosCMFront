import { mutate } from 'swr';
import { isEmpty } from 'lodash';
import dayjs from 'dayjs';
import { useState } from 'react';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { FormProvider, useForm } from 'react-hook-form';

import { Box } from '@mui/system';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { MobileTimePicker } from '@mui/x-date-pickers';
import FormGroup from '@mui/material/FormGroup';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

// import { useUpdate } from 'src/api/reportes';
import { useInsert } from 'src/api/encuestas';
import { useAuthContext } from 'src/auth/hooks';
import { useGetGeneral } from 'src/api/general';

import { useSnackbar } from 'src/components/snackbar';
import { RHFAutocomplete } from 'src/components/hook-form';
// ----------------------------------------------------------------------

export default function ModalAgregarOficinas({ open, onClose }) {

  const confirm = useBoolean();

  dayjs.locale('es');

  const esp = {
    // idioma de los botones
    okButtonLabel: 'Seleccionar',
    cancelButtonLabel: 'Cancelar',
    datePickerToolbarTitle: 'Selecciona una fecha',
    timePickerToolbarTitle: 'Selecciona un horario',
  };

  const { user } = useAuthContext();

  const methods = useForm();

  const insertData = useInsert(endpoints.gestor.insertHorario);

  const { espeData } = useGetGeneral(endpoints.gestor.especialistas, "espeData");

  const { enqueueSnackbar } = useSnackbar();

  const [btnLoad, setBtnLoad] = useState(false);

  const [isChecked, setIsChecked] = useState(0);

  const [espe, setEspe] = useState('');

  const [sabado, setSabado] = useState(0);

  // Función para manejar el cambio de estado del checkbox
  const handleCheckboxChange = (event) => {

    setIsChecked(event?.target?.checked);

    if (event?.target?.checked === false) {
      setInicioSabado(null);
      setFinSabado(null);
      setSabado(0);
    } else {
      setSabado(1);
    }

  };

  const [inicio, setInicio] = useState('');

  const [fin, setFin] = useState('');

  const [inicioSabado, setInicioSabado] = useState(null);

  const [finSabado, setFinSabado] = useState(null);

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

  const handleChangeEspe = (value) => {
    setEspe(value?.value);
  }

  const handleKeyDown = async () => {
    setEspe({ idEspe: null });
  }

  const handleHorario = async (data) => {

    console.log(data)

    try {

      onClose();

      const insert = await insertData(data);

      if (insert.estatus === true) {
        enqueueSnackbar(insert.msj, { variant: 'success' });

        mutate(endpoints.gestor.getHorariosEspecificos);
        mutate(endpoints.gestor.especialistas);

        setBtnLoad(false);

      } else {
        enqueueSnackbar(insert.msj, { variant: 'error' });

        setBtnLoad(false);
      }

    } catch (error) {
      console.error("Error en handleEstatus:", error);
      enqueueSnackbar(`¡No se pudieron actualizar los datos!`, { variant: 'danger' });

      setBtnLoad(false);
    }

  }

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
      {!isEmpty(espeData) ? (
        <>
          <Stack spacing={1} >

            <DialogTitle>
              Registrar horario
            </DialogTitle>

            <DialogContent>

              <Box sx={{ marginBottom: '16px' }}>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  Horario entre semana
                </Typography>
              </Box>

              <FormProvider {...methods}>
                <Box sx={{ marginBottom: '16px' }}>
                  <RHFAutocomplete
                    name="especialista"
                    label="Especialista"
                    value=""
                    onChange={(_event, value, _reason) => {
                      handleChangeEspe(value);
                    }}
                    onKeyDown={(i) => {
                      handleKeyDown();
                    }}
                    options={espeData?.map((i, index) => ({
                      key: index,
                      value: i.idUsuario,
                      label: i.especialista,
                    }))}
                  />
                </Box>
              </FormProvider>

              <LocalizationProvider localeText={esp}>
                <Box sx={{ marginBottom: '16px' }}>
                  <MobileTimePicker
                    sx={{ width: '100%' }}
                    label="Hora de inicio"
                    onChange={handleInicio}
                  />
                </Box>
              </LocalizationProvider>

              <LocalizationProvider localeText={esp}>
                <Box sx={{ marginBottom: '16px' }}>
                  <MobileTimePicker
                    sx={{ width: '100%' }}
                    label="Hora de final"
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
                      onChange={handleInicioSabado} />
                  </Box>
                </LocalizationProvider><LocalizationProvider localeText={esp}>
                    <Box sx={{ marginBottom: '16px' }}>
                      <MobileTimePicker
                        sx={{ width: '100%' }}
                        label="Hora de final"
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
            <Button variant="contained" color="success" loading={btnLoad} onClick={() => {
              handleHorario(
                {
                  'espe': espe,
                  'horaInicio': inicio,
                  'horaFin': fin,
                  'sabado': sabado,
                  'horaInicioSabado': inicioSabado,
                  'horaFinSabado': finSabado,
                  'creadoPor': user.idUsuario,
                });
              confirm.onFalse();
            }}>
              Guardar
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogTitle>
            Todos los especialistas ya cuentan con un registro
          </DialogTitle>
          <DialogActions>
            <Button variant="contained" color="error" onClick={onClose}>
              Cerrar
            </Button>
          </DialogActions>
        </>
      )}

    </Dialog>

  );
}

ModalAgregarOficinas.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool
};
