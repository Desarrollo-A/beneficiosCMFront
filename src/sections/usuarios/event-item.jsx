import 'dayjs/locale/es';
import dayjs from 'dayjs';
// import { useEffect } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import DialogContent from '@mui/material/DialogContent';

import { useBoolean } from 'src/hooks/use-boolean';

import { capitalizeFirstLetter } from 'src/utils/general';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { fDateTime } from 'src/utils/format-time';
import { HOST } from 'src/config-global';

// ----------------------------------------------------------------------

export default function EventItem({ event, onView, onEdit, onDelete }) {
  const popover = usePopover();
  const showImage = useBoolean();

  const {
    idEvento,
    titulo,
    descripcion,
    fechaEvento,
    inicioPublicacion,
    finPublicacion,
    imagen,
    horaEvento,
    limiteRecepcion,
    ubicacion,
    idAsistenciaEv,
    idContrato,
    confirmacion,
    asistencia,
    confirmados,
    asistidos,
    estatus,
    creadoPor,
    fechaCreacion,
    modificadoPor,
    fechaModificacion,
  } = event;

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
      >
        <Iconify icon="mdi:eye" sx={{ color: 'white' }} />
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
        // Padding

        // rotar texto
        // writingMode: 'vertical-rl',
        // transform: 'rotate(180deg)', // rotate(180deg),
        // Efecto blur
        // bgcolor: 'rgba(200, 200, 200, 0.7)', // Fondo semi-transparente
        backdropFilter: 'blur(5px)', // Desenfoque
        WebkitBackdropFilter: 'blur(5px)', // Para Safari
        cursor: 'pointer', // Cambia el cursor a una mano
      }}
    >
      <LoadingButton
        component="span"
        sx={{
          color: 'white',
          typography: 'subtitle1',
          fontWeight: 'light',
          mr: 0.25,
          bgcolor: 'rgba(200, 200, 200, 0.4)',
        }}
        onClick={() => alert('Consultando ubicación...')}
      >
        <Iconify width={17} icon="bxs:map" />
        Consulta la ubicación
      </LoadingButton>
      <LoadingButton
        component="span"
        sx={{
          color: 'white',
          typography: 'subtitle1',
          fontWeight: 'light',
          mr: 0.25,
          bgcolor: 'rgba(200, 200, 200, 0.4)',
        }}
        onClick={() => alert('Confirmando evento...')}
      >
        Confirmar asistencia
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
            Creado el {dayjs(fechaCreacion).format('DD MMMM YYYY[,] HH:mm A')}
          </Tooltip>
        </Box>
        <Box
          sx={{
            flex: 1,
            typography: 'subtitle1',
            fontWeight: 'bold',
            fontSize: 16,
            color: '#00263A',
            whiteSpace: 'nowrap', // Evita que el texto se divida en varias líneas
            overflow: 'hidden', // Oculta el texto que excede el ancho del contenedor
            textOverflow: 'ellipsis',
          }}
        >
          <Tooltip title={titulo}>{titulo}</Tooltip>
        </Box>
        <Stack direction="row" sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mr: '2px' }}>
            <Iconify width={17} icon="bxs:map" />
          </Box>
          <Box
            sx={{
              typography: 'caption',
              fontWeight: 'light',
              fontSize: 10,
              whiteSpace: 'nowrap', // Evita que el texto se divida en varias líneas
              overflow: 'hidden', // Oculta el texto que excede el ancho del contenedor
              textOverflow: 'ellipsis',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Tooltip title={ubicacion}>{ubicacion}</Tooltip>
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

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
            onView();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
            onEdit();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
            onDelete();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>

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
            // maxWidth: '100vw', // Limita el ancho máximo al 100% del viewport
            // maxHeight: '100vh', // Limita la altura máxima al 100% del viewport
            backdropFilter: 'blur(800px)',
            overflow: 'hidden', // Evita que cualquier contenido adicional cree scroll
          }}
        >
          {renderImageButtons}
          {/* <Image
            alt={imagen}
            src={imagen}
            sx={{ margin: '0px', borderRadius: 1, height: '100%', width: 1 }}
          /> */}
          {/* Pseudo-elemento para aplicar el blur en el 20% inferior */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '25%', // Aplica el blur al 20% inferior
              background:
                'linear-gradient(to top, rgba(0, 0, 0, 1) 10%, rgba(0, 0, 0, 0.9) 20%, rgba(0, 0, 0, 0.8) 30%, rgba(0, 0, 0, 0.7) 40%, rgba(0, 0, 0, 0.6) 50%, rgba(0, 0, 0, 0.5) 60%, rgba(0, 0, 0, 0.4) 70%, rgba(0, 0, 0, 0.3) 80%, rgba(0, 0, 0, 0.15) 90%, rgba(0, 0, 0, 0.0) 100%)', // Gradiente de blanco a transparente
              // backdropFilter: 'blur(8px)', // Efecto de blur
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

EventItem.propTypes = {
  event: PropTypes.object,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onView: PropTypes.func,
};
