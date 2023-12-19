import { mutate } from 'swr';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export default function NotificationEncuesta({ notification }) {

  const router = useRouter();

  const renderText = (
    <ListItemText
      disableTypography
      primary={reader(notification.puesto)}
    />
  );

  const mut = mutate(endpoints.encuestas.getEcuestaValidacion);

  const renderUnReadBadge = (
    <Box
      sx={{
        top: 26,
        width: 8,
        height: 8,
        right: 20,
        borderRadius: '50%',
        bgcolor: 'info.main',
        position: 'absolute',
      }}
    />
  );

  const friendAction = (
    <Stack spacing={1} direction="row" sx={{ mt: 1.5 }}>
      <Link
        to={`/dashboard/encuestas/contestar?idEncuesta=${notification.idEncuesta}`}
        >
          <Button size="small" variant="contained"
        key={notification.idArea}
        notification={notification}
        onClick={mut}
      >
          Constestar
        </Button>
      </Link>

    </Stack>
  );

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

      <Stack sx={{ flexGrow: 1 }}>
        {renderText}
        {friendAction}
      </Stack>
    </ListItemButton>
  );
}

NotificationEncuesta.propTypes = {
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
