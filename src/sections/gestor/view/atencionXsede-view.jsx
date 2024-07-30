import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Card from '@mui/material/Card';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import ListItem from '@mui/material/ListItem';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import ListItemButton from '@mui/material/ListItemButton';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import ArrowIcon from '@mui/icons-material/KeyboardArrowRight';

import { useGetAreas } from 'src/api/areas';
import { getSedes, saveAtencionXSede, saveOficinaXSede } from 'src/api/sedes';
import { useGetOficinas } from 'src/api/oficinas';
import { useGetModalidades } from 'src/api/modalidades';
import { useGetEspecialistas, getActiveSedes } from 'src/api/especialistas';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Scrollbar from 'src/components/scrollbar';

//---------------------------------------------------------

const HEIGHT = 600

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
  const [ oficina, setOficina ] = useState(null)

  const { areas, areasLoading } = useGetAreas()
  const { especialistas, especialistasLoading } = useGetEspecialistas(area, {area})
  const { oficinas, oficinasLoading } = useGetOficinas(sede, {sede})
  const { modalidades } = useGetModalidades(true)

  const handleChangeArea = (are) => {
    setArea(are)
    setEspecialista(null)
    setModalidad(null)
    setSede(null)
  }

  const handleChangeEspecialista = (espe) => {
    setEspecialista(espe)
    setModalidad(null)
    setSede(null)
  }

  const handleChangeModalidad = async(moda) => {
    setModalidad(moda)
    setSede(null)

    setLoadingActivas(true)
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

  const buildChecked = (act) => {
    const tmp = [...sedes]

    tmp.map(sed => {

      const exist = act.find(activa => sed.idsede === activa.idSede)

      if(exist){
        sed.active = true
      }else{
        sed.active = false
      }

      return sed
    })

    setSedes(tmp)
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

  const handleChangeOficina = async(ofi) => {
    setOficina(ofi)

    await saveOficinaXSede({especialista, modalidad, sede, oficina: ofi})

    const index = activas.findIndex(sed => sed.idSede === sede)

    activas[index].idOficina = ofi
  }

  const handleChangeSede = (sed) => {
    setSede(sed)

    const ofi = activas.find(se => se.idSede === sed)

    if(ofi){
      setOficina(ofi.idOficina)
    }else{
      setOficina(null)
    }
    
  }

  useEffect(() => {
    checkAllchecked()
    setLoadingActivas(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sedes])

  useEffect(() => {
    buildChecked(activas)
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
            <Typography variant='h6' sx={{ marginBottom: 1, paddingLeft: 1 }} >Áreas</Typography>
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
                  <Scrollbar sx={{ height: HEIGHT }} >
                    {sedes.map((sed, index) => (
                      <ListItem key={index}>
                        <Checkbox
                          edge="start"
                          checked={ sed.active }
                          onChange={ (event) => handleCheckSede(sed.idsede, event.target.checked) }
                        />
                        <Typography sx={{ fontWeight: sed.idsede === sede ? 'bold' : '' }} >{sed.nsede}</Typography>
                        <Box sx={{ flex: 1 }}/>
                        {modalidad === 1 &&
                          <Tooltip title="Cambiar oficina de atención">
                            <IconButton onClick={ () => handleChangeSede(sed.idsede) }>
                              <ArrowIcon/>
                            </IconButton>
                          </Tooltip>
                        }
                      </ListItem>
                    ))}
                    </Scrollbar>
                </List>
              )}
            </Stack>
          )}
          { sede && (
            <Stack sx={{ flex: 1 }} >
              <Typography variant='h6' sx={{ marginBottom: 1, paddingLeft: 1 }} >Oficina</Typography>
              { oficinasLoading ?
                <LinearProgress />
              :
                <Divider flexItem orientation='horizontal' />
              }
              <Scrollbar sx={{ height: HEIGHT, overflowX: 'hidden', margin: 0, padding: 0 }} >
                <List>

                  <FormControl>
                    <RadioGroup
                      value={oficina}
                      onChange={(event) => handleChangeOficina(event.target.value)}
                    >
                      {oficinas.map((ofi, index) => (
                        <Box key={index} sx={{ marginBottom: 0.5 }}>
                          <FormControlLabel sx={{ marginLeft: 1.5, marginBottom: 0.5 }} value={ofi.idoficina} control={<Radio />} label={ofi.noficina} />
                        </Box>
                      ))}
                    </RadioGroup>
                  </FormControl>
                </List>
              </Scrollbar>
            </Stack>
          )}

        </Stack>
      </Card>

  	</Container>
  )
}