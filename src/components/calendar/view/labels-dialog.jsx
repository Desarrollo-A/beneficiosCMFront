import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent } from '@material-ui/core';

import { Box, List, Stack, Button, Typography, DialogActions } from '@mui/material';

//---------------------------------------------------------

export default function LabelsDialog({ open, labels=[], onClose }) {

  return (
    <Dialog // dialog de confirmación de finalización
      open={open}
      fullWidth
      maxWidth="xs"
      
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
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
            {labels.map((color, index) => (
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
    </Dialog>
  );
}

LabelsDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};
