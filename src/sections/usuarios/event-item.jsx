import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDateTime } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import { shortDateLabel } from 'src/components/custom-date-range-picker';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { Rotate90DegreesCcw } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { margin } from '@mui/system';

// ----------------------------------------------------------------------

export default function EventItem({ event, onView, onEdit, onDelete }) {
  const popover = usePopover();

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

  const renderRating = (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        top: 8,
        right: 8,
        zIndex: 9,
        borderRadius: 1,
        position: 'absolute',
        p: '2px 6px 2px 4px',
        typography: 'subtitle2',
        bgcolor: 'warning.lighter',
      }}
    >
      <Iconify icon="eva:star-fill" sx={{ color: 'warning.main', mr: 0.25 }} /> {50.0}
    </Stack>
  );

  const renderPrice = (
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

  const renderBlur = (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        top: 8,
        left: 8,
        zIndex: 9,
        borderRadius: 1,
        bgcolor: 'grey.800',
        position: 'absolute',
        p: '2px 6px 2px 4px',
        color: 'common.white',
        typography: 'subtitle2',
        writingMode: 'vertical-lr',
        transform: 'rotate(180deg)', // rotate(180deg),
      }}
    >
      {/* {!!titulo && (
        <Box component="span" sx={{ color: 'grey.500', mr: 0.25, textDecoration: 'line-through' }}>
          {fCurrency(50)}
        </Box>
      )}
      {fCurrency(51)} */}
    </Stack>
  );

  const renderImages = (
    <Stack
      spacing={0.5}
      direction="row"
      sx={{
        p: (theme) => theme.spacing(1, 1, 0, 1),
      }}
    >
      <Stack flexGrow={1} sx={{ position: 'relative' }}>
        {renderPrice}
        {renderRating}
        <Image
          alt={imagen}
          src={imagen}
          sx={{ margin: '0px 0px 0px 35px', borderRadius: 1, height: 300, width: 1 }}
        />
      </Stack>
    </Stack>
  );

  const renderTexts = (
    <ListItemText
      sx={{
        p: (theme) => theme.spacing(2.5, 2.5, 2, 2.5),
      }}
      primary={`Posted date: ${fDateTime(fechaEvento)}`}
      secondary={
        <Link component={RouterLink} href={paths.dashboard.tour.details(idEvento)} color="inherit">
          {titulo}
        </Link>
      }
      primaryTypographyProps={{
        typography: 'caption',
        color: 'text.disabled',
      }}
      secondaryTypographyProps={{
        mt: 1,
        noWrap: true,
        component: 'span',
        color: 'text.primary',
        typography: 'subtitle1',
      }}
    />
  );

  const renderInfo = (
    <Stack
      spacing={1.5}
      sx={{
        position: 'relative',
        p: (theme) => theme.spacing(0, 2.5, 2.5, 2.5),
      }}
    >
      <IconButton onClick={popover.onOpen} sx={{ position: 'absolute', bottom: 20, right: 8 }}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>

      {[
        {
          label: ubicacion,
          icon: <Iconify icon="mingcute:location-fill" sx={{ color: 'error.main' }} />,
        },
        {
          label: shortLabel,
          icon: <Iconify icon="solar:clock-circle-bold" sx={{ color: 'info.main' }} />,
        },
        {
          label: `50 Booked`,
          icon: <Iconify icon="solar:users-group-rounded-bold" sx={{ color: 'primary.main' }} />,
        },
      ].map((item) => (
        <Stack
          key={item.label}
          spacing={1}
          direction="row"
          alignItems="center"
          sx={{ typography: 'body2' }}
        >
          {item.icon}
          {item.label}
        </Stack>
      ))}
    </Stack>
  );

  const renderInfoEvent = (
    <ListItemText
      sx={{
        p: (theme) => theme.spacing(2.5, 2.5, 2, 2.5),
      }}
      primary={`Posted date: ${fDateTime(fechaEvento)}`}
      secondary={
        <Link component={RouterLink} href={paths.dashboard.tour.details(idEvento)} color="inherit">
          {titulo}
        </Link>
      }
      primaryTypographyProps={{
        typography: 'caption',
        color: 'text.disabled',
      }}
      secondaryTypographyProps={{
        mt: 1,
        noWrap: true,
        component: 'span',
        color: 'text.primary',
        typography: 'subtitle1',
      }}
    />
  );

  return (
    <>
      <Card>
        {renderImages}

        {renderInfoEvent}
        {/* {renderTexts} */}

        {/* {renderInfo} */}
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
    </>
  );
}

EventItem.propTypes = {
  event: PropTypes.object,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onView: PropTypes.func,
};