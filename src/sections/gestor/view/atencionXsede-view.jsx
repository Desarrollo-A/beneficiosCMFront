import { useState, useEffect, useCallback } from 'react';

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
import CircularProgress from '@mui/material/CircularProgress';

import { useGetAreas } from 'src/api/areas';
import { getSedes, saveAtencionXSede } from 'src/api/sedes';
import { useGetOficinas } from 'src/api/oficinas';
import { useGetModalidades } from 'src/api/modalidades';
import { useGetEspecialistas, getActiveSedes } from 'src/api/especialistas';

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
  const [ sedes, setSedes ] = useState([])
  const [ activas, setActivas ] = useState([])
  const [ loadingActivas, setLoadingActivas ] = useState(false)
  const [ allChecked, setAllChecked ] = useState(false)

  const { areas, areasLoading } = useGetAreas()
  const { especialistas, especialistasLoading } = useGetEspecialistas(area, {area})
  // const { sedes: lista_activas, getSedesPresenciales } = useGetSedesPresenciales({ idEspecialista: especialista })
  // const { sedes: lista_sedes, getSedes } = useGetSedes()
  // const { oficinas } = useGetOficinas(sede, {sede})
  const { modalidades } = useGetModalidades(true)

  const handleChangeArea = (are) => {
    setArea(are)
    setEspecialista(null)
    setModalidad(null)
  }

  const handleChangeEspecialista = (espe) => {
    setEspecialista(espe)
    setModalidad(null)
  }

  const handleChangeModalidad = async(moda) => {
    setModalidad(moda)

    getActivas()
  }

  const handleCheckSede = async(sed, checked) => {
    // console.log({area, especialista, modalidad, sed, checked})

    const tmp_sedes = [...sedes]

    const index = tmp_sedes.findIndex(pres => pres.idsede === sed)

    if(index !== -1){
      tmp_sedes[index].active = checked
    }

    setSedes(tmp_sedes)

    await saveAtencionXSede({area, especialista, modalidad, sede: sed, checked})
  }

  const getActivas = async() => {
    setLoadingActivas(true)
    const act = await getActiveSedes({modalidad, especialista})

    setActivas(act)
  }

  const getListSedes = async() => {
    const seds = await getSedes()

    setSedes(seds)
  }

  const checkAllchecked = () => {
    const total = sedes.every(sed => sed.active === true)

    setAllChecked(total)
  }

  const buildChecked = () => {
    const tmp = [...sedes]

    tmp.map((sed) => {
      const exist = activas.find(activa => sed.idsede === activa.value)

      if(exist){
        sed.active = true
      }else{
        sed.active = false
      }

      return true
    })

    setSedes(tmp)

    setLoadingActivas(false)
  }

  const handleCheckAll = (checked) => {
    const tmp = [...sedes]

    tmp.map((sed) => {
      sed.active = checked

      saveAtencionXSede({area, especialista, modalidad, sede: sed.idsede, checked})

      return true
    })

    setSedes(tmp)
  }

  useEffect(() => {
    checkAllchecked()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sedes])

  useEffect(() => {
    buildChecked()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activas])

  useEffect(() => {
    if(modalidad){
      getActivas()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalidad])

  useEffect(() => {
    getListSedes()
  }, [])

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

      <Card sx={{ marginTop: 1, padding: 1 }} >

        <Stack direction='row' spacing={3} divider={<Divider flexItem orientation='vertical' />} >
          <Stack sx={{ flex: 1 }} >
            <Typography variant='h6' sx={{ marginBottom: 1, paddingLeft: 1 }} >Areas</Typography>
            {areasLoading ?
              <LinearProgress />
            :
              <Divider flexItem orientation='horizontal' />
            }
            <List>
              {areas.map((are, index) => (
                <ListItemButton key={index} onClick={() => handleChangeArea(are.idAreaBeneficio)}>
                  <Typography sx={{ fontWeight: are.idAreaBeneficio === area ? 'bold' : '' }}>{are.nombre} ({are.especialistas})</Typography>
                </ListItemButton>
              ))}
            </List>
          </Stack>

          {area && (
            <Stack sx={{ flex: 1 }} >
              <Typography variant='h6' sx={{ marginBottom: 1, paddingLeft: 1 }} >Especialistas</Typography>
              {especialistasLoading ?
                <LinearProgress />
              :
                <Divider flexItem orientation='horizontal' />
              }
              <List>
                {especialistas.map((espe, index) => (
                  <ListItemButton key={index} onClick={() => handleChangeEspecialista(espe.idUsuario)}>
                    <Typography sx={{ fontWeight: espe.idUsuario === especialista ? 'bold' : '' }}>{espe.nombre}</Typography>
                  </ListItemButton>
                ))}
              </List>
            </Stack>
          )}

          {especialista && (
            <>
              <Stack sx={{ flex: 1 }} >
                <Typography variant='h6' sx={{ marginBottom: 1, paddingLeft: 1 }} >Modalidad</Typography>
                <Divider flexItem orientation='horizontal' />
                <List>
                  {modalidades.map((moda, index) => (
                    <ListItemButton key={index} onClick={() => handleChangeModalidad(moda.idOpcion)}>
                      <Typography sx={{ fontWeight: moda.idOpcion === modalidad ? 'bold' : '' }}>{moda.nombre}</Typography>
                    </ListItemButton>
                  ))}
                </List>
              </Stack>
            </>
            )}

          {modalidad && (
            <>
              <Stack sx={{ flex: 1 }} >
                <Typography variant='h6' sx={{ marginLeft: 2 }} >
                  <Checkbox
                    edge="start"
                    checked={allChecked}
                    // indeterminate
                    onChange={ (event) => handleCheckAll(event.target.checked) }
                  />
                  Sedes
                </Typography>
                  
                {loadingActivas?
                  <LinearProgress />
                :
                  <Divider flexItem orientation='horizontal' />
                }
                {!loadingActivas && (
                  <List>
                    <Scrollbar sx={{ height: 500 }} >
                      {sedes.map((sed, index) => (
                        <ListItem key={index}>
                          <Checkbox
                            edge="start"
                            checked={ sed.active }
                            onChange={ (event) => handleCheckSede(sed.idsede, event.target.checked) }
                          />
                          {sed.nsede}
                        </ListItem>
                      ))}
                      </Scrollbar>
                  </List>
                )}
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

        </Stack>
      </Card>

  	</Container>
  )
}