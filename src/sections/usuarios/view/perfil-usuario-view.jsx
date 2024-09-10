import { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Stack from '@mui/system/Stack';
import Container from '@mui/material/Container';
import Tabs, { tabsClasses } from '@mui/material/Tabs';

import { paths } from 'src/routes/paths';

import { useMockedUser } from 'src/hooks/use-mocked-user';

import { useAuthContext } from 'src/auth/hooks';
import { _userAbout, _userFeeds, _userFriends, _userGallery, _userFollowers } from 'src/_mock';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import EventsList from '../events-list';
import ProfileCover from '../profile-cover';
import GafeteDigital from '../gafete-digital';
import DatosPersonales from '../datos-personales';

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
];
// ----------------------------------------------------------------------

export default function PerfilUsuarioView() {
  const settings = useSettingsContext();
  const { user } = useMockedUser();
  const { user: userdata } = useAuthContext();

  const [searchFriends, setSearchFriends] = useState('');

  const [currentTab, setCurrentTab] = useState('datos');

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const handleSearchFriends = useCallback((event) => {
    setSearchFriends(event.target.value);
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
          role={userdata?.puesto}
          name={userdata?.nombre}
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
