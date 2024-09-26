import { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Stack from '@mui/system/Stack';
import Container from '@mui/material/Container';
import Tabs, { tabsClasses } from '@mui/material/Tabs';

import { paths } from 'src/routes/paths';

import { useMockedUser } from 'src/hooks/use-mocked-user';

import { useAuthContext } from 'src/auth/hooks';
import { _userAbout, _userFeeds } from 'src/_mock';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';

import EventsList from '../events-list';
import ProfileCover from '../profile-cover';
import GafeteDigital from '../gafete-digital';
// import AsesorView from '../asesorCh/asesor-view';
import DatosPersonales from '../datos-personales';
 // import CalculadoraNomina from '../calculadora-nomina';
 // import RelojChecador from '../checador/reloj-checador';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'datos',
    label: 'Datos personales',
    icon: <Iconify icon="iconamoon:profile-circle-fill" width={24} />,
  },
  {
    value: 'gafete',
    label: 'Gafete digital',
    icon: <Iconify icon="clarity:id-badge-solid" width={24} />,
  },
  {
    value: 'checador',
    label: 'Reloj checador',
    icon: <Iconify icon="fluent:clock-bill-24-filled" width={24} />,
  },
  {
    value: 'calculadora',
    label: 'Calculadora de nómina',
    icon: <Iconify icon="solar:calculator-minimalistic-bold" width={24} />,
  },
  {
    value: 'eventos',
    label: 'Eventos corporativos',
    icon: <Iconify icon="streamline:champagne-party-alcohol-solid" width={24} />,
  },
  {
    value: 'capital',
    label: 'Tu ejecutivo de CH',
    icon: <Iconify icon="fluent:people-team-24-filled" width={24} />,
  },
];
// ----------------------------------------------------------------------

export default function PerfilUsuarioView() {
  const settings = useSettingsContext();
  const { user } = useMockedUser();
  const { user: userdata } = useAuthContext();

  const [currentTab, setCurrentTab] = useState('datos');

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <Card
        sx={{
          mb: 3,
          height: 290,
        }}
      >
        <ProfileCover
          sex={user?.sexo}
          role={user?.puesto}
          name={user?.nombre}
          avatarUrl={user?.photoURL}
          coverUrl={_userAbout.coverUrl}
        />

        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          sx={{
            width: 1,
            bottom: 0,
            zIndex: 9,
            position: 'absolute',
            bgcolor: 'background.paper',
            [`& .${tabsClasses.flexContainer}`]: {
              pr: { md: 3 },
              justifyContent: {
                sm: 'center',
                md: 'flex-center',
              },
            },
          }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} icon={tab.icon} label={tab.label} />
          ))}
        </Tabs>
      </Card>

      {currentTab === 'datos' && <DatosPersonales info={_userAbout} posts={_userFeeds} />}

       {/* {currentTab === 'checador' && <RelojChecador info={_userAbout} posts={_userFeeds} />} */}

      {/* {currentTab === 'calculadora' && <CalculadoraNomina />} */}

      {currentTab === 'gafete' && <GafeteDigital />}

      {/* {currentTab === 'friends' && (
        <ProfileFriends
          friends={_userFriends}
          searchFriends={searchFriends}
          onSearchFriends={handleSearchFriends}
        />
      )} */}

      {/* {currentTab === 'gallery' && <ProfileGallery gallery={_userGallery} />} */}

      {/* {currentTab === 'eventos' && <Stack>{JSON.stringify(userdata)}</Stack>} */}
      {currentTab === 'eventos' && <EventsList info={_userAbout} posts={_userFeeds} />}
    </Container>
  );
}
