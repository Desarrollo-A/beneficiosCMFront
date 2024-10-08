import { useState } from 'react';
import PropTypes from 'prop-types';

import { Box } from '@mui/system';
import { Dialog } from '@mui/material';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Grid from '@mui/system/Unstable_Grid/Grid';
import useMediaQuery from '@mui/material/useMediaQuery';
import LinearProgress from '@mui/material/LinearProgress';

import { useResponsive } from 'src/hooks/use-responsive';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import ColorsStatusDialog from './components/colors-dialog';

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
  onChangeView,
  onOpenFilters,
}) {
  const smUp = useResponsive('up', 'sm');

  const isMobile = useMediaQuery('(max-width: 960px)');

  const popover = usePopover();

  const selectedItem = VIEW_OPTIONS.filter((item) => item.value === view)[0];

  const fechaTitulo = new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: 'long' }).format(
    date
  );

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

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
          <Grid
            item
            container
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={1}
            sx={{ width: '100%' }}
          >
            <Grid item xs={6}>
              <Button fullWidth size="small" color="error" variant="contained" onClick={onToday}>
                Hoy
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                size="small"
                color="primary"
                variant="contained"
                onClick={() => handleOpen()}
              >
                Leyenda
              </Button>
            </Grid>
          </Grid>

          <Box mb={3} />

          <Grid item container alignItems="center" justifyContent="space-between" spacing={1}>
            <Button
              size="small"
              color="inherit"
              onClick={popover.onOpen}
              endIcon={<Iconify icon="eva:arrow-ios-downward-fill" sx={{ ml: -0.5 }} />}
            >
              Agenda
            </Button>

            <Grid item container direction="row" alignItems="center" spacing={1}>
              <IconButton onClick={onPrevDate}>
                <Iconify icon="eva:arrow-ios-back-fill" />
              </IconButton>

              <Typography variant="h6">{fechaTitulo}</Typography>

              <IconButton onClick={onNextDate}>
                <Iconify icon="eva:arrow-ios-forward-fill" />
              </IconButton>
            </Grid>
          </Grid>

          <Dialog
            open={open}
            fullWidth
            maxWidth="xs"
            onClose={() => handleClose()}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            {/* Aquí deberías ajustar el componente ColorsDialog según tus necesidades */}
            <ColorsStatusDialog onClose={() => handleClose()} />
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
          justifyContent="space-between"
          sx={{ p: 2.5, pr: 2, position: 'relative' }}
        >
          {smUp && (
            <Button
              size="small"
              color="inherit"
              onClick={popover.onOpen}
              startIcon={<Iconify icon={selectedItem.icon} />}
              endIcon={<Iconify icon="eva:arrow-ios-downward-fill" sx={{ ml: -0.5 }} />}
            >
              {selectedItem.label}
            </Button>
          )}

          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton onClick={onPrevDate}>
              <Iconify icon="eva:arrow-ios-back-fill" />
            </IconButton>

            <Typography variant="h6">{fechaTitulo}</Typography>

            <IconButton onClick={onNextDate}>
              <Iconify icon="eva:arrow-ios-forward-fill" />
            </IconButton>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Button size="small" color="error" variant="contained" onClick={onToday}>
              Hoy
            </Button>
            <Button size="small" color="primary" variant="contained" onClick={() => handleOpen()}>
              Leyenda
            </Button>
          </Stack>

          <Dialog // dialog de confirmación de finalización
            open={open}
            fullWidth
            maxWidth="xs"
            onClose={() => handleClose()}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <ColorsStatusDialog onClose={() => handleClose()} />
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
  view: PropTypes.oneOf(['dayGridMonth', 'timeGridWeek', 'timeGridDay', 'listWeek']),
};
