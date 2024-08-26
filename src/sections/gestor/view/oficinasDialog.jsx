import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Typography, DialogTitle } from '@material-ui/core';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  List,
  Stack,
  Radio,
  Button,
  Divider,
  RadioGroup,
  FormControl,
  DialogContent,
  DialogActions,
  LinearProgress,
  FormControlLabel
} from '@mui/material';

import { getActiveSedes } from 'src/api/especialistas'

import Scrollbar from 'src/components/scrollbar';
import FormProvider from 'src/components/hook-form/form-provider';

export default function OficinasDialog({ onClose, oficinasLoading, oficinas, sede, modalidad, especialista }) {
  const HEIGHT = 600;

  const [oficina, setOficina] = useState([])
  const [ activas, setActivas ] = useState([])
  const [isDisable, setDisable] = useState()
console.log(oficina);

  const handleChangeOficina = (ofi) => {
    setOficina(ofi)

    const index = activas.findIndex(sed => sed.idSede === sede)

    activas[index].idOficina = ofi
  }

  const getActivas = async() => {
    const act = await getActiveSedes({modalidad, especialista})

    setActivas(act)
  }

  useEffect(() => {
    if(modalidad){
      getActivas()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalidad])

  const onSubmit = async (data) => {
    // await saveOficinaXSede({especialista, modalidad, sede, oficina: ofi})
  }
 
  return (
    <FormProvider>
      <DialogTitle sx={{ p: { xs: 1, md: 1 } }}>
        <Typography>Selecciona una oficina para asignar</Typography>
      </DialogTitle>

      <DialogContent>
        <Stack sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ marginBottom: 1, paddingLeft: 1 }}>
            Oficina
          </Typography>
          {oficinasLoading ? <LinearProgress /> : <Divider flexItem orientation="horizontal" />}
          <Scrollbar sx={{ height: HEIGHT, overflowX: 'hidden', margin: 0, padding: 0 }}>
            <List>
              <FormControl>
                <RadioGroup
                  value={oficina}
                  onChange={(event) => handleChangeOficina(event.target.value)}
                >
                  {oficinas.map((ofi, index) => (
                    <Box key={index} sx={{ marginBottom: 0.5 }}>
                      <FormControlLabel
                        sx={{ marginLeft: 1.5, marginBottom: 0.5 }}
                        value={ofi.idoficina}
                        control={<Radio />}
                        label={ofi.noficina}
                      />
                    </Box>
                  ))}
                </RadioGroup>
              </FormControl>
            </List>
          </Scrollbar>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="error" onClick={onClose}>
          Cerrar
        </Button>

        <LoadingButton variant="contained" color="success" disabled={isDisable} onClick={onSubmit}>
          Guardar
        </LoadingButton>
      </DialogActions>
    </FormProvider>
  );
}

OficinasDialog.propTypes = {
  onClose: PropTypes.func,
  oficinasLoading: PropTypes.bool,
  oficinas: PropTypes.array,
  sede: PropTypes.number,
  modalidad: PropTypes.number,
  especialista: PropTypes.number
};
