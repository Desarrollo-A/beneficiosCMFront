import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogContent from '@mui/material/DialogContent';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDateTime } from 'src/utils/format-time';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Tooltip, Typography } from '@mui/material';
import { shortDateLabel } from 'src/components/custom-date-range-picker';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { LoadingButton } from '@mui/lab';

// ----------------------------------------------------------------------

export default function EventItem({ event, onView, onEdit, onDelete }) {
  const popover = usePopover();
  const showImage = useBoolean();

  const {
    idEvento,
    inicioPublicacion,
    titulo,
    descripcion,
    fechaEvento,
    finPublicacion,
    imagen,
    horaEvento,
    limiteRecepcion,
    ubicacion,
    idAsistenciaEv,
    idContrato,
    confirmacion,
    asistencia,
  } = event;

  const shortLabel = shortDateLabel(inicioPublicacion, finPublicacion);

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
        <Iconify icon="mdi:user" sx={{ color: 'white', mr: 0.25 }} /> 50 Confirmados
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
        10
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
        {' Diciembre'}
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
          alt={imagen}
          src={imagen}
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
          <Tooltip title="Creado el 13 Octubre 2024, 10:35am">
            Creado el 13 Octubre 2024, 10:35am
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
          <Tooltip title="Celebración de día de muertos">Celebración de día de muertos</Tooltip>
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
            <Tooltip title="Camino a Eco-Centro s/n, 76245 Santiago de Querétaro, Querétaro, MEXICO">
              Camino a Eco-Centro s/n, 76245 Santiago de Querétaro, Querétaro, MEXICO
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

      <Dialog open={showImage.value} onClose={showImage.onFalse}>
        <DialogContent
          sx={{
            margin: '0px',
            padding: '0px',
            backgroundImage: `url(${imagen})`,
            height: '800px',
            width: '1200px',
            backgroundSize: 'fit',
            backdropFilter: 'blur(800px)',
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
