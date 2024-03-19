import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { endpoints } from 'src/utils/axios';

import { useInsert } from 'src/api/verificacion';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function Verificacion({ email, formReg }) {

  const { enqueueSnackbar } = useSnackbar();

  const [btnLoad, setBtnLoad] = useState(false);

  const insertData = useInsert(endpoints.user.token);

  const insertReenvio = useInsert(endpoints.user.verificacion);

  const methods = useForm();

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  const [countdown, setCountdown] = useState(120); // 120 segundos = 2 minutos
  const [showAlternativeButton, setShowAlternativeButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (countdown > 0) {
        setCountdown(prevCountdown => prevCountdown - 1);
      } else {
        setShowAlternativeButton(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const onSubmit = async (data) => {

    const dataValue = {
      correo: email,
      token: data
    }

    try {

      const insert = await insertData(dataValue);

      if (insert.estatus === true) {
        enqueueSnackbar(insert.msj, { variant: 'success' });

        setBtnLoad(false);
        formReg(true);

      } else {
        enqueueSnackbar(insert.msj, { variant: 'error' });

        setBtnLoad(false);
        formReg(false);
      }

    } catch (error) {

      setBtnLoad(false);
      console.error("Error en handleEstatus:", error);
      enqueueSnackbar(`¡No se pudo enviar el código!`, { variant: 'danger' });

    }
  }

  const handleChange = async (data) => {

    try {

      const insert = await insertReenvio(data);

      if (insert.estatus === true) {
        enqueueSnackbar(insert.msj, { variant: 'success' });

        /* mutate(endpoints.gestor.getOfi); */

        setBtnLoad(false);
        setCountdown(120);
        setShowAlternativeButton(false);

      } else {
        enqueueSnackbar(insert.msj, { variant: 'error' });

        setBtnLoad(false);
      }

    } catch (error) {

      setBtnLoad(false);
      console.error("Error en handleEstatus:", error);
      enqueueSnackbar(`¡No se pudo enviar el código!`, { variant: 'danger' });

    }

  }

  return (
    <FormProvider methods={methods}>
      <DialogContent>
        <Box
          rowGap={3}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(1, 1fr)',
          }}
        >
          <DialogTitle style={{ paddingLeft: '0px' }}>Registro de usuario</DialogTitle>

          {countdown !== 0 ? (
            <>
              <p>El código vence en <b>{formatTime(countdown)}</b></p>

              <RHFTextField name="codigo" label="Código" autoComplete="off" />
            </>
          ) : (

            <p>El código de verificación expiró</p>

          )}
        

        <DialogActions>
          {showAlternativeButton ? (
            <LoadingButton 
            variant="contained" 
            onClick={() => {
              setBtnLoad(true);
              handleChange(email)
            }}
            >
              Reenviar código
            </LoadingButton>
          ) : (
            <LoadingButton
              variant="contained"
              loading={btnLoad}
              onClick={methods.handleSubmit(onSubmit)}
            >
              Verificar
            </LoadingButton>
          )}
        </DialogActions>
        
        </Box>

      </DialogContent>
    </FormProvider >
  );
}

Verificacion.propTypes = {
  email: PropTypes.any,
  formReg: PropTypes.any,
};
