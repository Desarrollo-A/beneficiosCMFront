import { useState } from 'react';
import PropTypes from 'prop-types';
import { DialogTitle, DialogContent } from '@material-ui/core';

import { List, Stack, Button, ListItem, Typography, DialogActions, Box } from '@mui/material';

export default function ColorsDialog({ onClose }) {
  const colors = [
    {
      color: '#ffa500',
      text: 'Cita por asistir',
    },
    {
      color: '#ff0000',
      text: 'Cita cancelada colaborador / especialista',
    },
    {
      color: '#808080',
      text: 'Cita penalizada',
    },
    {
      color: '#008000',
      text: 'Cita finalizada',
    },
    {
      color: '#ff4d67',
      text: 'Cita con falta justificada',
    },
    {
      color: '#00ffff',
      text: 'Cita pendiente de pago',
    },

    {
      color: '#ff0000',
      text: 'Cita con pago pendiente expirado',
    },
    {
      color: '#ffe800',
      text: 'Primera cita',
    },
    {
      color: '#0000ff',
      text: 'Cita en línea',
    },
  ];

  return (
    <>
      <DialogTitle align="center">Colores de estatus </DialogTitle>
      <DialogContent>
        <Stack>
          <List
            sx={{
              pl: 1,
              '& .MuiListItem-root': {
                display: 'list-item',
              },
            }}
          >
            {colors.map((color, index) => (
              <Stack
                direction="row"
                alignItems="center"
                key={index}
                spacing={3}
                sx={{
                  px: { xs: 1, md: 2 },
                  py: 1,
                  borderRadius: '5px',
                  margin: '5px 0',
                }}
              >
                <Box
                  sx={{
                    minWidth: 60,
                    maxWidth: 60,
                    width: 60,
                    minHeight: 30,
                    maxHeight: 30,
                    height: 30,
                    borderRadius: 20,
                    bgcolor: color.color,
                    opacity: 0.7,
                    '&:hover': {
                      opacity: 0.7,
                    },
                  }}
                />
                <Typography>{color.text}</Typography>
              </Stack>
            ))}
          </List>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" color="error" onClick={onClose}>
          Cerrar
        </Button>
      </DialogActions>
    </>
  );
}

ColorsDialog.propTypes = {
  onClose: PropTypes.func,
};
