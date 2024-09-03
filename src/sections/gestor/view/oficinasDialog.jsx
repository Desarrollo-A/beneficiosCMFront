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

import Scrollbar from 'src/components/scrollbar';
import FormProvider from 'src/components/hook-form/form-provider';

export default function OficinasDialog({ onClose, oficinasLoading, oficinas, sede, modalidad, especialista, oficina, handleChangeOficina, isLoad, hasOffice }) {
  const HEIGHT = 600;

  const [isDisable, setDisable] = useState(true)
  const [nuevaOficina, setNuevaOficina] = useState(0)

  useEffect(() => {
    if(nuevaOficina === 0){
        setDisable(true)
    }
    else{
        setDisable(false)
    }
  }, [oficina, nuevaOficina])

  useEffect(() => {
    if(oficina === null){
        setNuevaOficina(0)
    }
    else{
        setNuevaOficina(oficina)
    }
    
  }, [oficina, sede])

  const handleChangeNuevaOficina = (idOficina) => {
    setNuevaOficina(idOficina)
  }

  const onSubmit = async () => {
    handleChangeOficina(nuevaOficina)
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
                  value={nuevaOficina}
                  onChange={(event) => handleChangeNuevaOficina(event.target.value)}
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
        {/* {hasOffice && */}
            <Button variant="contained" color="error" disabled={isLoad} onClick={onClose}>
                Cerrar
            </Button>
        {/* }         */}

        <LoadingButton variant="contained" color="success" loading={isLoad} disabled={isDisable} onClick={onSubmit}>
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
  oficina: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), // se agrega 2 tipos diferentes por el evnio y regreso
  sede: PropTypes.number,
  modalidad: PropTypes.number,
  especialista: PropTypes.number,
  handleChangeOficina: PropTypes.func,
  isLoad: PropTypes.bool,
  hasOffice: PropTypes.bool
};
