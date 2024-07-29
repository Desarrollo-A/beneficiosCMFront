// import { mutate } from 'swr';
import { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';

import { endpoints } from 'src/utils/axios';
import { fToNow } from 'src/utils/format-time';

import { useNotificacion, useDeleteNotification } from 'src/api/notificacion';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function NotificationItem({ notification }) {

  const { getNotifications } = useNotificacion();

  const deleteNotification = useDeleteNotification(endpoints.notificacion.deleteNotificacion);

  const [disguise, setDisguise] = useState(0);

  const handleDeleteNt = async (i) => {
    setDisguise(i);

    try {
      const deleteNt = await deleteNotification(i);
      if (deleteNt.data === true) {
        // mutate([endpoints.notificacion.getNotificacion]);

        getNotifications();
      } else {
        console.error("Error en eliminar notificación");
      }
    } catch (error) {
      console.error("Error en handleEstatus:", error);
    } finally {
      setDisguise(0);
    }
    setDisguise(i);
  };

  let renderAvatar = '';
  let renderText = '';
  let renderUnReadBadge = '';

  if (notification.id !== disguise) {

    renderAvatar = (
      <ListItemAvatar>
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: 'background.neutral',
          }}
        >
          <Box
            component="img"
            src={`/assets/icons/notification/${notification.icono}.svg`}
            sx={{ width: 24, height: 24 }}
          />
        </Stack>
      </ListItemAvatar>
    );

    renderText = (
      <>
        {(notification?.tipo === 1 || notification?.tipo === 2) && notification.tipoMensaje !== 6 && (
          <ListItemText
            sx={{ width: 260 }}
            disableTypography
            primary={reader(`${notification.mensaje} #${notification.idCita} de ${notification.beneficio}`)}
            secondary={
              <Stack
                direction="row"
                alignItems="center"
                sx={{ typography: 'caption', color: 'text.disabled' }}
                divider={
                  <Box
                    sx={{
                      width: 2,
                      height: 2,
                      bgcolor: 'currentColor',
                      mx: 0.5,
                      borderRadius: '50%',
                    }}
                  />
                }
              >
                {fToNow(notification.fecha)}
                {/* {notification.category} */}
              </Stack>
            }
          />
        )}
        {notification?.tipo === 1 && notification.tipoMensaje === 6 && (
          <ListItemText
            sx={{ width: 260 }}
            disableTypography
            primary={reader(`${notification.mensaje} de ${notification.beneficio} (${notification.horario})`)}
            secondary={
              <Stack
                direction="row"
                alignItems="center"
                sx={{ typography: 'caption', color: 'text.disabled' }}
                divider={
                  <Box
                    sx={{
                      width: 2,
                      height: 2,
                      bgcolor: 'currentColor',
                      mx: 0.5,
                      borderRadius: '50%',
                    }}
                  />
                }
              >
                {fToNow(notification.fecha)}
                {/* {notification.category} */}
              </Stack>
            }
          />
        )}
        {notification?.tipo === 4 && (
          <ListItemText
            sx={{ width: 260 }}
            disableTypography
            primary={reader(`${notification.mensaje} (${notification.horario})`)}
            secondary={
              <Stack
                direction="row"
                alignItems="center"
                sx={{ typography: 'caption', color: 'text.disabled' }}
                divider={
                  <Box
                    sx={{
                      width: 2,
                      height: 2,
                      bgcolor: 'currentColor',
                      mx: 0.5,
                      borderRadius: '50%',
                    }}
                  />
                }
              >
                {fToNow(notification.fecha)}
                {/* {notification.category} */}
              </Stack>
            }
          />
        )}
      </>
    );

    renderUnReadBadge = (
      <Box
        sx={{
          top: 26,
          width: 8,
          height: 8,
          right: 40,
          borderRadius: '50%',
          position: 'absolute',
        }}
        className="fade-in"
      >
        <IconButton color="error" onClick={() => {
          handleDeleteNt(notification.id)
        }}>
          <Iconify icon="typcn:delete" />
        </IconButton>
      </Box>
    );
  }
  /* const paymentAction = (
    <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
      <IconButton color="error" >
        <Iconify icon="typcn:delete" />
      </IconButton>
    </Stack>
  ); */

  return (
    <ListItemButton
      disableRipple
      sx={{
        p: 2.5,
        alignItems: 'flex-start',
        borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
      }}
    >
      {renderUnReadBadge}

      {renderAvatar}

      <Stack sx={{ flexGrow: 1 }}>
        {renderText}
        {/* {paymentAction} */}
      </Stack>
    </ListItemButton>
  );
}

NotificationItem.propTypes = {
  notification: PropTypes.object,
};

// ----------------------------------------------------------------------

function reader(data) {
  return (
    <Box
      dangerouslySetInnerHTML={{ __html: data }}
      sx={{
        mb: 0.5,
        '& p': { typography: 'body2', m: 0 },
        '& a': { color: 'inherit', textDecoration: 'none' },
        '& strong': { typography: 'subtitle2' },
      }}
    />
  );
}
