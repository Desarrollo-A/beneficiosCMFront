import { useState } from 'react';
import PropTypes from 'prop-types';

// import Box from '@mui/material/Box';
// import Paper from '@mui/material/Paper';
// import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
// import Button from '@mui/material/Button';
// import Accordion from '@mui/material/Accordion';
// import ListItemText from '@mui/material/ListItemText';
// import AccordionActions from '@mui/material/AccordionActions';
// import AccordionSummary from '@mui/material/AccordionSummary';
// import AccordionDetails from '@mui/material/AccordionDetails';

import { useBoolean } from 'src/hooks/use-boolean';
// import { useResponsive } from 'src/hooks/use-responsive';

// import { endpoints } from 'src/utils/axios';
// import { fData } from 'src/utils/format-number';

import { useAuthContext } from 'src/auth/hooks';
// import { usePostGeneral } from 'src/api/general';

// import Iconify from 'src/components/iconify';

import SedeItem from './sede-item';
import BankingContacts from './banking-contacts';
import ModalAsignarSede from './modal-asignar-sede';

// ----------------------------------------------------------------------

export default function SedeSnAsignar({ onDelete, sx, modalidadesData, puestosData, sedesData, ...other }) {

  const { user } = useAuthContext();

  /* const { sedData } = usePostGeneral(user.idPuesto, endpoints.gestor.getSedeNoneEsp, "sedData"); */

  // const smUp = useResponsive('up', 'sm');

  // const details = useBoolean();

  const modal = useBoolean();

  const [sd, setSd] = useState(0);

  const [open2, setOpen2] = useState(false);
  const [close2] = useState(false); // setClose2

  const handleOpen = (idSede) => {
    setOpen2(true);
    setSd(idSede);
  }

  const handleClose = () => {
    setOpen2(false);
  }

  return (
    <>

      {user.idRol === "4" || user.idRol === 4 ? (
        <BankingContacts
          list={puestosData}
          modalidadesData={modalidadesData}
          sedesData={sedesData}
        />
      ) : (
        <>
          {sedesData.map((e, index) => (
            <SedeItem key={index} sx={sx} value={e} handleOpen={handleOpen} />
          ))}
        </>
      )}

      <Dialog
        fullWidth
        maxWidth={false}
        open={open2}
        onClose={close2}
        PaperProps={{
          sx: { maxWidth: 720 },
        }}
      >
        <ModalAsignarSede
          idSede={sd}
          idPuesto={user.idPuesto}
          open={modal.value}
          onClose={handleClose}
          modalidadesData={modalidadesData}
        />
      </Dialog>

    </>
  );
}

SedeSnAsignar.propTypes = {
  onDelete: PropTypes.func,
  sx: PropTypes.object,
  modalidadesData: PropTypes.any,
  puestosData: PropTypes.any,
  sedesData: PropTypes.any,
};
