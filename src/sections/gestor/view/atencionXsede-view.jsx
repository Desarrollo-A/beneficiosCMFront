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
import { useGetSedes, saveAtencionXSede } from 'src/api/sedes';
import { useGetOficinas } from 'src/api/oficinas';
import { useGetModalidades } from 'src/api/modalidades';
import { useGetEspecialistas, useGetSedesPresenciales } from 'src/api/especialistas';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Scrollbar from 'src/components/scrollbar';

//---------------------------------------------------------

export default function AtencionXsedeView() {
  const settings = useSettingsContext()

  const [ area, setArea ] = useState(null)
  const [ sede, setSede ] = useState(null)
  const [ especialista, setEspecialista ] = useState(null)
  const [ modalidad, setModalidad ] = useState(null)

  const { areas, areasLoading } = useGetAreas()
  const { especialistas, especialistasLoading } = useGetEspecialistas(area, {area})
  const { sedes: presenciales } = useGetSedesPresenciales({ idEspecialista: especialista })
  const { sedes, getSedes } = useGetSedes()
  const { oficinas } = useGetOficinas(sede, {sede})
  const { modalidades } = useGetModalidades(true)

  const handleChangeArea = (area) => {
    setArea(area)
    setEspecialista(null)
    setModalidad(null)
  }

  const handleChangeEspecialista = (espe) => {
    setEspecialista(espe)
    setModalidad(null)
  }

  const handleChangeModalidad = (moda) => {
    setModalidad(moda)
  }

  const handleCheckSede = async(sede, checked) => {
    await saveAtencionXSede({area, especialista, modalidad, sede, checked})
    getSedes()
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
                  <ListItemButton  onClick={() => handleChangeEspecialista(espe.idUsuario)}>
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
                  {modalidades.map((moda, index) => (
                    <ListItemButton onClick={() => handleChangeModalidad(moda.idOpcion)}>
                      <Typography sx={{ fontWeight: moda.idOpcion === modalidad ? 'bold' : '' }}>{moda.nombre}</Typography>
                    </ListItemButton>
                  ))}
                </List>
              </Stack>

              {modalidad && (
                <>
                  <Stack sx={{ flex: 1 }} >
                    <Typography variant='h6' >Sedes</Typography>
                    <Divider flexItem orientation='horizontal' />
                    <List>
                      <Scrollbar sx={{ height: 500 }} >
                        <ListItem>
                          <Checkbox
                            edge="start"
                            checked={ true }
                            indeterminate={ true }
                            onChange={ (event) => console.log(event.target.checked) }
                          />
                          Todas
                        </ListItem>
                        {sedes.map((sed, index) => (
                          <ListItem>
                            <Checkbox
                              edge="start"
                              checked={ presenciales.find(pres => pres.value == sed.idsede ) }
                              onChange={ (event) => handleCheckSede(sed.idsede, event.target.checked) }
                            />
                            {sed.nsede}
                          </ListItem>
                        ))}
                        </Scrollbar>
                    </List>
                  </Stack>
                  {/*
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
                  */}
                </>
              )}
            </>
          )}

        </Stack>
      </Card>

  	</Container>
  )
}