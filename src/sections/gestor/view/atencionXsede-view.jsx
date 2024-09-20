import { useState, useEffect } from 'react';
import { enqueueSnackbar } from 'notistack';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Card from '@mui/material/Card';
import { Dialog } from '@mui/material';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import ListItem from '@mui/material/ListItem';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import LinearProgress from '@mui/material/LinearProgress';
import ArrowIcon from '@mui/icons-material/KeyboardArrowRight';

import { useGetAreas } from 'src/api/areas';
import { useGetOficinas } from 'src/api/oficinas';
import { useGetModalidades } from 'src/api/modalidades';
import { getActiveSedes, useGetEspecialistas } from 'src/api/especialistas';
import { getSedes, saveOficinaXSede, saveAtencionXSede } from 'src/api/sedes';

import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import OficinasDialog from './oficinasDialog';

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
  const [ loadingActivas2, setLoadingActivas2 ] = useState(false)
  const [, setAllChecked ] = useState(false)
  const [ oficina, setOficina ] = useState(null)

  const { areas, areasLoading, areasEmpty } = useGetAreas()
  const { especialistas, especialistasLoading, especialistasEmpty } = useGetEspecialistas(area, {area})
  const { oficinas, oficinasLoading, oficinasEmpty } = useGetOficinas(sede, {sede})
  const { modalidades, modalidadesEmpty } = useGetModalidades(true)
  const theme = useTheme()
  const [open, setOpen] = useState(false)
  const [isLoad, setLoad] = useState(false)
  const [isSaving, setSaving] = useState(false) // para cuando se usa un checkbox y guardar sede
  const [hasOffice, setHasOffice] = useState(true)

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const onClose = () => {
    setOpen(false)
    getActivas()
  } 

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
    setSaving(true)
    const tmp_sedes = [...sedes]

    const index = tmp_sedes.findIndex(pres => pres.idsede === sed)

    if(index !== -1){
      tmp_sedes[index].active = checked
    }

    setSedes(tmp_sedes)

    const sede_rea = await saveAtencionXSede({area, especialista, modalidad, sede: sed, checked})

    if(sede_rea){
      if((sede_rea.idOficina === null || sede_rea.idOficina === 0) && sede_rea.estatus === 1 && sede_rea.tipoCita === 1){
        handleChangeSedeNew(sed)
        enqueueSnackbar("Se debe seleccionar una oficina", {variant: "info"});
      }
      else if((sede_rea.idOficina !== null || sede_rea.idOficina !== 0) && sede_rea.estatus === 1){
        // handleChangeSede(sed)
        enqueueSnackbar("Se ha activado la sede");
      }
      else {
        enqueueSnackbar("Se ha desactivado la sede");
      }
    }
    else{
      enqueueSnackbar("Error al guardar la sede", {variant: "error"});
    }

    getActivas() 
  }

  const handleSaveSede = async(sed, checked, ofi) => {
    setSaving(true)
    setLoad(true)
    const tmp_sedes = [...sedes]

    const index = tmp_sedes.findIndex(pres => pres.idsede === sed)

    if(index !== -1){
      tmp_sedes[index].active = checked
    }

    setSedes(tmp_sedes)

    const sede_rea = await saveAtencionXSede({area, especialista, modalidad, sede: sed, checked})

    if(sede_rea){
      if((sede_rea.idOficina !== null || sede_rea.idOficina !== 0) && sede_rea.estatus === 1){
        // handleChangeSede(sed)
        handleChangeOficina(ofi)
      }
      else{
        enqueueSnackbar("Error al guardar la atención por sede")
      }
    }
    else{
      enqueueSnackbar("Error al guardar la sede", {variant: "error"});
    }

    getActivas() 
  }

  const getActivas = async() => {
    setLoadingActivas2(true)
    const act = await getActiveSedes({modalidad, especialista})

    setActivas(act)
    setSaving(false)
    setLoadingActivas2(false)
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

  const handleChangeOficina = async(ofi) => {
    setOficina(ofi)

    const save = await saveOficinaXSede({especialista, modalidad, sede, oficina: ofi})
    const index = activas.findIndex(sed => sed.idSede === sede)

    if(hasOffice && activas[index]!== undefined){
      activas[index].idOficina = ofi

      setActivas(activas)    
    }

    getActivas()
    await sleep(3000)
  
    if(save.result){
      setHasOffice(true)
      setLoad(false)
      setOpen(false)
      enqueueSnackbar(save.message)
    }
    else{
      setHasOffice(true)
      setLoad(false)
      enqueueSnackbar(save.message, {variant: "error"})
    }   
    setSaving(false)
      
  }

  const handleChangeSedeNew = (sed) => { // independiente cuando se hace check en sede
    setSede(sed)

    const ofi = activas.find(se => se.idSede === sed)

    if(ofi){
      setHasOffice(true)
      setOpen(true)
      setOficina(ofi.idOficina)
    }
    else{
      setHasOffice(false)
      setOpen(true)
      setOficina(null)
    }
  }

  const handleChangeSede = (sed) => { // para el boton de arrows
    setSede(sed)
    
    const ofi = activas.find(se => se.idSede === sed)

    if(ofi){
      setHasOffice(true)
      setOpen(true)
      setOficina(ofi !== undefined ? ofi.idOficina : 0)
    }
    else{
      enqueueSnackbar("Se debe activar la sede antes de asignar una oficina", {variant: 'info'})
      setOficina(null)
    }
  }

  const handleChangeSedeCheck = (sed, checked) => { // para el boton de arrows
    setSede(sed)
    if(checked){
      const ofi = activas.find(se => se.idSede === sed)

      setHasOffice(true)
      setOpen(true)
      setOficina(ofi !== undefined ? ofi.idOficina : 0)
    }
    else{
      handleCheckSede(sed, checked)
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

        <Stack direction='row' spacing={3} >
          <Stack sx={{ flex: 1 }} >
            <Typography variant='h6' sx={{ marginBottom: 1, paddingLeft: 1 }} >Áreas</Typography>
            {areasLoading ?
              <LinearProgress />
            :
              <Divider flexItem orientation='horizontal' />
            }
            <List>
              {!areasEmpty && areas.map((are, index) => (
                <ListItemButton key={index} onClick={() => handleChangeArea(are.idAreaBeneficio)}>
                  <Typography sx={{ fontWeight: are.idAreaBeneficio === area ? 'bold' : '' }}>{are.nombre} ({are.especialistas})</Typography>
                </ListItemButton>
              ))}
            </List>
          </Stack>
          { area ? <Divider flexItem orientation='vertical' /> : ''}

          { area && (
            <Stack sx={{ flex: 1 }} >
              <Typography variant='h6' sx={{ marginBottom: 1, paddingLeft: 1 }} >Especialistas</Typography>
              {especialistasLoading ?
                <LinearProgress />
              :
                <Divider flexItem orientation='horizontal' />
              }
              <List>
                {!especialistasEmpty && especialistas.map((espe, index) => (
                  <ListItemButton key={index} onClick={() => handleChangeEspecialista(espe.idUsuario)}>
                    <Typography sx={{ fontWeight: espe.idUsuario === especialista ? 'bold' : '' }}>{espe.nombre}</Typography>
                  </ListItemButton>
                ))}
              </List>
            </Stack>
          )}
          { especialista ? <Divider flexItem orientation='vertical' /> : ''}
          {especialista && (
              <Stack sx={{ flex: 1 }} >
                <Typography variant='h6' sx={{ marginBottom: 1, paddingLeft: 1 }} >Modalidad</Typography>
                <Divider flexItem orientation='horizontal' />
                <List>
                  {!modalidadesEmpty && modalidades.map((moda, index) => (
                    <ListItemButton key={index} onClick={() => handleChangeModalidad(moda.idOpcion)}>
                      <Typography sx={{ fontWeight: moda.idOpcion === modalidad ? 'bold' : '' }}>{moda.nombre}</Typography>
                    </ListItemButton>
                  ))}
                </List>
              </Stack>
            )}
          { modalidad ? <Divider flexItem orientation='vertical' /> : ''}
          {modalidad && (
            <Stack sx={{ flex: 1 }} >
              <Typography variant='h6' sx={{ marginLeft: 2 }} >
                Sedes
              </Typography>
                
              {loadingActivas ?
                <LinearProgress />
              :
                <Divider flexItem orientation='horizontal' />
              }
              {!loadingActivas && (

                
                <List>{loadingActivas2 &&
                  <LinearProgress />
                }
                  <Scrollbar sx={{ height: HEIGHT }} >
                    {sedes.map((sed, index) => (                      
                      <ListItem key={index}>
                        <Checkbox
                          edge="start"
                          checked={ sed.active }
                          disabled={isSaving}
                          onChange ={ (event) => modalidad === 1 ? handleChangeSedeCheck(sed.idsede, event.target.checked) : handleCheckSede(sed.idsede, event.target.checked)  }
                          // onChange={ (event) => handleCheckSede(sed.idsede, event.target.checked) }
                        />
                        <Typography sx={{ fontWeight: sed.idsede === sede ? 'bold' : '' }} >{sed.nsede}</Typography>
                        <Box sx={{ flex: 1 }}/>
                        {modalidad === 1 &&
                          <Tooltip title="Cambiar oficina de atención">
                            <IconButton disabled={isSaving} onClick={ () => handleChangeSede(sed.idsede) }>
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

        <Dialog
          fullWidth
          maxWidth="xs"
          open={open}
          transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest - 1000,
          }}
        >
          <OficinasDialog
            onClose={onClose}
            oficinasLoading = {oficinasLoading}
            oficinas = {!oficinasEmpty ? oficinas : [] }
            oficina = {oficina}
            handleChangeOficina = {handleChangeOficina}
            sede = {sede}
            modalidad={modalidad}
            especialista={especialista}
            isLoad={isLoad}
            hasOffice={hasOffice}
            handleSaveSede={handleSaveSede}
          />
          
        </Dialog>

        </Stack>
      </Card>

  	</Container>
  )
}