import 'dayjs/locale/es';
import dayjs from 'dayjs';
import { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Dialog from '@mui/material/Dialog';
import { Typography } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import DialogContent from '@mui/material/DialogContent';

import { useBoolean } from 'src/hooks/use-boolean';

import { capitalizeFirstLetter } from 'src/utils/general';

import { HOST } from 'src/config-global';
import { useAuthContext } from 'src/auth/hooks';
import { hideShowEvent, actualizarAsistenciaEvento } from 'src/api/perfil/eventos';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';

import NewEventDialog from './new-event-dialog';

// ----------------------------------------------------------------------

export default function EventItem({ event, mutate }) {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const showImage = useBoolean();
  const eventDialog = useBoolean();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitting2, setIsSubmitting2] = useState(false);

  const {
    idEvento,
    titulo,
    // descripcion,
    fechaEvento,
    // inicioPublicacion,
    // finPublicacion,
    imagen,
    // horaEvento,
    // limiteRecepcion,
    ubicacion,
    // idAsistenciaEv,
    // idContrato,
    // confirmacion,
    // asistencia,
    confirmados,
    // asistidos,
    estatusAsistencia,
    estatusEvento,
    // estatus,
    // creadoPor,
    fechaCreacion,
    // modificadoPor,
    // fechaModificacion,
  } = event;

  const handleConfirmacion = async () => {
    setIsSubmitting(true);
    const res = await actualizarAsistenciaEvento(
      user?.idContrato,
      idEvento,
      estatusAsistencia === 1 ? 2 : 1,
      user?.idUsuario
    );

    enqueueSnackbar(res.msg, { variant: res.result === true ? 'success' : 'error' });

    await mutate();
    setIsSubmitting(false);
  };

  const handleEdit = () => {
    eventDialog.onTrue();
  };

  const handleHideEvent = async () => {
    setIsSubmitting2(true);
    const res = await hideShowEvent(idEvento, estatusEvento === 1 ? 2 : 1, user?.idUsuario);

    await mutate();
    setIsSubmitting2(false);
    enqueueSnackbar(res.msg, { variant: res.result === true ? 'success' : 'error' });
  };

  const renderOptions = (
    <Stack
      direction="row"
      alignItems="center"
      spacing="5px"
      sx={{
        top: 8,
        right: 8,
        zIndex: 9,
        position: 'absolute',
        p: '2px 6px 2px 4px',
        typography: 'caption',
        fontWeight: 'light',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 100,
          padding: '7px',
          mr: '1px',
          color: 'white',
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          cursor: 'pointer',
        }}
        // disable={isSubmitting2}
        onClick={() => handleHideEvent()}
      >
        {isSubmitting2 && <Iconify icon="line-md:loading-twotone-loop" sx={{ color: 'white' }} />}
        {isSubmitting2 === false && estatusEvento === 1 && (
          <Iconify icon="mdi:eye" sx={{ color: 'white' }} />
        )}
        {isSubmitting2 === false && estatusEvento === 2 && (
          <Iconify icon="mdi:eye-off" sx={{ color: 'white' }} />
        )}
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 1000,
          padding: '7px',
          mr: '1px',
          color: 'white',
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          cursor: 'pointer',
        }}
        onClick={() => handleEdit()}
      >
        <Iconify icon="mdi:edit" sx={{ color: 'white' }} />
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 100,
          padding: '7px 15px',
          color: 'white',
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          cursor: 'pointer',
        }}
      >
        <Iconify icon="mdi:user" sx={{ color: 'white', mr: 0.25 }} /> {confirmados} Confirmados
      </Box>
    </Stack>
  );

  const renderDate = (
    <Stack
      direction="column"
      alignItems="center"
      sx={{
        top: 1,
        left: 1,
        zIndex: 9,
        borderRadius: '10px 0px 10px 0px',
        position: 'absolute',
        p: '20px 10px 20px 10px',
        color: 'common.white',
        // Padding

        // rotar texto
        writingMode: 'vertical-rl',
        transform: 'rotate(180deg)', // rotate(180deg),
        // Efecto blur
        bgcolor: 'rgba(100, 100, 100, 0.5)', // Fondo semi-transparente
        backdropFilter: 'blur(5px)', // Desenfoque
        WebkitBackdropFilter: 'blur(5px)', // Para Safari
      }}
    >
      <Box
        component="span"
        sx={{
          color: 'white',
          typography: 'subtitle1',
          fontWeight: 'bold',
          mr: 0.25,
          alignSelf: 'flex-start',
        }} // Alinea el '10' al inicio
      >
        {dayjs(fechaEvento).format('DD')}
      </Box>
      <Box
        component="span"
        sx={{
          color: 'white',
          typography: 'subtitle1',
          fontWeight: 'light',
          mr: 0.25,
          // letterSpacing: '1px',
        }}
      >
        {capitalizeFirstLetter(dayjs(fechaEvento).format('MMMM'))}
      </Box>
    </Stack>
  );

  const renderImageButtons = (
    <Stack
      direction="row"
      alignItems="center"
      spacing="5px"
      sx={{
        bottom: 8,
        right: 8,
        zIndex: 9,
        position: 'absolute',
        p: '2px 6px 2px 4px',
        typography: 'caption',
        fontWeight: 'light',
        color: 'common.white',

        cursor: 'pointer', // Cambia el cursor a una mano
      }}
    >
      <Stack
        component="span"
        sx={{
          cursor: 'pointer',
          color: 'white',
          typography: 'subtitle1',
          fontWeight: 'light',
          mr: 0.25,
          bgcolor: 'rgba(200, 200, 200, 0.4)',
          borderRadius: '5000px',
          padding: '6px',
        }}
        onClick={() => window.open(`https://www.google.com.mx/maps/search/${ubicacion}/`)}
      >
        <Tooltip title="Consulta la ubicación">
          <Iconify width={24} icon="bxs:map" />
        </Tooltip>
      </Stack>
      <LoadingButton
        component="span"
        sx={{
          color: 'white',
          typography: 'subtitle1',
          fontWeight: 'light',
          mr: 0.25,
          bgcolor: 'rgba(200, 200, 200, 0.4)',
          borderRadius: '15px',
        }}
        loading={isSubmitting}
        onClick={() => handleConfirmacion()}
      >
        {estatusAsistencia === 1 ? 'Cancelar asistencia' : 'Confirmar asistencia'}
      </LoadingButton>
    </Stack>
  );

  const renderCover = (
    <Stack spacing={0.5} direction="row">
      <Stack flexGrow={1} sx={{ position: 'relative' }}>
        {renderDate}
        {renderOptions}
        <Image
          alt={`${HOST}/documentos/archivo/${imagen}`}
          src={`${HOST}/documentos/archivo/${imagen}`}
          sx={{ margin: '0px 0px 0px 35px', borderRadius: 1, height: 250, width: 1 }}
        />
      </Stack>
    </Stack>
  );

  const renderInfoEvent = (
    <Stack direction="row" sx={{ flex: 1 }}>
      <Box sx={{ width: '70%', margin: '0px 0px 0px 35px', padding: '1px' }}>
        <Box
          sx={{
            flex: 1,
            typography: 'caption',
            fontWeight: 'light',
            fontSize: 10,
            color: '#757575',
            whiteSpace: 'nowrap', // Evita que el texto se divida en varias líneas
            overflow: 'hidden', // Oculta el texto que excede el ancho del contenedor
            textOverflow: 'ellipsis',
          }}
        >
          <Tooltip title={`Creado el ${dayjs(fechaCreacion).format('DD MMMM YYYY[,] HH:mm A')}`}>
            <Typography variant="caption">
              Creado el {dayjs(fechaCreacion).format('DD MMMM YYYY[,] HH:mm A')}
            </Typography>
          </Tooltip>
        </Box>
        <Box
          sx={{
            flex: 1,
            typography: 'subtitle2',
            fontWeight: 'bold',
            fontSize: 16,
            color: '#00263A',
            whiteSpace: 'nowrap', // Evita que el texto se divida en varias líneas
            overflow: 'hidden', // Oculta el texto que excede el ancho del contenedor
            textOverflow: 'ellipsis',
          }}
        >
          <Tooltip title={titulo}>
            <Typography variant="">{titulo}</Typography>
          </Tooltip>
        </Box>
        <Stack direction="row" sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mr: '2px' }}>
            <Iconify width={17} icon="bxs:map" />
          </Box>
          <Box
            sx={{
              typography: 'caption',
              color: '#00263A',
              fontWeight: 'light',
              fontSize: 10,
              whiteSpace: 'nowrap', // Evita que el texto se divida en varias líneas
              overflow: 'hidden', // Oculta el texto que excede el ancho del contenedor
              textOverflow: 'ellipsis',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Tooltip title={ubicacion}>
              <Typography variant='caption'>{ubicacion}</Typography>
            </Tooltip>
          </Box>
        </Stack>
      </Box>
      <Box
        sx={{
          display: 'flex',
          backgroundColor: '#00263A',
          width: '30%',
          color: 'white',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer', // Cambia el cursor a una mano
          '&:hover': {
            backgroundColor: '#004466', // Cambia el color al pasar el mouse
          },
          typography: 'subtitle2',
          fontWeight: 'light',
        }}
        onClick={() => showImage.onTrue()}
      >
        MÁS
      </Box>
    </Stack>
  );

  return (
    <>
      <Card sx={{ backgroundColor: '#F0ECE0', padding: '0px' }}>
        {renderCover}
        {renderInfoEvent}
      </Card>

      <Dialog open={showImage.value} onClose={showImage.onFalse} sx={{ borderRadius: '0px' }}>
        <DialogContent
          sx={{
            position: 'relative',
            margin: '0px',
            padding: '0px',
            // backgroundImage: `url(${imagen})`,
            backgroundImage: `url(${HOST}/documentos/archivo/${imagen})`,
            borderRadius: '0px',
            backgroundSize: 'contain', // La imagen se ajusta dentro del contenedor manteniendo sus proporciones
            backgroundRepeat: 'no-repeat', // Evita que la imagen se repita
            backgroundPosition: 'center', // Centra la imagen dentro del contenedor
            width: '600px', // Ancho relativo al 60% del ancho de la ventana
            height: '900px', // Alto relativo al 80% del alto de la ventana
            backdropFilter: 'blur(800px)',
            overflow: 'hidden', // Evita que cualquier contenido adicional cree scroll
          }}
        >
          {renderImageButtons}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '25%', // Aplica el blur al 20% inferior
              background:
                'linear-gradient(to top, rgba(0, 0, 0, 1) 10%, rgba(0, 0, 0, 0.9) 20%, rgba(0, 0, 0, 0.8) 30%, rgba(0, 0, 0, 0.7) 40%, rgba(0, 0, 0, 0.6) 50%, rgba(0, 0, 0, 0.5) 60%, rgba(0, 0, 0, 0.4) 70%, rgba(0, 0, 0, 0.3) 80%, rgba(0, 0, 0, 0.15) 90%, rgba(0, 0, 0, 0.0) 100%)', // Gradiente de blanco a transparente
            }}
          />
        </DialogContent>
      </Dialog>

      {eventDialog && (
        <NewEventDialog
          open={eventDialog.value}
          event={event}
          onClose={eventDialog.onFalse}
          mutate={mutate}
        />
      )}
    </>
  );
}

EventItem.propTypes = {
  event: PropTypes.object,
  mutate: PropTypes.func,
};
