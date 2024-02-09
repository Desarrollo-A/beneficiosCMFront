import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ListItemText from '@mui/material/ListItemText';
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { endpoints } from 'src/utils/axios';

import { usePostGeneral } from 'src/api/general';
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { fData } from 'src/utils/format-number';

import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';

import BankingContacts from './banking-contacts';
import ModalAsignarSede from './modal-asignar-sede';
import SedeItem from './sede-item';

// ----------------------------------------------------------------------

export default function SedeSnAsignar({ onDelete, sx, modalidadesData, puestosData, sedesData, ...other }) {

  const { user } = useAuthContext();

  /* const { sedData } = usePostGeneral(user.idPuesto, endpoints.gestor.getSedeNoneEsp, "sedData"); */

  const smUp = useResponsive('up', 'sm');

  const details = useBoolean();

  const modal = useBoolean();

  const [sd, setSd] = useState(0);

  const [open2, setOpen2] = useState(false);
  const [close2, setClose2] = useState(false);

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
