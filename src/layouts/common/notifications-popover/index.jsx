import { useEffect } from 'react';
import { m } from 'framer-motion';
import PropTypes from 'prop-types';

import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { useNotificacion } from 'src/api/notificacion';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { varHover } from 'src/components/animate';

import NotificationItem from './notification-item';
import NotificationPush from './notification-push';

// eslint-disable-next-line
import addNotification from 'react-push-notification';

import './style.css';
// ----------------------------------------------------------------------

export default function NotificationsPopover({ idUsuario }) {
  const drawer = useBoolean();

  const smUp = useResponsive('up', 'sm');

  const { notifications, /* benefitsLoading */ } = useNotificacion(idUsuario);

  useEffect(() => {
    notifications.forEach((notification) => {
      addNotification({
        title: 'Beneficios Maderas',
        message: notification.mensaje,
        theme: 'darkblue',
        native: true
      });
    });
  }, [notifications]);

  const renderHead = (
    <Stack direction="row" alignItems="center" sx={{ py: 2, pl: 2.5, pr: 1, minHeight: 68 }}>
      {notifications.length > 0 ? (
        <>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Notificaciones
          </Typography>

          {/* <Tooltip title="Eliminar todas las notificaciones" placement="left">
            <IconButton onClick={handleMarkAllAsRead}>
              <Iconify icon="fluent:delete-24-filled" />
            </IconButton>
          </Tooltip> */}
        </>
      ) : (
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Sin notificaciones
        </Typography>
      )}

      {!smUp && (
        <IconButton onClick={drawer.onFalse} >
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      )}
    </Stack>
  );

  const renderList = (
    <Scrollbar>
      <List disablePadding>
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </List>
    </Scrollbar>
  );

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        color={drawer.value ? 'primary' : 'default'}
        onClick={drawer.onTrue}
        className="buttonActions"
      >
        <Badge badgeContent={notifications.length} color="primary">
          <Iconify icon="solar:bell-bing-bold-duotone" className="bell" width={24} />
        </Badge>
      </IconButton>
      <Drawer
        open={drawer.value}
        onClose={drawer.onFalse}
        anchor="right"
        slotProps={{
          backdrop: { invisible: true },
        }}
        PaperProps={{
          sx: { width: 1, maxWidth: 420 },
        }}
      >
        {renderHead}

        <Divider />

        <Divider />

        {renderList}

        {/* <Box sx={{ p: 1 }}>
          <Button fullWidth size="large">
            View All
          </Button>
        </Box> */}
      </Drawer>

      {notifications.map((notification) => (
        <NotificationPush key={notification.id} notification={notification} />
      ))}
    </>
  );
}

NotificationsPopover.propTypes = {
  idUsuario: PropTypes.any,
};
