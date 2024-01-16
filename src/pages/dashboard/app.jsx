import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Dialog, DialogContent } from '@material-ui/core';

import { Stack, Button, Typography, DialogActions } from '@mui/material';

import { OverviewAppView } from 'src/sections/overview/app/view';

import { useGetPending } from 'src/api/calendar-specialist';

// ----------------------------------------------------------------------

export default function OverviewAppPage() {
  const [open, setOpen] = useState(true);
  const {data: pendings} = useGetPending(''); // traer todas las citas sin finalzar que sean anterior a la fecha actual
  const items = pendings.map((pending) =>
    <Typography>{pending.titulo}</Typography>
  );

  const onClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Helmet>
        <title> Dashboard: App</title>
      </Helmet>

      <OverviewAppView />

      <Dialog open={open} fullWidth maxWidth="sm">
        <DialogContent>
          <Stack
            direction="row"
            justifyContent="center"
            useFlexGap
            flexWrap="wrap"
            sx={{ pt: { xs: 1, md: 2 }, pb: { xs: 1, md: 2 } }}
          >
            <Typography color="red" sx={{ mt: 1, mb: 1 }}>
              <strong>¡ATENCIÓN!</strong>
            </Typography>
          </Stack>
          <Typography>Hay citas sin finalizar</Typography>
          
            {items}
            
          
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={onClose}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
