import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { DialogContentText } from '@material-ui/core';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { alpha } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import ListItemButton from '@mui/material/ListItemButton';

import { endpoints } from 'src/utils/axios';

import { useAuthContext } from 'src/auth/hooks';
import { useGetGeneral } from 'src/api/general';

import Image from 'src/components/image';
import TextMaxLine from 'src/components/text-max-line';
import { MotionViewport } from 'src/components/animate';
// ----------------------------------------------------------------------

export default function Manuales() {
  const { user } = useAuthContext();

  const rol = user?.idRol;

  const { manualesData } = useGetGeneral(endpoints.ayuda.getManuales, 'manualesData');

  const [data, setData] = useState([]);

  const count = data.filter((item) => item.idRol === rol).length;

  useEffect(() => {
    setData(manualesData);
  }, [manualesData]);

  return (
    manualesData.length > 0 ? (
      <>
        <Typography
          variant="h6"
          sx={{
            my: { xs: 2, md: 2 },
          }}
        >
          Manuales
        </Typography>

        <Box
          component={MotionViewport}
          gap={3}
          display="grid"
          gridTemplateColumns={{
            md: 'repeat(1, 1fr)',
            lg: `repeat(${count}, 1fr)`,
          }}
          className="fade-in"
        >
          {data.map((category, index) =>
            rol === category.idRol ? <CardDesktop key={index} category={category} /> : null
          )}
        </Box>

      </>
    ) : (
      <>
        <Grid container spacing={2} justifyContent="center" alignItems="center">
          <Grid md={4} xs={12}>
            <Box sx={{ borderRadius: 2, backgroundColor: "#ECECEC", animation: 'pulse 1.5s infinite', p: 5 }} />
          </Grid>
          <Grid md={4} xs={12}>
            <Box sx={{ borderRadius: 2, backgroundColor: "#ECECEC", animation: 'pulse 1.5s infinite', p: 5 }} />
          </Grid>
          <Grid md={4} xs={12}>
            <Box sx={{ borderRadius: 2, backgroundColor: "#ECECEC", animation: 'pulse 1.5s infinite', p: 5 }} />
          </Grid>
        </Grid>

        <Box mb={2} />
      </>
    )
  );
}

// ----------------------------------------------------------------------

function CardDesktop({ category }) {
  const { titulo, icono, video } = category;

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: 2,
          cursor: 'pointer',
          textAlign: 'center',
          '&:hover': {
            bgcolor: 'background.paper',
            boxShadow: (theme) => theme.customShadows.z20,
          },
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          border: (theme) => `dashed 1px ${theme.palette.divider}`,
        }}
        onClick={handleClickOpen}
      >
        <Image
          disabledEffect
          alt={icono}
          src={icono}
          sx={{ mb: 2, width: 80, height: 80, mx: 'auto' }}
        />

        <TextMaxLine variant="subtitle2" persistent>
          {titulo}
        </TextMaxLine>
      </Paper>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="lg"
      >
        <DialogTitle id="alert-dialog-title">Manual de {titulo}</DialogTitle>
        <DialogContent>
          {video ? (
            <video width="100%" controls>
              <source src={video} type="video/mp4" />
              <track kind="captions" srcLang="es" label="Español" default />
              Tu navegador no soporta la reproducción de videos.
            </video>
          ) : (
            <DialogContentText id="alert-dialog-description">
              No hay video disponible
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="error" variant="contained" onClick={handleClose}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

CardDesktop.propTypes = {
  category: PropTypes.object,
};

// ----------------------------------------------------------------------

function CardMobile({ category }) {
  const { titulo, icono } = category;

  return (
    <ListItemButton
      key={titulo}
      sx={{
        py: 2,
        maxWidth: 140,
        borderRadius: 1,
        textAlign: 'center',
        alignItems: 'center',
        typography: 'subtitle2',
        flexDirection: 'column',
        justifyContent: 'center',
        bgcolor: 'background.neutral',
      }}
    >
      <Image alt={icono} src={icono} sx={{ width: 48, height: 48, mb: 1 }} />

      {category.titulo}
    </ListItemButton>
  );
}

CardMobile.propTypes = {
  category: PropTypes.object,
};
