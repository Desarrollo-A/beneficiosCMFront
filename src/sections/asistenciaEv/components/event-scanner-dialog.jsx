import 'dayjs/locale/es';
import dayjs from 'dayjs';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { es } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { QrReader } from 'react-qr-reader';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useBoolean } from 'src/hooks/use-boolean';

import { getDatosEvento } from 'src/api/asistenciaEv/asistenciaEv';

import { ConfirmDialog } from 'src/components/custom-dialog';

export default function EventScannerDialog({ open, onClose, mutate }) {
  const [data, setData] = useState(null);

  const confirm = useBoolean();

  const handleScanQR = async (result, error) => {
    if (result) {
      const res = await getDatosEvento(result?.text);
      if (res) {
        setData(res);
        console.log(res);
        confirm.onTrue();
      }
    }
  };

  const handleConfirmAssistance = () => {
    if (data?.result) {
      alert(`Confirmando asistencia de ${data?.nombre_persona}`);
    } else {
      confirm.onFalse();
      onClose();
      setData(null);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        fullWidth
        maxWidth="xs"
        disableEscapeKeyDown
        backdrop="static"
        sx={{ display: !data ? 'block' : 'none' }}
      >
        <DialogTitle sx={{ pb: 2 }}>Escanear código QR</DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '100vh' }}>
          <Stack alignItems="center" spacing={2}>
            {/* Contenedor principal responsivo */}
            <Box
              sx={{
                position: 'relative',
                width: '80vw',
                height: '80vw',
                backgroundColor: 'black',
                maxWidth: '400px',
                maxHeight: '400px',
              }}
            >
              {/* Lector QR, el contenido principal */}
              {!data ? (
                <QrReader
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                  onResult={async (result, error) => {
                    await handleScanQR(result, error);
                  }}
                />
              ) : (
                ''
              )}

              {/* Bordes superpuestos dentro del área de escaneo */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none', // Evitar que los bordes interfieran con el escaneo
                }}
              >
                {/* Esquinas superpuestas */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '5%',
                    left: '5%',
                    width: '15%',
                    height: '15%',
                    borderTop: '4px solid white',
                    borderLeft: '4px solid white',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '5%',
                    right: '5%',
                    width: '15%',
                    height: '15%',
                    borderTop: '4px solid white',
                    borderRight: '4px solid white',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: '5%',
                    left: '5%',
                    width: '15%',
                    height: '15%',
                    borderBottom: '4px solid white',
                    borderLeft: '4px solid white',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: '5%',
                    right: '5%',
                    width: '15%',
                    height: '15%',
                    borderBottom: '4px solid white',
                    borderRight: '4px solid white',
                  }}
                />
              </Box>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onClose();
            }}
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        content={
          <Typography>
            {data && data?.result
              ? `¿Deseas confirmar asistencia de ${data?.data[0]?.nombre_persona} para ${data?.data[0]?.titulo}?`
              : data?.msg}
          </Typography>
        }
        action={
          <>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                confirm.onFalse();
              }}
            >
              Cancelar
            </Button>
            <LoadingButton
              variant="contained"
              color="success"
              onClick={() => handleConfirmAssistance()}
              loading={false}
            >
              Aceptar
            </LoadingButton>
          </>
        }
      />
    </>
  );
}

EventScannerDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  mutate: PropTypes.func,
};
