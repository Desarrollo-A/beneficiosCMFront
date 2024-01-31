import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';

import { useOffSetTop } from 'src/hooks/use-off-set-top';
import { useResponsive } from 'src/hooks/use-responsive';

import { endpoints } from 'src/utils/axios';

import { bgBlur } from 'src/theme/css';
import { useAuthContext } from 'src/auth/hooks';
import { usePostGeneral } from 'src/api/general';

import Logo from 'src/components/logoMini';
import SvgColor from 'src/components/svg-color';
import { useSettingsContext } from 'src/components/settings';

import Searchbar from '../common/searchbar';
import { NAV, HEADER } from '../config-layout';
import SettingsButton from '../common/settings-button';
import AccountPopover from '../common/account-popover';
import NotifiEncuesta from '../common/notificacion-encuesta';
import NotificationsPopover from '../common/notifications-popover';

// ----------------------------------------------------------------------
export default function Header({ onOpenNav }) {
  const theme = useTheme();

  const { user: datosUser } = useAuthContext();

  const idUsr = datosUser.idUsuario;

  const settings = useSettingsContext();

  const isNavHorizontal = settings.themeLayout === 'horizontal';

  const isNavMini = settings.themeLayout === 'mini';

  const lgUp = useResponsive('up', 'lg');

  const offset = useOffSetTop(HEADER.H_DESKTOP);

  const offsetTop = offset && !isNavHorizontal;

  const currentYear = new Date().getFullYear();
  
  const getTrimestreAnterior = () => {
    const currentMonth = new Date().getMonth();
  
    let startMonth = 0;
    let startYear = 0;

    if (currentMonth >= 0 && currentMonth <= 2) {
      startMonth = 9; 
      startYear = currentYear - 1;
    } else if (currentMonth >= 3 && currentMonth <= 5) {
      startMonth = 0; 
      startYear = currentYear;
    } else if (currentMonth >= 6 && currentMonth <= 8) {
      startMonth = 3; 
      startYear = currentYear;
    } else {
      startMonth = 6; 
      startYear = currentYear;
    }
  
    const startDate = new Date(startYear, startMonth, 1);
    startDate.setDate(startDate.getDate() + 2); 
  
    return startDate;
  };
  
  const trimestreAnterior = getTrimestreAnterior().toISOString().split('T')[0];

  let trimestreActual = '';

  const date = new Date();

  const currentMonth = new Date().getMonth();

  let trimestre = '';
  
    if (currentMonth >= 0 && currentMonth <= 2) {
      trimestreActual = new Date(currentYear, 0, 1).toISOString().split('T')[0];

      const firstQuarter = new Date(currentYear, 0, 1);
      if (date > firstQuarter) {
        trimestre = new Date(currentYear, 3, 1).toISOString().split('T')[0];
      } else {
        trimestre = new Date(currentYear, 0, 1).toISOString().split('T')[0];
      }

    } else if (currentMonth >= 3 && currentMonth <= 5) {
      trimestreActual = new Date(currentYear, 3, 1).toISOString().split('T')[0];

      const secondQuarter = new Date(currentYear, 3, 1);
      if (date > secondQuarter) {
        trimestre = new Date(currentYear, 6, 1).toISOString().split('T')[0];
      } else {
        trimestre = new Date(currentYear, 3, 1).toISOString().split('T')[0];
      }

    } else if (currentMonth >= 6 && currentMonth <= 8) {
      trimestreActual = new Date(currentYear, 6, 1).toISOString().split('T')[0];

      const thirdQuarter = new Date(currentYear, 6, 1);
      if (date > thirdQuarter) {
        trimestre =  new Date(currentYear, 9, 1).toISOString().split('T')[0];
      } else {
        trimestre =  new Date(currentYear, 6, 1).toISOString().split('T')[0];
      }

    } else {
      trimestreActual = new Date(currentYear, 9, 1).toISOString().split('T')[0];
      trimestre =  new Date(currentYear, 9, 1).toISOString().split('T')[0];
    }

  const fechaActual = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const array = {
      idUsuario: idUsr,
      vigenciaInicio: trimestreAnterior,
      vigenciaFin: trimestreActual,
      trimDefault: trimestre,
      fechActual: fechaActual,
    }
    
    setDataNot(array)
  }, [idUsr, 
      trimestreAnterior, 
      trimestreActual,
      trimestre,
      fechaActual])

  const [dataNot, setDataNot] = useState({
    idUsuario: idUsr,
    vigenciaInicio: trimestreAnterior,
    vigenciaFin: trimestreActual,
    trimDefault: trimestre,
    fechActual: fechaActual,
  });

  const { getData } = usePostGeneral(dataNot, endpoints.encuestas.getEncNotificacion, "getData");

  const renderContent = (
    <>
      {lgUp && isNavHorizontal && <Logo sx={{ mr: 2.5 }} />}

      {!lgUp && (
        <IconButton onClick={onOpenNav}>
          <SvgColor src="/assets/icons/navbar/ic_menu_item.svg" />
        </IconButton>
      )}

      <Searchbar />

      <Stack
        flexGrow={1}
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        spacing={{ xs: 0.5, sm: 1 }}
      >

        {/* <NotificationsPopover /> */}

        {getData.length > 0 && <NotifiEncuesta data={getData} />}

        <SettingsButton />

        <AccountPopover />
      </Stack>
    </>
  );

  return (
    <AppBar
      sx={{
        height: HEADER.H_MOBILE,
        zIndex: theme.zIndex.appBar + 1,
        ...bgBlur({
          color: theme.palette.background.default,
        }),
        transition: theme.transitions.create(['height'], {
          duration: theme.transitions.duration.shorter,
        }),
        ...(lgUp && {
          width: `calc(100% - ${NAV.W_VERTICAL + 1}px)`,
          height: HEADER.H_DESKTOP,
          ...(offsetTop && {
            height: HEADER.H_DESKTOP_OFFSET,
          }),
          ...(isNavHorizontal && {
            width: 1,
            bgcolor: 'background.default',
            height: HEADER.H_DESKTOP_OFFSET,
            borderBottom: `dashed 1px ${theme.palette.divider}`,
          }),
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_MINI + 1}px)`,
          }),
        }),
      }}
    >
      <Toolbar
        sx={{
          height: 1,
          px: { lg: 5 },
        }}
      >
        {renderContent}
      </Toolbar>
    </AppBar>
  );
}

Header.propTypes = {
  onOpenNav: PropTypes.func,
};
