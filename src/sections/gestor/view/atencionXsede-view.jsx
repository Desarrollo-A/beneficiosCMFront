import { useState } from 'react';

import List from '@mui/material/List';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import ListItem from '@mui/material/ListItem';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';
import LinearProgress from '@mui/material/LinearProgress';

import { useGetAreas } from 'src/api/areas';
import { useGetSedes } from 'src/api/sedes';
import { useGetOficinas } from 'src/api/oficinas';
import { useGetEspecialistas } from 'src/api/especialistas';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Scrollbar from 'src/components/scrollbar';

//---------------------------------------------------------

export default function AtencionXsedeView() {
  const settings = useSettingsContext()

  const [ area, setArea ] = useState(null)
  const [ sede, setSede ] = useState(null)
  const [ especialista, setEspecialista ] = useState(null)

  const { areas, areasLoading } = useGetAreas()
  const { especialistas, especialistasLoading } = useGetEspecialistas(area, {area})
  const { sedes } = useGetSedes()
  const { oficinas } = useGetOficinas(sede, {sede})

  const handleChangeArea = (area) => {
    setArea(area)
    setEspecialista(null)
  }

  return (
  	<Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Atención por sede"
        links={[
          { name: 'Gestor' },
          { name: 'Atención por sede' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      { (areasLoading || especialistasLoading) && <LinearProgress />}

      <Card sx={{ marginTop: 1, padding: 1 }} >

        <Stack direction='row' spacing={3} divider={<Divider flexItem orientation='vertical' />} >
          <Stack sx={{ flex: 1 }} >
            <Typography variant='h6' >Areas</Typography>
            <Divider flexItem orientation='horizontal' />
            <List>
              {areas.map((are, index) => (
                <ListItemButton onClick={() => handleChangeArea(are.idAreaBeneficio)}>
                  <Typography sx={{ fontWeight: are.idAreaBeneficio === area ? 'bold' : '' }}>{are.nombre} ({are.especialistas})</Typography>
                </ListItemButton>
              ))}
            </List>
          </Stack>

          {area && (
            <Stack sx={{ flex: 1 }} >
              <Typography variant='h6' >Especialistas</Typography>
              <Divider flexItem orientation='horizontal' />
              <List>
                {especialistas.map((espe, index) => (
                  <ListItemButton  onClick={() => setEspecialista(espe.idUsuario)}>
                    <Typography sx={{ fontWeight: espe.idUsuario === especialista ? 'bold' : '' }}>{espe.nombre}</Typography>
                  </ListItemButton>
                ))}
              </List>
            </Stack>
          )}

          {especialista && (
            <>
              <Stack sx={{ flex: 1 }} >
                <Typography variant='h6' >Modalidad</Typography>
                <Divider flexItem orientation='horizontal' />
                <List>
                  <ListItemButton>
                    <Checkbox
                      edge="start"
                      checked
                      disableRipple
                    />
                    Presencial
                  </ListItemButton>
                  <ListItemButton>
                    <Checkbox
                      edge="start"
                      checked
                      disableRipple
                    />
                    Remota
                  </ListItemButton>
                </List>
              </Stack>
              <Stack sx={{ flex: 1 }} >
                <Typography variant='h6' >Sedes</Typography>
                <Divider flexItem orientation='horizontal' />
                <List>
                  <Scrollbar sx={{ height: 500 }} >
                    {sedes.map((sede, index) => (
                      <ListItemButton onClick={() => setSede(sede.idsede)}>
                        <Checkbox
                          edge="start"
                          checked
                          disableRipple
                        />
                        {sede.nsede}
                      </ListItemButton>
                    ))}
                    </Scrollbar>
                </List>
              </Stack>
              <Stack sx={{ flex: 1 }} >
                <Typography variant='h6' >Oficina</Typography>
                <Divider flexItem orientation='horizontal' />
                <List>
                  {oficinas.map((ofi, index) => (
                    <ListItemButton>
                      {ofi.noficina}
                    </ListItemButton>
                  ))}
                </List>
              </Stack>
            </>
          )}

        </Stack>
      </Card>

  	</Container>
  )
}