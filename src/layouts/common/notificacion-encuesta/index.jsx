import { m } from 'framer-motion';
import { Base64 } from 'js-base64';

import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useBoolean } from 'src/hooks/use-boolean';

import uuidv4 from "src/utils/uuidv4";
import { endpoints } from 'src/utils/axios';

import { usePostGeneral } from 'src/api/general';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { varHover } from 'src/components/animate';

import NotificationItem from './notificacion-encuesta';


// ----------------------------------------------------------------------

export default function NotifiEncuesta() {

  const idUser = JSON.parse(Base64.decode(sessionStorage.getItem('accessToken').split('.')[2]));

  const { getData } = usePostGeneral(idUser.idUsuario, endpoints.encuestas.getEncNotificacion, "getData");

  const drawer = useBoolean();

  const _rp = getData.map((es) => (es[0].idEncuesta));

  console.log(_rp);

  const renderHead = (
    <Stack direction="row" alignItems="center" sx={{ py: 2, pl: 2.5, pr: 1, minHeight: 68 }}>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Encuestas por contestar
      </Typography>
    </Stack>
  );

  const renderList = (
    <Scrollbar>
      <List disablePadding>
        {getData.map((items) => (
          <NotificationItem key={`route_${uuidv4()}`} notification={items} />
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
      >
        <Badge badgeContent={getData.length} color="success">
          <Iconify icon="solar:document-bold-duotone" width={24} />
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

        {renderList}
      </Drawer>
    </>
  );
}
