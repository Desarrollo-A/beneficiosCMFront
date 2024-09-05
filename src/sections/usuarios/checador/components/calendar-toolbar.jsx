import { useState } from 'react';
import PropTypes from 'prop-types';

import { Box } from '@mui/system';
import { Dialog } from '@mui/material';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Grid from '@mui/system/Unstable_Grid/Grid';
import useMediaQuery from '@mui/material/useMediaQuery';
import LinearProgress from '@mui/material/LinearProgress';

import { HOST } from 'src/config-global';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import ColorsDialog from './colors-status-dialog';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));

// ----------------------------------------------------------------------

const VIEW_OPTIONS = [
  {
    value: 'dayGridMonth',
    label: 'Mes',
    icon: 'mingcute:calendar-month-line',
  },
  { value: 'timeGridWeek', label: 'Semana', icon: 'mingcute:calendar-week-line' },
  { value: 'timeGridDay', label: 'Día', icon: 'mingcute:calendar-day-line' },
];

// ----------------------------------------------------------------------

export default function CalendarToolbar({
  date,
  view,
  loading,
  onToday,
  onNextDate,
  onPrevDate,
  labels,
  onChangeView,
  onOpenFilters,
}) {
  const isMobile = useMediaQuery('(max-width: 960px)');

  const popover = usePopover();

  const fechaTitulo = new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: 'long' }).format(
    date
  );

  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {isMobile ? (
        <Grid
          container
          direction="column"
          alignItems="center"
          justifyContent="space-between"
          sx={{ p: 2.5, pr: 2, position: 'relative' }}
        >
          <Grid container alignItems="center" justifyContent="space-between" spacing={1}>
            <Grid container direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6">{fechaTitulo}</Typography>
            </Grid>
          </Grid>
          <Box mb={3} />
          <Grid
            container
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={1}
            sx={{ width: '100%' }}
          >
            <Grid xs={6}>
              <Button
                target="_blank"
                variant="contained"
                color="info"
                style={{ textAlign: 'center' }}
                href={`${HOST}/dist/documentos/solicitud-permiso/solicitudPermiso.pdf`}
              >
                Solicitud de permiso
              </Button>
            </Grid>
          </Grid>

          {/* Aquí deberías ajustar el componente ColorsDialog según tus necesidades */}
          <Dialog // dialog de confirmación de finalización
            open={open}
            fullWidth
            maxWidth="xs"
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <ColorsDialog onClose={() => handleClose()} />
          </Dialog>

          {loading && (
            <LinearProgress
              color="inherit"
              sx={{
                height: 2,
                width: 1,
                position: 'absolute',
                bottom: 0,
                left: 0,
              }}
            />
          )}
        </Grid>
      ) : (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          sx={{ p: 2.5, pr: 2, position: 'relative' }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={4} alignContent="center" />
              <Grid item xs={4} alignContent="center">
                <Item>
                  <Typography variant="h6">{fechaTitulo}</Typography>
                </Item>
              </Grid>
              <Grid item xs={4}>
                <Item>
                  <Button
                    target="_blank"
                    variant="contained"
                    color="info"
                    href={`${HOST}/dist/documentos/solicitud-permiso/solicitudPermiso.pdf`}
                  >
                    Solicitud de permiso
                  </Button>
                </Item>
              </Grid>
            </Grid>
          </Box>

          {loading && (
            <LinearProgress
              color="inherit"
              sx={{
                height: 2,
                width: 1,
                position: 'absolute',
                bottom: 0,
                left: 0,
              }}
            />
          )}
        </Stack>
      )}

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="top-left"
        sx={{ width: 160 }}
      >
        {VIEW_OPTIONS.map((viewOption) => (
          <MenuItem
            key={viewOption.value}
            selected={viewOption.value === view}
            onClick={() => {
              popover.onClose();
              onChangeView(viewOption.value);
            }}
          >
            <Iconify icon={viewOption.icon} />
            {viewOption.label}
          </MenuItem>
        ))}
      </CustomPopover>
    </>
  );
}

CalendarToolbar.propTypes = {
  date: PropTypes.object,
  loading: PropTypes.bool,
  onChangeView: PropTypes.func,
  onNextDate: PropTypes.func,
  onOpenFilters: PropTypes.func,
  onPrevDate: PropTypes.func,
  onToday: PropTypes.func,
  labels: PropTypes.any,
  view: PropTypes.oneOf(['dayGridMonth', 'timeGridWeek', 'timeGridDay', 'listWeek']),
};
