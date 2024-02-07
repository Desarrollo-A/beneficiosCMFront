import * as Yup from 'yup';
import { mutate } from 'swr';
import { useState } from 'react';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
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

  const [es, setEs] = useState({
    idSd: idSede,
    idPs: idPuesto
  });

  const [esp, setEsp] = useState([]);

  const [mod, setMod] = useState([]);

  const { oficinaData } = usePostGeneral(idSede, endpoints.gestor.getOficinasVal, "oficinaData");

  const { especiaData } = usePostGeneral(es, endpoints.gestor.getEspecialistasVal, "especiaData");

  const insertData = useInsert(endpoints.gestor.insertAtxSede);

  const handleEsp = (newPg) => {
    setEsp(newPg);
  }

  const handleMod = (newPg) => {
    setMod(newPg);
  }

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
    };
  

    if (!isEmpty(combinedArray)) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        loadingSend.onFalse();

        const insert = await insertData(combinedArray);

        if (insert.estatus === true) {
          enqueueSnackbar(insert.msj, { variant: 'success' });
          resetForm();

          mutate(endpoints.gestor.getAtencionXsede);
          mutate(endpoints.gestor.getAtencionXsedeEsp);

        } else {
          enqueueSnackbar(insert.msj, { variant: 'error' });
        }

      } catch (error) {
        console.error(error);
        loadingSend.onFalse();
      }

    } else {
      enqueueSnackbar("Faltan Datos", { variant: 'error' });
    }

  });

  const confirm = useBoolean();

  return (
    
      <FormProvider methods={methods} key={formKey}>
        <DialogTitle>Asignación de sede</DialogTitle>

        {oficinaData.length !== 0 && especiaData.length !== 0 ? (

          <>
            <DialogContent>

              <AddInsertSede 
              idSede={idSede} 
              oficinaData={oficinaData} 
              especiaData={especiaData} 
              modalidadesData={modalidadesData}
              handleMod={handleMod}
              handleEsp={handleEsp} />

            </DialogContent>

            <DialogActions>

              <Button
                variant="contained"
                color="success"
                loading={loadingSend.value && isSubmitting}
                onClick={() => {
                  confirm.onTrue();
                }}>
                Guardar
              </Button>
              <Button variant="contained" color="error" onClick={onClose}>
                Cerrar
              </Button>

            </DialogActions>


            <ConfirmDialog
              open={confirm.value}
              onClose={confirm.onFalse}
              title="¿Deseas guardar los registros?"
              action={
                <>
                  <Button variant="contained" onClick={() => {
                    handleCreateAndSend(1);
                    confirm.onFalse();
                    onClose();
                  }}>
                    Si
                  </Button>
                  <Button variant="contained" onClick={() => {
                    confirm.onFalse();
                  }}>
                    No
                  </Button>
                </>
              }
            />
          </>
        ) : (
          <>
            <DialogContent >No hay
              {oficinaData.length === 0 && especiaData.length === 0 ? " oficinas y especialistas asignados" : ""}
              {oficinaData.length === 0 && especiaData.length !== 0 ? " oficinas asignadas" : ""}
              {oficinaData.length !== 0 && especiaData.length === 0 ? " especialistas asignados" : ""}
            </DialogContent>

            <DialogActions>

              <Button variant="contained" color="error" onClick={onClose}>
                Cerrar
              </Button>

            </DialogActions>

          </>
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
