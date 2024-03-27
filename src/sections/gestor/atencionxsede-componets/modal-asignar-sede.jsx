import * as Yup from 'yup';
import { mutate } from 'swr';
import { useState } from 'react';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import { CircularProgress, Grid } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { useInsert } from 'src/api/encuestas';
import { usePostGeneral } from 'src/api/general';

import FormProvider from 'src/components/hook-form';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

import AddInsertSede from './add-insert-sede';

// ----------------------------------------------------------------------

export default function ModalAsignarSede({ idSede, idPuesto, open, onClose, modalidadesData }) {
  const { enqueueSnackbar } = useSnackbar();

  const loadingSend = useBoolean();

  const [es] = useState({
    // setEs
    idSd: idSede,
    idPs: idPuesto,
  });

  const [esp, setEsp] = useState([]);

  const [mod, setMod] = useState([]);

  const [selectArea, setSelectArea] = useState({ idArea: null });

  const { oficinaData } = usePostGeneral(idSede, endpoints.gestor.getOficinasVal, 'oficinaData');

  const { especiaData } = usePostGeneral(es, endpoints.gestor.getEspecialistasVal, 'especiaData');

  const insertData = useInsert(endpoints.gestor.insertAtxSede);

  const [btnLoad, setBtnLoad] = useState(false);

  const handleEsp = (newPg) => {
    setEsp(newPg);
  };

  const handleMod = (newPg) => {
    setMod(newPg);
  };

  const handleArea = (newPg) => {
    setSelectArea(newPg);
  };

  const NewInvoiceSchema = Yup.object().shape({
    items: Yup.mixed().nullable().required('Is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewInvoiceSchema),
  });

  const {
    reset,

    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const [formKey, setFormKey] = useState(0);

  const resetForm = () => {
    reset();
    setFormKey((prevKey) => prevKey + 1);
  };

  const handleCreateAndSend = handleSubmit(async (data) => {
    const combinedArray = {
      ...mod,
      ...esp,
      ...selectArea,
    };

    if (
      !isEmpty(combinedArray) &&
      !isEmpty(mod) &&
      !isEmpty(esp) &&
      Number.isInteger(selectArea.idArea)
    ) {
      try {
        

        loadingSend.onFalse();

        const insert = await insertData(combinedArray);
        console.log(insert);

        if (insert.result) {
          enqueueSnackbar(insert.msg, { variant: 'success' });
          resetForm();

          mutate(endpoints.gestor.getAtencionXsede);
          mutate(endpoints.gestor.getAtencionXsedeEsp);

          setBtnLoad(false);
        } else {
          enqueueSnackbar(insert.msg, { variant: 'error' });
          setBtnLoad(false);
        }
      } catch (error) {
        console.error(error);
        loadingSend.onFalse();
        setBtnLoad(false);
      }
    } else {
      enqueueSnackbar('Faltan Datos', { variant: 'error' });
      setBtnLoad(false);
    }
  });

  const confirm = useBoolean();

  return (
    <FormProvider methods={methods} key={formKey}>
      <DialogTitle>Asignación de sede</DialogTitle>
      {!isEmpty(oficinaData) && !isEmpty(especiaData) ? (
        <>
          {oficinaData.length !== 0 && especiaData.length !== 0 ? (
            <>
              <DialogContent>
                <AddInsertSede
                  idSede={idSede}
                  oficinaData={oficinaData}
                  especiaData={especiaData}
                  modalidadesData={modalidadesData}
                  handleMod={handleMod}
                  handleEsp={handleEsp}
                  handleArea={handleArea}
                />
              </DialogContent>

              <DialogActions>
                <Button variant="contained" color="error" onClick={onClose}>
                  Cerrar
                </Button>
                <LoadingButton
                  variant="contained"
                  color="success"
                  loading={btnLoad}
                  onClick={() => {
                    confirm.onTrue();
                  }}
                >
                  Guardar
                </LoadingButton>
              </DialogActions>

              <ConfirmDialog
                open={confirm.value}
                onClose={confirm.onFalse}
                title="¿Deseas guardar el registro?"
                action={
                  <>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => {
                        confirm.onFalse();
                      }}
                    >
                      No
                    </Button>
                    <LoadingButton
                      variant="contained"
                      color="success"
                      loading={btnLoad}
                      onClick={() => {
                        setBtnLoad(true);
                        handleCreateAndSend(1);
                        confirm.onFalse();
                      }}
                    >
                      Si
                    </LoadingButton>
                  </>
                }
              />
            </>
          ) : (
            <>
              <DialogContent>
                No hay
                {oficinaData.length === 0 && especiaData.length === 0
                  ? ' oficinas y especialistas asignados'
                  : ''}
                {oficinaData.length === 0 && especiaData.length !== 0 ? ' oficinas asignadas' : ''}
                {oficinaData.length !== 0 && especiaData.length === 0
                  ? ' especialistas asignados'
                  : ''}
              </DialogContent>

              <DialogActions>
                <Button variant="contained" color="error" onClick={onClose}>
                  Cerrar
                </Button>
              </DialogActions>
            </>
          )}
        </>
      ) : (
        <Grid container sx={{ p: 5 }} justifyContent="center" alignItems="center">
          <CircularProgress />
        </Grid>
      )}
    </FormProvider>
  );
}

ModalAsignarSede.propTypes = {
  idSede: PropTypes.any,
  idPuesto: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  modalidadesData: PropTypes.any,
};
